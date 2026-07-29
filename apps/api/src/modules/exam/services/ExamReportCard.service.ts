import { supabase } from '../../../config/supabase';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
const archiver = require('archiver');

export const ExamReportCardService = {
    /**
     * Generate individual PDF for a student based on versioned snapshot
     */
    async generateStudentPDF(examId: string, studentId: string, schoolId: string): Promise<Buffer> {
        // 1. Fetch Latest Snapshot
        const { data: version, error: verError } = await supabase
            .from('exam_result_versions')
            .select('*')
            .eq('exam_id', examId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        if (verError || !version) {
            throw new Error("PUBLISHED_RESULT_NOT_FOUND: No published version found for this exam.");
        }

        const snapshot = version.snapshot as any;
        const studentSummary = snapshot.summaries.find((s: any) => s.student_id === studentId);
        const studentMarks = snapshot.marks.filter((m: any) => m.student_id === studentId);

        if (!studentSummary) {
            throw new Error("STUDENT_NOT_IN_SNAPSHOT: Student data missing from localized snapshot.");
        }

        // 2. Data for Template
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        const { data: exam } = await supabase.from('exams').select('name').eq('id', examId).single();

        // Template path - we reuse the mark-sheet template (need to ensure it exists or create one)
        const templatePath = path.join(__dirname, '../templates/report-card.template.html');
        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(templatePath, 'utf8');
        } catch (e) {
            // Fallback basic template if not found
            htmlContent = `<html><body><h1>Report Card: {{studentName}}</h1><p>Result: {{resultStatus}}</p></body></html>`;
        }

        // Render Subject Rows
        let markRows = '';
        studentMarks.forEach((m: any) => {
            markRows += `
                <tr>
                    <td>${m.subject_name}</td>
                    <td>100</td>
                    <td>${m.marks_obtained}</td>
                    <td>${m.marks_obtained >= 35 ? 'PASS' : 'FAIL'}</td>
                </tr>
            `;
        });

        const replacements: any = {
            '{{schoolName}}': school?.name || 'School Management System',
            '{{schoolAddress}}': school?.address || '',
            '{{examName}}': exam?.name || 'Academic Examination',
            '{{studentName}}': studentSummary.full_name,
            '{{studentCode}}': studentSummary.student_code,
            '{{totalObtained}}': studentSummary.total_obtained,
            '{{percentage}}': `${studentSummary.percentage}%`,
            '{{grade}}': studentSummary.grade || 'N/A',
            '{{rank}}': studentSummary.rank || 'N/A',
            '{{resultStatus}}': studentSummary.result_status || 'N/A',
            '{{markRows}}': markRows,
            '{{publishedAt}}': new Date(snapshot.metadata.published_at).toLocaleDateString()
        };

        Object.keys(replacements).forEach(key => {
            htmlContent = htmlContent.split(key).join(replacements[key] || '');
        });

        // 3. Browser Rendering
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1240, height: 1754 });
            await page.setContent(htmlContent, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true
            });

            return Buffer.from(pdfBuffer);
        } finally {
            await browser.close();
        }
    },

    /**
     * Generate bulk ZIP of report cards
     */
    async bulkDownloadZIP(examId: string, schoolId: string): Promise<Buffer> {
        const { data: version } = await supabase
            .from('exam_result_versions')
            .select('*')
            .eq('exam_id', examId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        if (!version) throw new Error("SNAPSHOT_NOT_FOUND");

        const snapshot = version.snapshot as any;
        const students = snapshot.summaries;

        const archive = archiver('zip', { zlib: { level: 9 } });
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        return new Promise<Buffer>(async (resolve, reject) => {
            const chunks: Buffer[] = [];
            archive.on('data', (chunk: Buffer) => chunks.push(chunk));
            archive.on('end', () => resolve(Buffer.concat(chunks)));
            archive.on('error', (err: Error) => reject(err));

            try {
                for (const student of students) {
                    const pdf = await this.renderSingleBuffer(browser, student, snapshot, schoolId);
                    archive.append(pdf, { name: `ReportCard_${student.student_code}.pdf` });
                }
                await archive.finalize();
            } catch (err) {
                reject(err);
            } finally {
                await browser.close();
            }
        });
    },

    // Internal helper for bulk rendering reuse
    async renderSingleBuffer(browser: any, studentSummary: any, snapshot: any, schoolId: string): Promise<Buffer> {
        const studentMarks = snapshot.marks.filter((m: any) => m.student_id === studentSummary.student_id);
        const templatePath = path.join(__dirname, '../templates/report-card.template.html');
        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(templatePath, 'utf8');
        } catch (e) {
            htmlContent = `<html><body><h1>Report Card: {{studentName}}</h1></body></html>`;
        }

        let markRows = '';
        studentMarks.forEach((m: any) => {
            markRows += `<tr><td>${m.subject_name}</td><td>100</td><td>${m.marks_obtained}</td><td>${m.marks_obtained >= 35 ? 'PASS' : 'FAIL'}</td></tr>`;
        });

        const replacements: any = {
            '{{studentName}}': studentSummary.full_name,
            '{{studentCode}}': studentSummary.student_code,
            '{{markRows}}': markRows,
            '{{totalObtained}}': studentSummary.total_obtained,
            '{{percentage}}': `${studentSummary.percentage}%`,
            '{{grade}}': studentSummary.grade,
            '{{rank}}': studentSummary.rank,
            '{{resultStatus}}': studentSummary.result_status
        };

        Object.keys(replacements).forEach(key => { htmlContent = htmlContent.split(key).join(replacements[key] || ''); });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await page.close();
        return Buffer.from(pdf);
    }
};

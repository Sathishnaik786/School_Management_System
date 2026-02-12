import { supabase } from '../../../config/supabase';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
const archiver = require('archiver');

export const ExamProgressReportService = {
    /**
     * Generate individual Progress Report PDF for a student based on versioned snapshot
     */
    async generateProgressReportPDF(examId: string, studentId: string, schoolId: string): Promise<Buffer> {
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

        if (!studentSummary) {
            throw new Error("STUDENT_NOT_IN_SNAPSHOT: Student data missing from localized snapshot.");
        }

        // 2. Data for Template
        const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        const { data: exam } = await supabase.from('exams').select('name').eq('id', examId).single();

        const templatePath = path.join(__dirname, '../templates/progress-report.template.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Scholastic Rows
        const scholastic = studentSummary.scholastic_components || {};
        let scholasticRows = '';
        Object.entries(scholastic).forEach(([subName, scores]: [string, any]) => {
            scholasticRows += `
                <tr>
                    <td class="subject-col">${subName}</td>
                    <td>${scores.pen_paper_test || '-'}</td>
                    <td>${scores.multiple_assessment || '-'}</td>
                    <td>${scores.subject_enrichment || '-'}</td>
                    <td>${scores.portfolio || '-'}</td>
                    <td>${scores.annual_exam || '-'}</td>
                    <td>${scores.total || '-'}</td>
                    <td>${scores.grade || '-'}</td>
                </tr>
            `;
        });

        // Co-Scholastic Rows
        const coScholastic = studentSummary.co_scholastic || {};
        const coScholEntries = Object.entries(coScholastic);
        const half = Math.ceil(coScholEntries.length / 2);

        let coScholRowsLeft = '';
        coScholEntries.slice(0, half).forEach(([act, grade]) => {
            coScholRowsLeft += `<tr><td>${act}</td><td>${grade}</td></tr>`;
        });

        let coScholRowsRight = '';
        coScholEntries.slice(half).forEach(([act, grade]) => {
            coScholRowsRight += `<tr><td>${act}</td><td>${grade}</td></tr>`;
        });

        const replacements: any = {
            '{{schoolName}}': school?.name || 'School Management System',
            '{{affiliationNo}}': school?.affiliation_no || 'N/A',
            '{{schoolAddress}}': school?.address || '',
            '{{academicSession}}': studentSummary.academic_year_label_snapshot || '2025-26',
            '{{studentName}}': studentSummary.full_name,
            '{{fatherName}}': studentSummary.father_name || '-',
            '{{motherName}}': studentSummary.mother_name || '-',
            '{{dob}}': studentSummary.dob || '-',
            '{{className}}': studentSummary.class_name || '-',
            '{{sectionName}}': studentSummary.section_name || '-',
            '{{admissionNo}}': studentSummary.student_code,
            '{{rollNo}}': studentSummary.roll_no || '-',
            '{{house}}': studentSummary.house || '-',
            '{{photoPlaceholder}}': 'STUDENT PHOTO',
            '{{scholasticRows}}': scholasticRows,
            '{{coScholasticRowsLeft}}': coScholRowsLeft,
            '{{coScholasticRowsRight}}': coScholRowsRight,
            '{{attendancePresent}}': studentSummary.attendance_snapshot?.present_days || '-',
            '{{attendanceWorking}}': studentSummary.attendance_snapshot?.working_days || '-',
            '{{promotionStatus}}': studentSummary.promotion_status || 'Under Evaluation',
            '{{teacherRemarks}}': studentSummary.teacher_remarks || 'Keep up the good work.',
            '{{generationDate}}': new Date().toLocaleDateString()
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
                waitUntil: 'networkidle0',
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
     * Bulk ZIP Download
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
                    const pdf = await this.renderSingleBuffer(browser, student, schoolId);
                    archive.append(pdf, { name: `ProgressReport_${student.student_code}.pdf` });
                }
                await archive.finalize();
            } catch (err) {
                reject(err);
            } finally {
                await browser.close();
            }
        });
    },

    async renderSingleBuffer(browser: any, studentSummary: any, schoolId: string): Promise<Buffer> {
        const templatePath = path.join(__dirname, '../templates/progress-report.template.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Scholastic Rows
        const scholastic = studentSummary.scholastic_components || {};
        let scholasticRows = '';
        Object.entries(scholastic).forEach(([subName, scores]: [string, any]) => {
            scholasticRows += `
                <tr>
                    <td class="subject-col">${subName}</td>
                    <td>${scores.pen_paper_test || '-'}</td>
                    <td>${scores.multiple_assessment || '-'}</td>
                    <td>${scores.subject_enrichment || '-'}</td>
                    <td>${scores.portfolio || '-'}</td>
                    <td>${scores.annual_exam || '-'}</td>
                    <td>${scores.total || '-'}</td>
                    <td>${scores.grade || '-'}</td>
                </tr>
            `;
        });

        // Co-Scholastic
        const coScholastic = studentSummary.co_scholastic || {};
        const coScholEntries = Object.entries(coScholastic);
        const half = Math.ceil(coScholEntries.length / 2);
        let coLeft = ''; coScholEntries.slice(0, half).forEach(([a, g]) => coLeft += `<tr><td>${a}</td><td>${g}</td></tr>`);
        let coRight = ''; coScholEntries.slice(half).forEach(([a, g]) => coRight += `<tr><td>${a}</td><td>${g}</td></tr>`);

        const replacements: any = {
            '{{schoolName}}': 'School Management System',
            '{{academicSession}}': studentSummary.academic_year_label_snapshot || '-',
            '{{studentName}}': studentSummary.full_name,
            '{{fatherName}}': studentSummary.father_name || '-',
            '{{className}}': studentSummary.class_name || '-',
            '{{sectionName}}': studentSummary.section_name || '-',
            '{{admissionNo}}': studentSummary.student_code,
            '{{scholasticRows}}': scholasticRows,
            '{{coScholasticRowsLeft}}': coLeft,
            '{{coScholasticRowsRight}}': coRight,
            '{{attendancePresent}}': studentSummary.attendance_snapshot?.present_days || '-',
            '{{attendanceWorking}}': studentSummary.attendance_snapshot?.working_days || '-',
            '{{promotionStatus}}': studentSummary.promotion_status || '-',
            '{{teacherRemarks}}': studentSummary.teacher_remarks || '-',
            '{{generationDate}}': new Date().toLocaleDateString()
        };

        Object.keys(replacements).forEach(key => {
            htmlContent = htmlContent.split(key).join(replacements[key] || '');
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await page.close();
        return Buffer.from(pdf);
    }
};

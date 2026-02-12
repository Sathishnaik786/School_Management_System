import { Request, Response } from 'express';
import { ExamExportService } from '../services/examExport.service';

export const ExamExportController = {
    /**
     * Export Results to CSV (Compliance Format)
     */
    async exportResults(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "examId required" });

            const data = await ExamExportService.getComplianceExportData(examId as string);

            // If empty, just return 204 or empty json
            if (data.length === 0) return res.status(204).send();

            // CSV injection sanitization
            const sanitize = (val: any) => {
                const str = String(val || '');
                if (['=', '+', '-', '@'].some(char => str.startsWith(char))) {
                    return `'${str}`;
                }
                return str;
            };

            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${sanitize((row as any)[h])}"`).join(','))
            ];

            const csvString = csvRows.join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=exam_results_${examId}.csv`);
            res.status(200).send(csvString);

        } catch (err: any) {
            console.error("Export Results Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Export Performance / Conduct Report
     */
    async exportConductReport(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "examId required" });

            const data = await ExamExportService.getConductExportData(examId as string);

            if (data.length === 0) return res.status(204).send();

            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(','))
            ];

            const csvString = csvRows.join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=exam_conduct_${examId}.csv`);
            res.send(csvString);

        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Export Audit Trail
     */
    async exportAuditTrail(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            const data = await ExamExportService.getAuditExportData(examId as string);

            if (data.length === 0) return res.status(204).send();

            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(','))
            ];

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=exam_audit_${examId}.csv`);
            res.send(csvRows.join('\n'));
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};

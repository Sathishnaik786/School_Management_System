import { Request, Response } from 'express';
import { ExamEligibilityService } from '../services/examEligibility.service';

export const ExamEligibilityController = {
    async checkEligibility(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.query;

            if (!examId || !studentId) {
                return res.status(400).json({ error: "Missing examId or studentId" });
            }

            const result = await ExamEligibilityService.checkEligibility(
                studentId as string,
                examId as string
            );

            res.json(result);
        } catch (err: any) {
            console.error("Eligibility Check Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};

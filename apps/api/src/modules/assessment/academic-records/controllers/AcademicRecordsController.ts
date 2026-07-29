import { Request, Response } from 'express';
import { AcademicRecordRepository } from '../repositories/AcademicRecordRepository';
import { AcademicRecordService } from '../services/AcademicRecordService';
import { AcademicStandingEngine } from '../services/AcademicStandingEngine';
import { AcademicRecordsValidator } from '../validators/AcademicRecordsValidator';

export class AcademicRecordsController {
    private static repo = new AcademicRecordRepository();
    private static service = new AcademicRecordService();
    private static standingEngine = new AcademicStandingEngine();

    public static async saveRecord(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context credentials missing.' });

            const validated = AcademicRecordsValidator.validateAcademicRecord(req.body);
            const data = await AcademicRecordsController.service.registerPublishedResult(
                schoolId,
                validated.student_id,
                validated.cgpa,
                validated.total_credits
            );

            // Re-evaluate standing check on new result registration
            await AcademicRecordsController.standingEngine.evaluateStanding(
                schoolId,
                validated.student_id,
                validated.cgpa,
                0 // 0 mock backlogs for evaluation
            );

            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to save academic record.' });
        }
    }
}
export default AcademicRecordsController;

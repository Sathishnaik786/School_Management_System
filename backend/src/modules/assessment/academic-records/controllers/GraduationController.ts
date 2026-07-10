import { Request, Response } from 'express';
import { GraduationWorkflowService } from '../services/GraduationWorkflowService';
import { GraduationRepository } from '../repositories/GraduationRepository';
import { AcademicRecordsValidator } from '../validators/AcademicRecordsValidator';

export class GraduationController {
    private static workflowService = new GraduationWorkflowService();
    private static repo = new GraduationRepository();

    public static async transitionGraduation(req: Request, res: Response): Promise<Response> {
        try {
            const validated = AcademicRecordsValidator.validateGraduationApproval(req.body);
            const data = await GraduationController.workflowService.transitionGraduation(
                validated.student_id,
                validated.status
            );
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to update graduation candidacy.' });
        }
    }

    public static async approveClearance(req: Request, res: Response): Promise<Response> {
        try {
            const { student_id, clearance_type } = req.body;
            const data = await GraduationController.repo.approveClearance(student_id, clearance_type);
            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to signoff clearance item.' });
        }
    }
}
export default GraduationController;

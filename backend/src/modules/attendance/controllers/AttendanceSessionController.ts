import { Request, Response } from 'express';
import { AttendanceSessionRepository } from '../repositories/AttendanceSessionRepository';
import { AttendanceSessionService } from '../services/AttendanceSessionService';
import { AttendanceValidator } from '../validators/AttendanceValidator';

export class AttendanceSessionController {
    private static repo = new AttendanceSessionRepository();
    private static service = new AttendanceSessionService();

    public static async listSessions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await AttendanceSessionController.repo.listSessions(schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list attendance sessions.' });
        }
    }

    public static async createSession(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'Context details missing.' });

            const validated = AttendanceValidator.validateCreateSession(req.body);
            const session = await AttendanceSessionController.service.createDailySession(schoolId, validated);
            return res.status(201).json(session);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to create attendance session.' });
        }
    }
}
export default AttendanceSessionController;

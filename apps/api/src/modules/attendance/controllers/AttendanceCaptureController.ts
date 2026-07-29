import { Request, Response } from 'express';
import { AttendanceCaptureService } from '../services/AttendanceCaptureService';
import { AttendanceValidationService } from '../services/AttendanceValidationService';
import { AttendanceValidator } from '../validators/AttendanceValidator';

export class AttendanceCaptureController {
    private static captureService = new AttendanceCaptureService();
    private static validationService = new AttendanceValidationService();

    public static async markStudent(req: Request, res: Response): Promise<Response> {
        try {
            const userId = (req as any).context?.user?.id;
            if (!userId) return res.status(400).json({ error: 'Context details missing.' });

            const validated = AttendanceValidator.validateMarkAttendance(req.body);
            
            // Validate leave overlaps before capturing checkins
            await AttendanceCaptureController.validationService.validateMarking(
                validated.student_id,
                new Date().toISOString().split('T')[0]
            );

            const record = await AttendanceCaptureController.captureService.captureStudentMark(
                validated,
                userId
            );

            return res.status(201).json(record);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to capture attendance.' });
        }
    }
}
export default AttendanceCaptureController;

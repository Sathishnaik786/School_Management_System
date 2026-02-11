import { Request, Response } from 'express';
import { ExamAdminBridgeService } from '../services/examAdminBridge.service';

export const ExamAdminBridgeController = {
    /**
     * Set authoritative attendance for a student
     */
    async setAttendance(req: Request, res: Response) {
        try {
            const { studentId, academicYearId, percentage, term } = req.body;
            const userId = req.context?.user?.id;

            if (!studentId || !academicYearId || percentage === undefined || !userId) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const result = await ExamAdminBridgeService.setAttendance({
                studentId,
                academicYearId,
                percentage,
                userId,
                term
            });

            res.json(result);
        } catch (err: any) {
            console.error("Set Attendance Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Set authoritative fee status for a student
     */
    async setFeeStatus(req: Request, res: Response) {
        try {
            const { studentId, academicYearId, status, term, remarks } = req.body;
            const userId = req.context?.user?.id;

            if (!studentId || !academicYearId || !status || !userId) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const result = await ExamAdminBridgeService.setFeeStatus({
                studentId,
                academicYearId,
                status,
                userId,
                term,
                remarks
            });

            res.json(result);
        } catch (err: any) {
            console.error("Set Fee Status Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get bridge data (students + cache) for a class
     */
    async getClassBridgeData(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const { academicYearId } = req.query;

            if (!classId || !academicYearId) {
                return res.status(400).json({ error: "Class ID and Academic Year ID required" });
            }

            const data = await ExamAdminBridgeService.getClassBridgeData(
                classId,
                academicYearId as string
            );

            res.json(data);
        } catch (err: any) {
            console.error("Get Class Bridge Data Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};

import { Request, Response } from 'express';
import { ResultPublishService } from '../services/resultPublish.service';

import { ExamNotificationService } from '../services/examNotification.service';

export const ResultPublishController = {
    async publishResults(req: Request, res: Response) {
        try {
            const { examId } = req.body;
            const userId = req.context!.user.id;

            if (!examId) {
                return res.status(400).json({ error: "examId is required" });
            }

            // Ensure only ADMIN can publish (Double check, although middleware handles this)
            // Middleware checkPermission(PERMISSIONS.EXAM_PUBLISH) should be used in routes if possible,
            // or we use existing overly generic ones + role check. 
            // Task says "Only Admin role allowed".
            if (!req.context!.user.roles.includes('ADMIN')) {
                return res.status(403).json({ error: "Only Admins can publish results." });
            }

            const result = await ResultPublishService.publishExamResults(examId, userId);
            res.json({ message: "Results published successfully", ...result });

            // Hook: Notify
            ExamNotificationService.notifyResultsPublished(examId);

        } catch (err: any) {
            console.error("Publish Results Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};

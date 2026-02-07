import { Request, Response } from 'express';
import { ExamScheduleService } from '../services/examSchedule.service';
import { ExamNotificationService } from '../services/examNotification.service';

export const ExamScheduleController = {
    async createSchedule(req: Request, res: Response) {
        try {
            const { exam_id, subject_id, exam_date, start_time, end_time, max_marks, passing_marks } = req.body;

            if (!exam_id || !subject_id || !exam_date || !start_time || !end_time) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // Simple validation for time
            if (start_time >= end_time) {
                return res.status(400).json({ error: "End time must be after start time" });
            }

            const schedule = await ExamScheduleService.createSchedule({
                exam_id,
                subject_id,
                exam_date,
                start_time,
                end_time,
                max_marks,
                passing_marks
            });

            res.status(201).json(schedule);

            // Hook: Notify
            if (schedule && schedule.id) {
                ExamNotificationService.notifySchedulePublished(schedule.id);
            }

        } catch (err: any) {
            console.error("Create Schedule Error:", err);
            // Handle duplicate constraint error
            if (err.code === '23505') {
                return res.status(409).json({ error: "Schedule already exists for this subject in this exam" });
            }
            res.status(500).json({ error: err.message });
        }
    },

    async getSchedules(req: Request, res: Response) {
        try {
            const { examId } = req.query;

            if (!examId) {
                return res.status(400).json({ error: "examId is required" });
            }

            const schedules = await ExamScheduleService.getSchedulesByExam(examId as string);
            res.json(schedules);
        } catch (err: any) {
            console.error("Get Schedules Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};

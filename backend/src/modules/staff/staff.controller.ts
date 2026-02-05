import { Request, Response } from 'express';
import { StaffService } from './staff.service';

export const StaffController = {
    async getAllProfiles(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const { page, limit, search } = req.query;

            const result = await StaffService.getAllProfiles(
                schoolId,
                Number(page) || 1,
                Number(limit) || 10,
                search as string
            );
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async createProfile(req: Request, res: Response) {
        try {
            const { user_id, department_id, staff_type, joining_date } = req.body;

            if (!user_id || !staff_type) return res.status(400).json({ error: "User ID and Staff Type required" });

            const profile = await StaffService.createProfile({
                user_id, department_id, staff_type, joining_date
            });
            res.status(201).json(profile);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateProfile(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            delete updates.id;
            delete updates.user_id;

            const profile = await StaffService.updateProfile(id, updates);
            res.json(profile);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['active', 'inactive'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const profile = await StaffService.updateStatus(id, status);
            res.json(profile);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};

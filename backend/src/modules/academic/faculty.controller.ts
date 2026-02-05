import { Request, Response } from 'express';
import { FacultyService } from './faculty.service';

export const FacultyController = {
    async getAllProfiles(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const { page, limit, search } = req.query;

            const result = await FacultyService.getAllProfiles(
                schoolId,
                Number(page) || 1,
                Number(limit) || 10,
                search as string
            );
            res.json(result);
        } catch (error: any) {
            console.error(`[FacultyController] Error:`, error);
            res.status(500).json({ error: error.message });
        }
    },

    async createProfile(req: Request, res: Response) {
        try {
            const { user_id, employee_code, department_id, designation, qualification, joining_date } = req.body;

            if (!user_id) return res.status(400).json({ error: "User ID is required" });

            const profile = await FacultyService.createProfile({
                user_id, employee_code, department_id, designation, qualification, joining_date
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
            delete updates.id; // Prevent ID update
            delete updates.user_id; // Prevent User ID update

            const profile = await FacultyService.updateProfile(id, updates);
            res.json(profile);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['active', 'inactive', 'on_leave'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const profile = await FacultyService.updateStatus(id, status);
            res.json(profile);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async assignSubject(req: Request, res: Response) {
        try {
            const { sectionId, subjectId } = req.params;
            const { faculty_profile_id } = req.body;
            const assignedBy = req.context!.user.id;

            if (!faculty_profile_id) return res.status(400).json({ error: "Faculty Profile ID required" });

            const assignment = await FacultyService.assignSubjectToSection({
                section_id: sectionId,
                subject_id: subjectId,
                faculty_profile_id,
                assigned_by: assignedBy
            });

            res.status(201).json(assignment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async getSectionAssignments(req: Request, res: Response) {
        try {
            const { sectionId } = req.params;
            const assignments = await FacultyService.getSectionAssignments(sectionId);
            res.json(assignments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getMySubjects(req: Request, res: Response) {
        try {
            const userId = req.context!.user.id;
            const subjects = await FacultyService.getMySubjects(userId);
            res.json(subjects);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateMySubjectAssignment(req: Request, res: Response) {
        try {
            const userId = req.context!.user.id;
            const { assignmentId } = req.params;
            const updates = req.body;
            // Prevent changing core IDs
            delete updates.id;
            delete updates.faculty_profile_id;
            delete updates.section_id;
            delete updates.subject_id;

            const result = await FacultyService.updateAssignment(assignmentId, updates, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
};

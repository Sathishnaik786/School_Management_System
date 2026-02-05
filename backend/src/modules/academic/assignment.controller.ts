import { Request, Response } from 'express';
import { AssignmentService } from './assignment.service';

export class AssignmentController {
    static async create(req: Request, res: Response) {
        try {
            const { school_id, id: userId } = req.context!.user;
            const { academic_year_id, section_id, subject_id, title, description, due_date, max_marks, file_url } = req.body;

            const assignment = await AssignmentService.create({
                school_id,
                academic_year_id,
                section_id,
                subject_id,
                teacher_user_id: userId,
                title,
                description,
                due_date,
                max_marks,
                file_url
            });

            res.status(201).json(assignment);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBySection(req: Request, res: Response) {
        try {
            const { sectionId } = req.params;
            const assignments = await AssignmentService.listBySection(sectionId);
            res.json(assignments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMyAssignments(req: Request, res: Response) {
        try {
            const { studentId } = req.params; // Admin/Teacher viewing specific student or parent viewing child
            const assignments = await AssignmentService.getMyAssignments(studentId);
            res.json(assignments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTeacherAssignments(req: Request, res: Response) {
        try {
            const userId = req.context!.user.id;
            const assignments = await AssignmentService.listByTeacher(userId);
            res.json(assignments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

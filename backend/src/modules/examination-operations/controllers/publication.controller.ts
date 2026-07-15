import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class PublicationController {

    static async listPublications(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { data, error } = await supabase
                .from('exam_result_publications')
                .select('*, exams(id, name, code), approval_history(*)')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async getPublication(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exam_result_publications')
                .select('*, exams(*), approval_history(*, users(id, email, first_name, last_name))')
                .eq('id', id).eq('school_id', schoolId).single();
            if (error) throw error;
            if (!data) return res.status(404).json({ error: 'Publication not found.' });
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async initiate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_id } = req.body;
            if (!exam_id) return res.status(400).json({ error: 'exam_id required.' });

            const { data, error } = await supabase
                .from('exam_result_publications')
                .insert({ school_id: schoolId, exam_id, status: 'EVALUATED', frozen: false })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async advance(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            const { comments, action } = req.body; // action: 'APPROVE' | 'ROLLBACK'

            const workflow = ['EVALUATED', 'AUTO_VALIDATION', 'MODERATOR', 'EXAM_CELL', 'PRINCIPAL', 'PUBLISHED'];
            const { data: pub } = await supabase
                .from('exam_result_publications').select('*').eq('id', id).eq('school_id', schoolId).single();
            if (!pub) return res.status(404).json({ error: 'Publication not found.' });
            if (pub.frozen) return res.status(400).json({ error: 'Publication is frozen and cannot be modified.' });

            const currentIdx = workflow.indexOf(pub.status);
            let newStatus = pub.status;
            let histAction = 'APPROVED';

            if (action === 'ROLLBACK' && currentIdx > 0) {
                newStatus = workflow[currentIdx - 1];
                histAction = 'ROLLBACK';
            } else if (action !== 'ROLLBACK' && currentIdx < workflow.length - 1) {
                newStatus = workflow[currentIdx + 1];
            }

            const { data, error } = await supabase
                .from('exam_result_publications')
                .update({ status: newStatus, published_at: newStatus === 'PUBLISHED' ? new Date().toISOString() : pub.published_at, updated_at: new Date().toISOString() })
                .eq('id', id).select().single();
            if (error) throw error;

            await supabase.from('approval_history').insert({
                school_id: schoolId, publication_id: id,
                stage: pub.status, approved_by: userId, status: histAction, comments
            });

            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async freeze(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exam_result_publications')
                .update({ frozen: true, updated_at: new Date().toISOString() })
                .eq('id', id).eq('school_id', schoolId).select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}

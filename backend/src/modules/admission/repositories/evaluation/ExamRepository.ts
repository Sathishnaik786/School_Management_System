import { IExamRepository } from './interfaces/IExamRepository';
import { ExamTemplate } from '../../domain/evaluation/ExamTemplate';
import { ExamSchedule, ExamStatus } from '../../domain/evaluation/ExamSchedule';
import { ExamResult } from '../../domain/evaluation/ExamResult';
import { HallTicket } from '../../domain/evaluation/HallTicket';
import { supabase } from '../../../../config/supabase';

export class ExamRepository implements IExamRepository {
    public async findTemplateById(id: string): Promise<ExamTemplate | null> {
        const { data, error } = await supabase
            .from('admission_exam_templates')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data ? new ExamTemplate(data.id, data.name, data.grade, data.duration, data.total_marks, data.passing_marks, new Date(data.created_at), new Date(data.updated_at)) : null;
    }

    public async findTemplateByGrade(grade: string): Promise<ExamTemplate | null> {
        const { data, error } = await supabase
            .from('admission_exam_templates')
            .select('*')
            .eq('grade', grade)
            .maybeSingle();

        if (error) throw error;
        return data ? new ExamTemplate(data.id, data.name, data.grade, data.duration, data.total_marks, data.passing_marks, new Date(data.created_at), new Date(data.updated_at)) : null;
    }

    public async saveTemplate(template: ExamTemplate): Promise<void> {
        const { error } = await supabase
            .from('admission_exam_templates')
            .upsert({
                id: template.id,
                name: template.name,
                grade: template.grade,
                duration: template.duration,
                total_marks: template.totalMarks,
                passing_marks: template.passingMarks
            });

        if (error) throw error;
    }

    public async findScheduleById(id: string): Promise<ExamSchedule | null> {
        const { data, error } = await supabase
            .from('admission_exam_schedule')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data ? new ExamSchedule(
            data.id,
            data.template_id,
            data.school_id,
            data.academic_year_id,
            data.room_name,
            data.invigilator_name,
            new Date(data.exam_date),
            data.status as ExamStatus,
            new Date(data.created_at),
            new Date(data.updated_at)
        ) : null;
    }

    public async saveSchedule(schedule: ExamSchedule): Promise<void> {
        const { error } = await supabase
            .from('admission_exam_schedule')
            .upsert({
                id: schedule.id,
                template_id: schedule.templateId,
                school_id: schedule.schoolId,
                academic_year_id: schedule.academicYearId,
                room_name: schedule.roomName,
                invigilator_name: schedule.invigilatorName,
                exam_date: schedule.examDate.toISOString(),
                status: schedule.status,
                updated_at: schedule.updatedAt.toISOString()
            });

        if (error) throw error;
    }

    public async findCandidate(sessionId: string, applicationId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('admission_exam_session_candidates')
            .select('*')
            .eq('session_id', sessionId)
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async findCandidateById(id: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('admission_exam_session_candidates')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async findCandidateByApplicationId(applicationId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('admission_exam_session_candidates')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async saveCandidate(candidate: any): Promise<void> {
        const { error } = await supabase
            .from('admission_exam_session_candidates')
            .upsert({
                id: candidate.id,
                session_id: candidate.session_id,
                application_id: candidate.application_id,
                hall_ticket_number: candidate.hall_ticket_number,
                seat_number: candidate.seat_number,
                attendance_status: candidate.attendance_status,
                remarks: candidate.remarks
            });

        if (error) throw error;
    }

    public async findSubjectsByTemplateId(templateId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('admission_exam_subjects')
            .select('*')
            .eq('template_id', templateId);

        if (error) throw error;
        return data || [];
    }

    public async saveResult(result: ExamResult): Promise<void> {
        const { error } = await supabase
            .from('admission_exam_results')
            .upsert({
                id: result.id,
                candidate_id: result.candidateId,
                subject_id: result.subjectId,
                marks_obtained: result.marksObtained,
                percentage: result.percentage,
                pass: result.pass,
                evaluator_id: result.evaluatorId,
                updated_at: result.updatedAt.toISOString()
            });

        if (error) throw error;
    }

    public async findResultsByCandidateId(candidateId: string): Promise<ExamResult[]> {
        const { data, error } = await supabase
            .from('admission_exam_results')
            .select('*')
            .eq('candidate_id', candidateId);

        if (error) throw error;
        return (data || []).map(row => new ExamResult(
            row.id,
            row.candidate_id,
            row.subject_id,
            Number(row.marks_obtained),
            Number(row.percentage),
            row.pass,
            row.evaluator_id,
            new Date(row.created_at),
            new Date(row.updated_at)
        ));
    }

    public async saveHallTicket(ticket: HallTicket): Promise<void> {
        const { error } = await supabase
            .from('admission_hall_tickets')
            .upsert({
                id: ticket.id,
                application_id: ticket.applicationId,
                exam_schedule_id: ticket.examScheduleId,
                hall_ticket_number: ticket.hallTicketNumber,
                exam_room: ticket.examRoom,
                reporting_time: ticket.reportingTime.toISOString(),
                qr_code_path: ticket.qrCodePath
            });

        if (error) throw error;
    }

    public async findHallTicketByApplicationId(applicationId: string): Promise<HallTicket | null> {
        const { data, error } = await supabase
            .from('admission_hall_tickets')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data ? new HallTicket(
            data.id,
            data.application_id,
            data.exam_schedule_id,
            data.hall_ticket_number,
            data.exam_room,
            new Date(data.reporting_time),
            data.qr_code_path,
            new Date(data.created_at)
        ) : null;
    }

    public async getWorkflowRule(fromStatus: string, toStatus: string, role: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('exam_workflow_rules')
            .select('allowed')
            .eq('from_status', fromStatus)
            .eq('to_status', toStatus)
            .eq('role', role)
            .maybeSingle();

        if (error) throw error;
        return data ? data.allowed : false;
    }
}

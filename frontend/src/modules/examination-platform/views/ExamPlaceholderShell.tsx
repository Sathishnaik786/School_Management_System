import React from 'react';
import { useLocation } from 'react-router-dom';
import { Compass, Calendar, Edit, Shield, Info, Activity, ArrowRight, ExternalLink } from 'lucide-react';
import { PageHeader } from '../shared/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export const ExamPlaceholderShell: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Resolve metadata based on path to show specific title, details & icons
  const getRouteDetails = () => {
    if (path.includes('/student/my-exams')) {
      return {
        title: 'My Assessments',
        role: 'STUDENT',
        desc: 'Access your active question papers, draft attempts, and start upcoming tests.',
        icon: Compass,
        accent: 'blue',
        metrics: [
          { label: 'Available Today', val: '2 Exams' },
          { label: 'Completed Attempts', val: '14' },
          { label: 'Pending Evaluations', val: '0' },
        ],
        actions: ['Entrance Test AY 2025 (Scholarship)', 'Science MCQ Term Exam'],
      };
    }
    if (path.includes('/student/results')) {
      return {
        title: 'Results & Transcripts',
        role: 'STUDENT',
        desc: 'Review published marksheets, official grade sheets, and check evaluation progress.',
        icon: Activity,
        accent: 'emerald',
        metrics: [
          { label: 'Weighted GPA', val: '3.82 / 4.0' },
          { label: 'Total Credits', val: '128' },
          { label: 'Rank in Batch', val: '7th' },
        ],
        actions: ['View Term Marksheets', 'Request Official Transcript PDF'],
      };
    }
    if (path.includes('/teacher/schedule')) {
      return {
        title: 'Timetable Scheduling',
        role: 'TEACHER',
        desc: 'Configure date sheets, allocate classrooms, and set start timers for examinations.',
        icon: Calendar,
        accent: 'indigo',
        metrics: [
          { label: 'Draft Schedules', val: '3' },
          { label: 'Approved Schedules', val: '8' },
          { label: 'Conflicts Found', val: '0' },
        ],
        actions: ['Create Timetable Slot', 'Publish Time Table'],
      };
    }
    if (path.includes('/teacher/marks')) {
      return {
        title: 'Marks Entry Hub',
        role: 'TEACHER',
        desc: 'Upload scoring sheets, review answer key sheets, and submit internal assessments.',
        icon: Edit,
        accent: 'amber',
        metrics: [
          { label: 'Pending Uploads', val: '1 Class' },
          { label: 'Verified Submissions', val: '12 Classes' },
          { label: 'Moderation Status', val: 'Approved' },
        ],
        actions: ['Download Grading Excel Template', 'Batch Upload Grades'],
      };
    }
    if (path.includes('/teacher/evaluations')) {
      return {
        title: 'Teacher Evaluations',
        role: 'TEACHER',
        desc: 'Review subjective answers, assign marks, and leave feedback comments for candidates.',
        icon: Compass,
        accent: 'violet',
        metrics: [
          { label: 'Assigned Papers', val: '80' },
          { label: 'Ungraded Submissions', val: '15' },
          { label: 'Deadline', val: 'In 3 days' },
        ],
        actions: ['Open Evaluation Panel', 'Submit Final Score Sheets'],
      };
    }
    if (path.includes('/admin/timetable')) {
      return {
        title: 'Timetable Manager',
        role: 'EXAM_CELL',
        desc: 'Institutional timetable scheduling, classroom mapping, and slot locking panel.',
        icon: Calendar,
        accent: 'blue',
        metrics: [
          { label: 'Active Calendars', val: '2' },
          { label: 'Rooms Configured', val: '18' },
          { label: 'Clash Resolution', val: 'Auto' },
        ],
        actions: ['Schedule Assessment Slot', 'Lock Examination Dates'],
      };
    }
    if (path.includes('/admin/questions')) {
      return {
        title: 'Question Bank Registry',
        role: 'EXAM_CELL',
        desc: 'Create, store, and manage centralized MCQ and descriptive question databases.',
        icon: Edit,
        accent: 'purple',
        metrics: [
          { label: 'Question Bank Units', val: '45' },
          { label: 'Total Questions', val: '2,400+' },
          { label: 'Security Level', val: 'SHA-256 Encrypted' },
        ],
        actions: ['Import Question XML File', 'Generate Paper template'],
      };
    }
    if (path.includes('/admin/candidates')) {
      return {
        title: 'Candidate Enrollment System',
        role: 'EXAM_CELL',
        desc: 'Register exam applicants, verify hall ticket codes, and track seat allocations.',
        icon: Compass,
        accent: 'sky',
        metrics: [
          { label: 'Registered Students', val: '480' },
          { label: 'External Applicants', val: '112' },
          { label: 'Hall Tickets Issued', val: '592' },
        ],
        actions: ['Bulk Verify Candidates', 'Issue Digital Hall Tickets'],
      };
    }
    if (path.includes('/admin/monitoring') || path.includes('/invigilator/monitoring')) {
      return {
        title: 'Proctor & Monitor Console',
        role: 'EXAM_CELL / INVIGILATOR',
        desc: 'Real-time webcam verification feed, browser tab-lockout tracking, and live chat proctoring.',
        icon: Shield,
        accent: 'rose',
        metrics: [
          { label: 'Live Active Rooms', val: '4 Rooms' },
          { label: 'Online Candidates', val: '182 Candidates' },
          { label: 'Suspicious Flag Count', val: '2 Flagged' },
        ],
        actions: ['View Live Proctoring Grid', 'Broadcast Security Alert Message'],
      };
    }
    if (path.includes('/evaluator/queue')) {
      return {
        title: 'Grading & Review Queue',
        role: 'EVALUATOR',
        desc: 'Assign marks to descriptive answer sheets and review candidate response logs.',
        icon: Edit,
        accent: 'violet',
        metrics: [
          { label: 'Pending Papers', val: '18' },
          { label: 'Under Review', val: '3' },
          { label: 'Completed Today', val: '24' },
        ],
        actions: ['Launch Next Evaluation', 'Download Candidate Log Sheets'],
      };
    }
    if (path.includes('/evaluator/completed')) {
      return {
        title: 'Completed Gradings',
        role: 'EVALUATOR',
        desc: 'View previously graded sheets, historical scorecard entries, and moderation approvals.',
        icon: Activity,
        accent: 'emerald',
        metrics: [
          { label: 'Graded Sessions', val: '112' },
          { label: 'Moderator Approved', val: '108' },
          { label: 'Disputes/Re-checks', val: '0' },
        ],
        actions: ['Export Graded CSV Logs', 'Submit Evaluation Audit Summary'],
      };
    }
    if (path.includes('/invigilator/logs')) {
      return {
        title: 'Proctor & Audit Logs',
        role: 'INVIGILATOR',
        desc: 'Historical proctor logs, hardware flag events, and browser compliance check logs.',
        icon: Shield,
        accent: 'amber',
        metrics: [
          { label: 'Warning Logs', val: '14' },
          { label: 'Automatic Terminations', val: '3' },
          { label: 'Webcam Failure Cases', val: '1' },
        ],
        actions: ['View Warnings Filtered', 'Download Incident PDF Report'],
      };
    }
    if (path.includes('/applicant/tests') || path.includes('/candidate/screening')) {
      return {
        title: 'Active Entrance Assessments',
        role: 'CANDIDATE',
        desc: 'Registration desk for scholarship check exams and screening entrance assessments.',
        icon: Compass,
        accent: 'cyan',
        metrics: [
          { label: 'Assigned Tests', val: '1 Available' },
          { label: 'Diagnostics status', val: 'All Verified' },
          { label: 'Syllabus info', val: 'Mathematics' },
        ],
        actions: ['Run Hardware Test', 'Launch Entrance Examination Console'],
      };
    }

    // Default Fallback
    return {
      title: 'Portal Workspace Panel',
      role: 'GENERAL',
      desc: 'Secure academic assessment dashboard workspace. Verify configurations and data metrics.',
      icon: Compass,
      accent: 'blue',
      metrics: [
        { label: 'System Mode', val: 'PREVIEW' },
        { label: 'Portal Protection', val: 'Bypassed' },
        { label: 'Database Status', val: 'Connected (Local)' },
      ],
      actions: ['Verify Portal Settings', 'Go to Main ERP Dashboard'],
    };
  };

  const details = getRouteDetails();
  const IconComponent = details.icon;

  const accentColorClass = {
    blue: { bg: 'bg-blue-50/70 text-blue-600 border-blue-100', text: 'text-blue-600', valBg: 'bg-blue-50 text-blue-700' },
    emerald: { bg: 'bg-emerald-50/70 text-emerald-600 border-emerald-100', text: 'text-emerald-600', valBg: 'bg-emerald-50 text-emerald-700' },
    indigo: { bg: 'bg-indigo-50/70 text-indigo-600 border-indigo-100', text: 'text-indigo-600', valBg: 'bg-indigo-50 text-indigo-700' },
    amber: { bg: 'bg-amber-50/70 text-amber-600 border-amber-100', text: 'text-amber-600', valBg: 'bg-amber-50 text-amber-700' },
    violet: { bg: 'bg-violet-50/70 text-violet-600 border-violet-100', text: 'text-violet-600', valBg: 'bg-violet-50 text-violet-700' },
    purple: { bg: 'bg-purple-50/70 text-purple-600 border-purple-100', text: 'text-purple-600', valBg: 'bg-purple-50 text-purple-700' },
    sky: { bg: 'bg-sky-50/70 text-sky-600 border-sky-100', text: 'text-sky-600', valBg: 'bg-sky-50 text-sky-700' },
    rose: { bg: 'bg-rose-50/70 text-rose-600 border-rose-100', text: 'text-rose-600', valBg: 'bg-rose-50 text-rose-700' },
    cyan: { bg: 'bg-cyan-50/70 text-cyan-600 border-cyan-100', text: 'text-cyan-600', valBg: 'bg-cyan-50 text-cyan-700' },
  }[details.accent] || { bg: 'bg-slate-50 text-slate-600 border-slate-100', text: 'text-slate-600', valBg: 'bg-slate-50 text-slate-700' };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={details.title}
          description={details.desc}
        />
        <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/50 text-[10px] font-black text-slate-500 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>SCOPE: {details.role}</span>
        </div>
      </div>

      {/* Info Notice card */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 border border-slate-800 flex items-start gap-4 shadow-premium-lg">
        <div className="p-3 bg-slate-800 rounded-2xl text-blue-400 border border-slate-700 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold tracking-wide uppercase text-slate-400">Sandbox Preview Environment</h4>
          <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
            All route permissions and auth protections have been removed. This workspace is fully functional inside the mock ERP environment. Test actions do not impact live database schedules.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {details.metrics.map((m, i) => (
          <Card key={i} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-premium-sm">
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {m.label}
              </span>
              <p className="text-xl font-extrabold text-slate-800">{m.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workspace Quick Actions */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-premium-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${accentColorClass.bg}`}>
            <IconComponent className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Active Tasks & Actions</h3>
            <p className="text-[10px] text-slate-405 font-bold">Standard procedures for this portal department</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.actions.map((act, i) => (
            <button
              key={i}
              onClick={() => alert(`Initiating: ${act}`)}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-150/70 hover:border-blue-500/30 hover:bg-slate-50/50 group text-left transition-all duration-200"
            >
              <div className="space-y-1 pr-4">
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {act}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Ready to test • Sandbox mock interface
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamPlaceholderShell;

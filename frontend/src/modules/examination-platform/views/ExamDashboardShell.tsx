import React from 'react';
import { Calendar, CheckCircle2, ShieldAlert, Award, FileText, BookOpen, Clock, Users, Shield, PlusCircle, PenTool, CheckSquare } from 'lucide-react';
import { PageHeader } from '../shared/components/PageHeader';
import { StatisticCard } from '../shared/components/StatisticCard';
import { AlertBanner } from '../shared/components/AlertBanner';
import { ActionCard } from '../shared/components/ActionCard';
import { TimelineCard } from '../shared/components/TimelineCard';
import { SectionHeader } from '../shared/components/SectionHeader';
import { useExamContext } from '../providers/ExamProvider';
import { ExamRole } from '../enums/ExamRole';

export const ExamDashboardShell: React.FC = () => {
  const { activeRole } = useExamContext();

  const getDashboardData = () => {
    switch (activeRole) {
      case ExamRole.APPLICANT:
        return {
          title: "Applicant Test Desk",
          description: "Welcome to the entrance registration desk. Please run hardware diagnostics before initiating your assigned admissions test.",
          bannerText: "Webcam & Microphone Required: Click the run diagnostics button to authorize video verification before starting the entrance test.",
          bannerVariant: "warning" as const,
          stats: [
            { title: "Entrance Tests", value: "1 Available", icon: Calendar, iconColor: "text-indigo-600", iconBg: "bg-indigo-50 border-indigo-100" },
            { title: "Document Check", value: "Approved", icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-100" },
            { title: "Support Queries", value: "0 Open", icon: FileText, iconColor: "text-slate-600", iconBg: "bg-slate-50 border-slate-100" }
          ],
          actions: [
            { title: "Hardware System & Compatibility Diagnostics", desc: "Ensure webcam, audio levels, and keyboard logs are synced.", btn: "Run Diagnostics Check", icon: Shield },
            { title: "Scholarship Entrance Test (Round 1)", desc: "Duration: 90 Minutes | Pattern: Quantitative Aptitude & Reading Comprehension.", btn: "Launch Secure Exam Console", icon: Award, isAccent: true }
          ],
          timeline: [
            { title: "Admission Application Verified", time: "11:30 AM", description: "Your candidate application registration is verified for the scholarship exam.", active: true },
            { title: "Document Verification Completed", time: "2 days ago", description: "School transcripts and identity proofs approved by Admissions desk.", active: false }
          ]
        };

      case ExamRole.TEACHER:
        return {
          title: "Teacher Operations Panel",
          description: "Configure date sheets, input final grade cards, and submit internal school assessments.",
          bannerText: "Term Grading Deadlines: All marks entry schedules for Semester 1 must be closed and submitted for moderation within 48 hours.",
          bannerVariant: "warning" as const,
          stats: [
            { title: "Assigned Classrooms", value: "4 Classes", icon: Users, iconColor: "text-blue-600", iconBg: "bg-blue-50 border-blue-100" },
            { title: "Assessments Scheduled", value: "2 Active", icon: Calendar, iconColor: "text-amber-600", iconBg: "bg-amber-50 border-amber-100" },
            { title: "Pending Paper Gradings", value: "1 Class", icon: PenTool, iconColor: "text-violet-600", iconBg: "bg-violet-50 border-violet-100" }
          ],
          actions: [
            { title: "Semester Term 1 Marks Sheet Entry", desc: "Class: Grade 10-A | Subject: Chemistry Theory (100 Marks Grid).", btn: "Open Marks Entry Sheet", icon: FileText },
            { title: "Timetable Slot Configuration Request", desc: "Reserve exam halls and scheduling hours for Grade 12 Mock Assessments.", btn: "Request Classroom Allocation", icon: PlusCircle, isAccent: true }
          ],
          timeline: [
            { title: "Grade 10 Maths Paper Timetable Approved", time: "09:15 AM", description: "Central Exam Cell approved the maths date slot request.", active: true },
            { title: "Internal Moderation Notice", time: "3 days ago", description: "Moderation guidelines for descriptive answers updated by Dean of Academics.", active: false }
          ]
        };

      case ExamRole.EXAM_CELL:
        return {
          title: "Exam Cell Central Command",
          description: "Enterprise assessment scheduling, question bank management, and real-time live proctoring control room.",
          bannerText: "High Alert Live Proctoring: Active assessment session running. Live streams and proctor chat systems are operational.",
          bannerVariant: "danger" as const,
          stats: [
            { title: "Running Live Sessions", value: "3 Sessions", icon: Clock, iconColor: "text-rose-600", iconBg: "bg-rose-50 border-rose-100" },
            { title: "Total Enrolled Candidates", value: "592 Students", icon: Users, iconColor: "text-sky-600", iconBg: "bg-sky-50 border-sky-100" },
            { title: "Unscheduled Test Papers", value: "2 Modules", icon: FileText, iconColor: "text-amber-600", iconBg: "bg-amber-50 border-amber-100" }
          ],
          actions: [
            { title: "Live Proctoring & Control Panel", desc: "Monitor student screens, webcam feeds, browser lockouts, and flag warnings.", btn: "Enter Proctor Control Room", icon: Shield, isAccent: true },
            { title: "Create Central Timetable Slot", desc: "Schedule exams, map halls, assign invigilators, and lock test window dates.", btn: "Open Timetable Configuration", icon: PlusCircle }
          ],
          timeline: [
            { title: "Emergency Proctor Alert Broadcast", time: "02:15 PM", description: "Broadcasted alert to invigilators regarding tab lockout policy updates.", active: true },
            { title: "Central Question Bank Encrypted", time: "Yesterday", description: "Centralized SHA-256 database lock finalized successfully.", active: false }
          ]
        };

      case ExamRole.EVALUATOR:
        return {
          title: "Evaluator Assignment Desk",
          description: "Review subjective student papers, grade descriptive responses, and upload final marks.",
          bannerText: "Grade Sheet Moderation Notice: Final grades must contain descriptive feedback comments. Blank score cards are flagged.",
          bannerVariant: "info" as const,
          stats: [
            { title: "Assigned Grading Queue", value: "18 Papers", icon: PenTool, iconColor: "text-indigo-600", iconBg: "bg-indigo-50 border-indigo-100" },
            { title: "Completed Score Cards", value: "148 Submitted", icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-100" },
            { title: "Under Moderation Review", value: "3 Papers", icon: Clock, iconColor: "text-amber-600", iconBg: "bg-amber-50 border-amber-100" }
          ],
          actions: [
            { title: "Grade 12 Physics Subjective Section", desc: "Review descriptive question responses and assign step-wise markings.", btn: "Grade Next Sheet", icon: FileText, isAccent: true },
            { title: "Grade Sheet Moderation Submission", desc: "Audit completed grades, add comments, and push to central Exam Cell registry.", btn: "Submit Audited Scores", icon: CheckSquare }
          ],
          timeline: [
            { title: "Grade 10 English Batch Approved", time: "Yesterday", description: "External Moderator verified and locked final Grade 10 scores.", active: true },
            { title: "Evaluation Allocation Updated", time: "4 days ago", description: "Assigned 25 additional Chemistry papers to grading docket.", active: false }
          ]
        };

      case ExamRole.INVIGILATOR:
        return {
          title: "Invigilator Control Panel",
          description: "Monitor live exam session rooms, log candidate incidents, and verify candidate registration hall tickets.",
          bannerText: "Classroom Room A-24 Live: Student screens are actively synced. Tap switches and camera exits will trigger alerts.",
          bannerVariant: "danger" as const,
          stats: [
            { title: "Active Exam Hall Room", value: "Room A-24", icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50 border-blue-100" },
            { title: "Candidates Checked In", value: "38 / 40 Present", icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-100" },
            { title: "Candidate Flagged Violations", value: "2 Warnings", icon: ShieldAlert, iconColor: "text-rose-600", iconBg: "bg-rose-50 border-rose-100" }
          ],
          actions: [
            { title: "Real-Time Proctor Monitor Console", desc: "Live student webcams, audio feeds, and browser lockout flags for Room A-24.", btn: "Open Monitoring Grid", icon: Shield, isAccent: true },
            { title: "Incident Log & Violation Desk", desc: "Log manual warnings, examine tab lockout alerts, and handle technical exceptions.", btn: "File Incident Report", icon: FileText }
          ],
          timeline: [
            { title: "Proctor Alert: Tab Switch Warning", time: "01:45 PM", description: "Candidate ID #5122 switched browser tab. Manual warning sent.", active: true },
            { title: "Webcam Feed Re-sync Approved", time: "Yesterday", description: "Candidate ID #5088 webcam connection validated successfully.", active: false }
          ]
        };

      case ExamRole.RECRUITMENT_CANDIDATE:
        return {
          title: "Recruitment Testing Console",
          description: "Welcome candidate! Access your assigned screening assessments and submit engineering tests.",
          bannerText: "Secure Session Compliance: Code compilers and descriptive test screens have built-in copy-paste protection.",
          bannerVariant: "info" as const,
          stats: [
            { title: "Assigned Coding Tests", value: "1 Test", icon: Calendar, iconColor: "text-indigo-600", iconBg: "bg-indigo-50 border-indigo-100" },
            { title: "Technical Round Stage", value: "Round 1 Screening", icon: Award, iconColor: "text-blue-600", iconBg: "bg-blue-50 border-blue-100" },
            { title: "Feedback Assessment", value: "Pending Submission", icon: Clock, iconColor: "text-slate-600", iconBg: "bg-slate-50 border-slate-100" }
          ],
          actions: [
            { title: "Full-Stack Software Engineering Assessment", desc: "Duration: 120 Minutes | Tasks: 2 Coding Problems and 1 System Design explanation.", btn: "Launch IDE Console", icon: PenTool, isAccent: true },
            { title: "Recruitment Feedback Form", desc: "Submit your experience, technical background details, and candidate feedback.", btn: "Open Feedback Form", icon: FileText }
          ],
          timeline: [
            { title: "Candidate Code Profile Sync Complete", time: "Yesterday", description: "Imported candidates details and resume keywords successfully.", active: true },
            { title: "Hardware System Check Success", time: "2 days ago", description: "Microphone, webcam, and browser version check verified.", active: false }
          ]
        };

      // Default to Student Role
      case ExamRole.STUDENT:
      default:
        return {
          title: "Examination Portal Dashboard",
          description: "Welcome to your secure academic assessment center. Monitor scheduled tests, view hall tickets, and read official notices below.",
          bannerText: "Important Security Notice: Active proctoring will log all tab switches, browser resizing, and hardware exits. Please ensure a stable internet connection.",
          bannerVariant: "warning" as const,
          stats: [
            { title: "Upcoming Assessments", value: "2 Active", icon: Calendar, iconColor: "text-blue-600", iconBg: "bg-blue-50 border-blue-100" },
            { title: "Completed Exams", value: "14 Tests", icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-100" },
            { title: "Security Flag Warnings", value: "0 Flags", icon: ShieldAlert, iconColor: "text-rose-600", iconBg: "bg-rose-50 border-rose-100" }
          ],
          actions: [
            { title: "Academic Term Unit Assessment (AY 2025)", desc: "Duration: 120 Minutes | Type: General Science MCQ and Subjective Descriptive Section.", btn: "Verify Hall Ticket", icon: FileText },
            { title: "Entrance Admission Scholarship Exam", desc: "Duration: 90 Minutes | Syllabus: General Mathematics and Analytical Reasoning.", btn: "Start Examination", icon: Award, isAccent: true }
          ],
          timeline: [
            { title: "Entrance Assessment Registration Checked", time: "10:00 AM", description: "Your hall ticket registration check was approved by the Exam Cell.", active: true },
            { title: "System Hardware Diagnostics", time: "Yesterday", description: "Browser compatibility, microphone, and webcam checks completed successfully.", active: false }
          ]
        };
    }
  };

  const data = getDashboardData();

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <PageHeader
        title={data.title}
        description={data.description}
      />

      <AlertBanner
        message={data.bannerText}
        variant={data.bannerVariant}
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.stats.map((s, index) => (
          <StatisticCard
            key={index}
            title={s.title}
            value={s.value}
            icon={s.icon}
            iconColor={s.iconColor}
            iconBg={s.iconBg}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader
            title="Scheduled Assessment Workflows"
            description="Access your upcoming registered test timelines"
          />

          {data.actions.map((act, index) => (
            <ActionCard
              key={index}
              title={act.title}
              description={act.desc}
              buttonText={act.btn}
              onClick={() => alert(`Initiating: ${act.title}`)}
              icon={act.icon}
              {...(act.isAccent ? {
                iconBg: "bg-purple-50 border-purple-100",
                iconColor: "text-purple-600"
              } : {})}
            />
          ))}
        </div>

        <div>
          <TimelineCard title="Recent Security & Sync Events" events={data.timeline} />
        </div>
      </div>
    </div>
  );
};

export default ExamDashboardShell;


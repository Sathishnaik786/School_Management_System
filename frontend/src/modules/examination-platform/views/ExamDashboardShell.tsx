import React from 'react';
import { Calendar, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';
import { PageHeader } from '../shared/components/PageHeader';
import { StatisticCard } from '../shared/components/StatisticCard';
import { AlertBanner } from '../shared/components/AlertBanner';
import { ActionCard } from '../shared/components/ActionCard';
import { TimelineCard } from '../shared/components/TimelineCard';
import { SectionHeader } from '../shared/components/SectionHeader';

export const ExamDashboardShell: React.FC = () => {
  const mockTimeline = [
    {
      title: 'Entrance Assessment Registration Checked',
      time: '10:00 AM',
      description: 'Your hall ticket registration check was approved by the Exam Cell.',
      active: true,
    },
    {
      title: 'System Hardware Diagnostics',
      time: 'Yesterday',
      description: 'Browser compatibility, microphone, and webcam checks completed successfully.',
      active: false,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Examination Portal Dashboard"
        description="Welcome to your secure academic assessment center. Monitor scheduled tests, view hall tickets, and read official notices below."
      />

      <AlertBanner
        message="Important Security Notice: Active proctoring will log all tab switches, browser resizing, and hardware exits. Please ensure a stable internet connection."
        variant="warning"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatisticCard
          title="Upcoming Assessments"
          value="2 Active"
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
        />
        <StatisticCard
          title="Completed Exams"
          value="14 Tests"
          changeDelta={8}
          trendDirection="up"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
        />
        <StatisticCard
          title="Security Flag Warnings"
          value="0 Flags"
          icon={ShieldAlert}
          iconColor="text-rose-600"
          iconBg="bg-rose-50 border-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader
            title="Scheduled Assessment Workflows"
            description="Access your upcoming registered test timelines"
          />

          <ActionCard
            title="Academic Term Unit Assessment (AY 2025)"
            description="Duration: 120 Minutes | Type: General Science MCQ and Subjective Descriptive Section."
            buttonText="Verify Hall Ticket"
            onClick={() => alert('Hall Ticket verification flow initiated.')}
            icon={FileText}
          />

          <ActionCard
            title="Entrance Admission Scholarship Exam"
            description="Duration: 90 Minutes | Syllabus: General Mathematics and Analytical Reasoning."
            buttonText="Start Examination"
            onClick={() => alert('Entering secure examination fullscreen mode.')}
            icon={Award}
            iconBg="bg-purple-50 border-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        <div>
          <TimelineCard title="Recent Security & Sync Events" events={mockTimeline} />
        </div>
      </div>
    </div>
  );
};

export default ExamDashboardShell;

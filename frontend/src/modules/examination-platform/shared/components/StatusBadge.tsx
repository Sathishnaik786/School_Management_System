import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExamStatus } from '../../enums/ExamStatus';

interface StatusBadgeProps {
  status: ExamStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case ExamStatus.DRAFT:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case ExamStatus.PENDING_APPROVAL:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case ExamStatus.APPROVED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ExamStatus.SCHEDULED:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case ExamStatus.HALL_TICKETS_GENERATED:
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case ExamStatus.EXAM_ACTIVE:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse';
      case ExamStatus.EXAM_CLOSED:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case ExamStatus.EVALUATION:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case ExamStatus.RESULTS_PUBLISHED:
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case ExamStatus.ARCHIVED:
        return 'bg-gray-150 text-gray-700 border-gray-250';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-150';
    }
  };

  const formatLabel = (val: string) => {
    return val
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Badge className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shadow-none ${getStyle()}`}>
      {formatLabel(status)}
    </Badge>
  );
};

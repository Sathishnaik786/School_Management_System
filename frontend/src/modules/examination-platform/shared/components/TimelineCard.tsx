import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TimelineEvent {
  title: string;
  time: string;
  description?: string;
  active?: boolean;
}

interface TimelineCardProps {
  title: string;
  events: TimelineEvent[];
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ title, events }) => {
  return (
    <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <CardContent className="p-6 text-left space-y-4">
        <h4 className="text-sm font-bold text-slate-800 font-display border-b border-slate-100/60 pb-3 leading-none">
          {title}
        </h4>
        <div className="relative pl-6 border-l border-slate-200 space-y-6">
          {events.map((event, index) => (
            <div key={index} className="relative">
              {/* Event Dot */}
              <div
                className={`absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all ${
                  event.active ? 'border-blue-600 bg-blue-600' : 'border-slate-350'
                }`}
              />
              {/* Event Content */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {event.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {event.time}
                  </span>
                </div>
                {event.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

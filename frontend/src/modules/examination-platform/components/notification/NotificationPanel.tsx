import React, { useState } from 'react';
import { Bell, Info, ShieldAlert, Award, Calendar, Check, MailOpen } from 'lucide-react';
import { NotificationType } from '../../enums/NotificationType';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Entrance Test Syllabus Published',
      body: 'Review the technical guidelines for math testing syllabus.',
      type: NotificationType.EXAM,
      read: false,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      title: 'System Maintenance Window',
      body: 'Live proctor updates scheduled tonight from 12 AM to 2 AM.',
      type: NotificationType.SYSTEM,
      read: false,
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      title: 'Hall Ticket Released',
      body: 'Your admission hall ticket is generated and ready for verification.',
      type: NotificationType.EXAM,
      read: true,
      timestamp: '1 day ago',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SECURITY:
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case NotificationType.RESULT:
        return <Award className="w-4 h-4 text-emerald-500" />;
      case NotificationType.REMINDER:
        return <Calendar className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100/50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          {/* Backdrop layer to click close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2.5 w-[320px] sm:w-[360px] bg-white border border-slate-200/80 rounded-2xl shadow-premium-xl py-3 px-4 z-50 text-left space-y-3 animate-in fade-in slide-in-from-top-3 duration-250">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 font-display">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                  <MailOpen className="w-8 h-8 mb-2 opacity-60" />
                  <p className="text-[10px] font-bold">No active notifications</p>
                </div>
              ) : (
                notifications.map(item => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all flex gap-3 ${
                      item.read
                        ? 'bg-white border-slate-100 text-slate-655'
                        : 'bg-blue-50/30 border-blue-100/60 text-slate-800 shadow-premium-sm'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{getIcon(item.type)}</div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold truncate leading-tight">{item.title}</span>
                        {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{item.body}</p>
                      <span className="text-[9px] text-slate-400 font-semibold block pt-0.5">{item.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { QUERY_KEYS } from '../../../lib/queryKeys';
import {
    CalendarCheck, BookOpen, DollarSign, Bus, Library, ClipboardList,
    Bell, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight,
    GraduationCap, Calendar, Activity, FileText, Wifi
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

// ─── Widget: KPI Stat Card ───────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
    trend,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    color: string;
    trend?: { value: number; label: string };
}) {
    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
                {sub && <p className="text-xs text-gray-500 font-medium mt-0.5">{sub}</p>}
                {trend && (
                    <div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend.value >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Widget: Quick Action Button ──────────────────────────────────────────────
function QuickActionButton({ icon: Icon, label, href, color }: {
    icon: React.ElementType; label: string; href: string; color: string;
}) {
    return (
        <a
            href={href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-center"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700">{label}</span>
        </a>
    );
}

// ─── Widget: Today's Schedule Row ─────────────────────────────────────────────
function ScheduleRow({ time, subject, teacher, room, status }: {
    time: string; subject: string; teacher: string; room: string; status: 'upcoming' | 'ongoing' | 'done';
}) {
    const statusConfig = {
        upcoming: { dot: 'bg-blue-400', label: 'Upcoming', text: 'text-blue-600 bg-blue-50' },
        ongoing: { dot: 'bg-green-400 animate-pulse', label: 'Ongoing', text: 'text-green-600 bg-green-50' },
        done: { dot: 'bg-gray-300', label: 'Done', text: 'text-gray-400 bg-gray-50' },
    };
    const s = statusConfig[status];

    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className="w-16 text-right shrink-0">
                <span className="text-xs font-bold text-gray-500">{time}</span>
            </div>
            <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-black truncate ${status === 'done' ? 'text-gray-400' : 'text-gray-900'}`}>
                    {subject}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">{teacher} · {room}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.text}`}>
                {s.label}
            </span>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function StudentDashboard() {
    const { user } = useAuth();

    // Fetch student summary from the dashboard API
    const { data: summary } = useQuery({
        queryKey: QUERY_KEYS.DASHBOARD.METRICS('student', new Date().toDateString()),
        queryFn: async () => {
            try {
                const res = await apiClient.get('/dashboard/student-summary');
                return res.data;
            } catch {
                return null; // Graceful fallback to mock data
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    // Mock data for widgets while backend endpoint is wired
    const attendancePercent = summary?.attendancePercent ?? 87;
    const feeDue = summary?.feeDue ?? 12500;
    const upcomingExams = summary?.upcomingExams ?? 3;
    const pendingAssignments = summary?.pendingAssignments ?? 2;

    const todaySchedule = summary?.todaySchedule ?? [
        { time: '9:00 AM', subject: 'Mathematics', teacher: 'Mr. Ramesh', room: 'Room 101', status: 'done' as const },
        { time: '10:00 AM', subject: 'Physics', teacher: 'Mrs. Lakshmi', room: 'Lab 3', status: 'ongoing' as const },
        { time: '11:00 AM', subject: 'English Literature', teacher: 'Ms. Priya', room: 'Room 204', status: 'upcoming' as const },
        { time: '12:00 PM', subject: 'Chemistry', teacher: 'Mr. Venkat', room: 'Lab 1', status: 'upcoming' as const },
    ];

    const announcements = summary?.announcements ?? [
        { id: '1', title: 'Annual Day Practice', body: 'All students must report to auditorium by 3 PM today.', time: '2h ago', priority: 'high' },
        { id: '2', title: 'Library Book Return', body: 'Books issued in April must be returned by this Friday.', time: '1d ago', priority: 'medium' },
        { id: '3', title: 'Sports Day Registration', body: 'Register for track and field events before June 30.', time: '2d ago', priority: 'low' },
    ];

    const quickActions = [
        { icon: CalendarCheck, label: 'My Attendance', href: '/app/attendance/my', color: 'bg-green-100 text-green-600' },
        { icon: DollarSign, label: 'Pay Fees', href: '/app/fees/my', color: 'bg-amber-100 text-amber-600' },
        { icon: GraduationCap, label: 'My Results', href: '/app/my-results', color: 'bg-purple-100 text-purple-600' },
        { icon: BookOpen, label: 'My Assignments', href: '/app/my-assignments', color: 'bg-blue-100 text-blue-600' },
        { icon: FileText, label: 'My Timetable', href: '/app/my-timetable', color: 'bg-indigo-100 text-indigo-600' },
        { icon: Bus, label: 'My Transport', href: '/app/transport/my', color: 'bg-orange-100 text-orange-600' },
        { icon: Library, label: 'Library', href: '/app/library', color: 'bg-teal-100 text-teal-600' },
        { icon: ClipboardList, label: 'Leave Request', href: '/app/attendance/leaves', color: 'bg-rose-100 text-rose-600' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-8"
        >
            {/* Greeting Header */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-semibold">Welcome back 👋</p>
                        <h1 className="text-2xl font-black mt-0.5">{user?.full_name || 'Student'}</h1>
                        <p className="text-blue-100 text-xs mt-1 font-medium">
                            {formatDate(new Date())} · Have a productive day!
                        </p>
                    </div>
                    <div className="hidden sm:block w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white/60 border border-white/20">
                        {user?.full_name?.charAt(0) || 'S'}
                    </div>
                </div>
            </motion.div>

            {/* KPI Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Activity}
                    label="Attendance"
                    value={`${attendancePercent}%`}
                    sub="This semester"
                    color="bg-green-100 text-green-600"
                    trend={{ value: attendancePercent >= 75 ? 2.1 : -3.5, label: 'vs last month' }}
                />
                <StatCard
                    icon={DollarSign}
                    label="Fee Due"
                    value={feeDue > 0 ? formatCurrency(feeDue) : 'Paid'}
                    sub={feeDue > 0 ? 'Due by 15th July' : 'All cleared ✓'}
                    color={feeDue > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}
                />
                <StatCard
                    icon={GraduationCap}
                    label="Upcoming Exams"
                    value={String(upcomingExams)}
                    sub="Next: Physics — Jul 2"
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon={ClipboardList}
                    label="Pending Tasks"
                    value={String(pendingAssignments)}
                    sub={`${pendingAssignments} assignments due`}
                    color="bg-blue-100 text-blue-600"
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Today's Timetable */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Today's Schedule
                        </h2>
                        <a href="/app/my-timetable" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                            Full timetable <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                    <div>
                        {todaySchedule.map((cls: any, i: number) => (
                            <ScheduleRow key={i} {...cls} />
                        ))}
                    </div>
                </motion.div>

                {/* Announcements */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" />
                            Announcements
                        </h2>
                        <a href="/notifications" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                            See all <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {announcements.map((ann: any) => (
                            <div key={ann.id} className={`p-3 rounded-xl border-l-2 ${
                                ann.priority === 'high' ? 'border-red-400 bg-red-50/50' :
                                ann.priority === 'medium' ? 'border-amber-400 bg-amber-50/50' :
                                'border-blue-200 bg-blue-50/20'
                            }`}>
                                <p className="text-xs font-black text-gray-900">{ann.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{ann.body}</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">{ann.time}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-primary" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {quickActions.map(action => (
                        <QuickActionButton key={action.label} {...action} />
                    ))}
                </div>
            </motion.div>

            {/* Bottom Row: Attendance Alert + Leave Status + Transport */}
            <div className="grid sm:grid-cols-3 gap-4">
                {/* Attendance Alert */}
                <motion.div variants={itemVariants} className={`rounded-2xl p-5 border ${attendancePercent < 75 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        {attendancePercent < 75
                            ? <AlertCircle className="w-5 h-5 text-red-500" />
                            : <CheckCircle2 className="w-5 h-5 text-green-500" />
                        }
                        <h3 className="text-xs font-black text-gray-900">Attendance Status</h3>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{attendancePercent}%</div>
                    <p className={`text-xs font-semibold ${attendancePercent < 75 ? 'text-red-600' : 'text-green-600'}`}>
                        {attendancePercent < 75
                            ? '⚠️ Below 75% — Risk of detention'
                            : '✓ Attendance is satisfactory'
                        }
                    </p>
                    <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${attendancePercent < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${attendancePercent}%` }}
                        />
                    </div>
                </motion.div>

                {/* Leave Status */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-xs font-black text-gray-900 mb-3 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-primary" /> Leave Balance
                    </h3>
                    {[
                        { type: 'Casual Leave', used: 2, total: 10, color: 'bg-blue-500' },
                        { type: 'Medical Leave', used: 1, total: 5, color: 'bg-purple-500' },
                    ].map(leave => (
                        <div key={leave.type} className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-gray-600">{leave.type}</span>
                                <span className="text-[10px] font-black text-gray-800">{leave.total - leave.used} remaining</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${leave.color}`} style={{ width: `${(leave.used / leave.total) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    <a href="/app/attendance/leaves" className="text-[10px] font-bold text-primary hover:underline mt-2 flex items-center gap-1">
                        Apply for Leave <ArrowRight className="w-3 h-3" />
                    </a>
                </motion.div>

                {/* Transport Status */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-xs font-black text-gray-900 mb-3 flex items-center gap-2">
                        <Bus className="w-4 h-4 text-primary" /> Transport Info
                    </h3>
                    <div className="space-y-2 text-xs">
                        {[
                            { label: 'Route', value: 'Route 7 – Gachibowli' },
                            { label: 'Bus No', value: 'TS 09 EF 4521' },
                            { label: 'Pickup', value: '7:45 AM · Stop 3B' },
                            { label: 'Drop', value: '4:30 PM · Stop 3B' },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between border-b border-gray-50 pb-1.5 last:border-0">
                                <span className="font-bold text-gray-400">{item.label}</span>
                                <span className="font-black text-gray-700 text-right">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <a href="/app/transport/my" className="text-[10px] font-bold text-primary hover:underline mt-3 flex items-center gap-1">
                        Track Bus <ArrowRight className="w-3 h-3" />
                    </a>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default StudentDashboard;

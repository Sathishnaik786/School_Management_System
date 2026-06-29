import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import {
    Users, FileText, CheckSquare, Award, DollarSign, ArrowRight,
    TrendingUp, FilePlus, UserPlus, Calendar, CreditCard, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function MetricCard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
                {sub && <p className="text-xs text-gray-500 font-medium mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    );
}

export function DashboardPage() {
    const { data: stats } = useQuery({
        queryKey: ['admissions', 'stats-summary'],
        queryFn: () => admissionApi.getStats().then(res => res.data).catch(() => null),
    });

    // Mock data for display
    const kpis = [
        { title: 'Total Inquiries', value: '142', sub: 'CRM Inbound leads', icon: Users, color: 'bg-blue-100 text-blue-600' },
        { title: 'Total Applications', value: stats?.total || '86', sub: 'Parent submissions', icon: FileText, color: 'bg-purple-100 text-purple-600' },
        { title: 'Conversion Rate', value: '62%', sub: 'Inquiry to Application', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
        { title: 'Fees Collected', value: '₹4,52,000', sub: 'Admission fees received', icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
    ];

    const chartData = [
        { name: 'Inquiry', count: 142 },
        { name: 'Application', count: 86 },
        { name: 'Doc Verified', count: 72 },
        { name: 'Exam', count: 65 },
        { name: 'Interview', count: 58 },
        { name: 'Merit', count: 45 },
        { name: 'Offer', count: 40 },
        { name: 'Payment', count: 36 },
        { name: 'Enrolled', count: 32 },
    ];

    const quickActions = [
        { label: 'Create Inquiry', href: '/app/admissions/inquiries', icon: FilePlus, color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'New Application', href: '/app/admissions/new', icon: UserPlus, color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: 'Document Review', href: '/app/admissions/review', icon: CheckSquare, color: 'bg-green-50 text-green-600 border-green-100' },
        { label: 'Schedule Exam', href: '/app/admissions/exams', icon: Calendar, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { label: 'Collect Fee', href: '/app/admissions/fees', icon: CreditCard, color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { label: 'Enroll Handoff', href: '/app/admissions/enrollment', icon: Award, color: 'bg-rose-50 text-rose-600 border-rose-100' },
    ];

    return (
        <div className="space-y-6 pb-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Admission Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time indicators across the admission funnel.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((card, i) => (
                    <MetricCard key={i} {...card} />
                ))}
            </div>

            {/* Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-black text-gray-900 mb-4">Conversion Funnel</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 mb-4">Counselor Shortcuts</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((act, i) => {
                                const Icon = act.icon;
                                return (
                                    <a
                                        key={i}
                                        href={act.href}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-solid transition-all hover:-translate-y-0.5 hover:shadow-sm text-center ${act.color}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold text-gray-700">{act.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-primary">
                        <a href="/app/admissions/reports" className="flex items-center gap-1 hover:underline">
                            Executive Reports <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Active Stages Queue Details */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-black text-gray-900">Active Workflow Queues</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    {[
                        { label: 'Doc Reviews', count: '14 pending', color: 'border-l-indigo-400 bg-indigo-50/20' },
                        { label: 'Exam Marking', count: '7 pending', color: 'border-l-blue-400 bg-blue-50/20' },
                        { label: 'Interview Scores', count: '5 pending', color: 'border-l-purple-400 bg-purple-50/20' },
                        { label: 'Merit List Desk', count: 'Ready to generate', color: 'border-l-pink-400 bg-pink-50/20' },
                        { label: 'Fee Verification', count: '4 pending', color: 'border-l-amber-400 bg-amber-50/20' },
                        { label: 'Enroll Handoff', color: 'border-l-green-400 bg-green-50/20', count: '3 pending' },
                    ].map((stage, i) => (
                        <div key={i} className={`p-3.5 rounded-xl border-l-4 ${stage.color}`}>
                            <p className="text-[11px] font-black text-gray-900">{stage.label}</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">{stage.count}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

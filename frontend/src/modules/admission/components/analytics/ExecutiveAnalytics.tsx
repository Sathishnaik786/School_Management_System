import React from 'react';
import FunnelChart from './FunnelChart';
import { TrendingUp, Clock, AlertTriangle, UserCheck } from 'lucide-react';

export function ExecutiveAnalytics() {
    const mockFunnelData = [
        { stage: 'Inquiries Logged', count: 1200, percentage: 100 },
        { stage: 'Applications Submitted', count: 850, percentage: 70.8 },
        { stage: 'Document Validation', count: 720, percentage: 84.7 },
        { stage: 'Exam & Interview', count: 480, percentage: 66.6 },
        { stage: 'Offers Extended', count: 320, percentage: 66.6 },
        { stage: 'SIS Enrolled', count: 260, percentage: 81.2 }
    ];

    const stats = [
        { title: 'Aggregate CR', value: '21.6%', change: '+3.4% YoY', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { title: 'Avg. Speed to Enrol', value: '8.4 Days', change: '-1.2 Days', icon: Clock, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { title: 'SLA Warnings', value: '14 Active', change: '8 Breaches', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        { title: 'Officer Efficiency', value: '94.2%', change: '+1.5% target', icon: UserCheck, color: 'text-amber-600 bg-amber-50 border-amber-100' }
    ];

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 rounded-2xl p-5 shadow-sm flex items-start justify-between">
                            <div className="space-y-2">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
                                    {stat.title}
                                </span>
                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                                    {stat.value}
                                </h3>
                                <span className="text-[10px] text-gray-400 font-bold">
                                    {stat.change}
                                </span>
                            </div>
                            <span className={`p-2.5 rounded-xl border ${stat.color}`}>
                                <Icon className="w-5 h-5" />
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Funnel & Conversion insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm">
                    <FunnelChart data={mockFunnelData} />
                </div>
                
                <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                        Process Lead Times
                    </h4>
                    
                    <div className="space-y-3 text-xs">
                        {[
                            { name: 'Inquiry → Submission', time: '1.5 Days', target: '2.0 Days' },
                            { name: 'Submission → Verification', time: '1.2 Days', target: '1.0 Day' },
                            { name: 'Verification → Assessment', time: '3.4 Days', target: '4.0 Days' },
                            { name: 'Assessment → Offer', time: '1.1 Days', target: '1.0 Day' },
                            { name: 'Offer → SIS Enrolled', time: '1.2 Days', target: '2.0 Days' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                                <span className="font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                                <div className="text-right">
                                    <span className="font-black text-indigo-600 block">{item.time}</span>
                                    <span className="text-[9px] text-gray-400 font-semibold uppercase">Target: {item.target}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExecutiveAnalytics;

import React from 'react';
import { Link } from 'react-router-dom';

const modules = [
    {
        icon: '📋',
        title: 'Candidate Registrations',
        description: 'Manage exam registrations from Draft to Completion. Generate hall tickets.',
        path: '/exam-operations/registrations',
        color: 'from-blue-500 to-indigo-600',
        badge: 'Core',
    },
    {
        icon: '🏛️',
        title: 'Exam Venues',
        description: 'Manage exam centers, buildings, and rooms. Configure seating capacity.',
        path: '/exam-operations/venues',
        color: 'from-emerald-500 to-teal-600',
        badge: 'Infrastructure',
    },
    {
        icon: '🪑',
        title: 'Seating Allocation',
        description: 'Auto-allocate seats across rooms. Track changes with full audit logs.',
        path: '/exam-operations/seating',
        color: 'from-purple-500 to-violet-600',
        badge: 'Engine',
    },
    {
        icon: '👨‍🏫',
        title: 'Invigilation',
        description: 'Assign invigilators to sessions and rooms. Track availability.',
        path: '/exam-operations/invigilation',
        color: 'from-amber-500 to-orange-600',
        badge: 'Scheduling',
    },
    {
        icon: '📷',
        title: 'Exam Attendance',
        description: 'Mark attendance and scan QR hall tickets for real-time check-in.',
        path: '/exam-operations/attendance',
        color: 'from-rose-500 to-red-600',
        badge: 'Live',
    },
    {
        icon: '⏰',
        title: 'Scheduling',
        description: 'Configure exam sessions and assign rooms to exam schedules.',
        path: '/exam-operations/scheduling',
        color: 'from-cyan-500 to-blue-600',
        badge: 'Planning',
    },
    {
        icon: '📊',
        title: 'Result Publications',
        description: 'Manage 6-stage result approval workflow from Evaluation to Publishing.',
        path: '/exam-operations/publications',
        color: 'from-green-500 to-emerald-600',
        badge: 'Workflow',
    },
];

export const ExamOperationsDashboard: React.FC = () => {
    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-800 p-8 text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-10 text-8xl">📝</div>
                    <div className="absolute bottom-2 right-16 text-9xl">🎓</div>
                </div>
                <div className="relative">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs font-semibold">Phase 2C — Examination Operations</span>
                    </div>
                    <h1 className="text-3xl font-bold">Examination Operations</h1>
                    <p className="text-indigo-200 mt-2 max-w-xl">
                        Enterprise-grade examination management — from candidate registration to result publication.
                    </p>
                </div>
            </div>

            {/* Module Grid */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Operations Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map(module => (
                        <Link
                            key={module.path}
                            to={module.path}
                            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                        >
                            {/* Top gradient bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${module.color}`} />

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl shadow-sm`}>
                                        {module.icon}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {module.badge}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    {module.description}
                                </p>
                                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                                    Open Module
                                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExamOperationsDashboard;

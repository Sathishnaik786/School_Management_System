import React from 'react';
import { PenTool, Calendar, ShieldCheck, Users, HelpCircle } from 'lucide-react';
import KPICards from '../../components/widgets/KPICards';
import { ActionQueueWidget } from '../../components/widgets/DashboardWidgets';

export function ExamCellDashboard() {
    const examKPIs = [
        { title: 'Scheduled Exams', value: 12, description: 'Next 3 days', icon: Calendar, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { title: 'Papers to Grade', value: 24, description: 'Evaluation pending', icon: PenTool, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { title: 'Pass Rate', value: '88.4%', description: 'Academic criteria met', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
    ];

    const mockActions = [
        { id: '1', title: 'Grade Written Exam Sheet', description: 'Rohan Sharma (APP00124) submitted exam paper', status: 'urgent', time: 'Just now' },
        { id: '2', title: 'Schedule Interview Panel', description: 'Preeti Deshmukh (APP00142) passed entrance exam', status: 'pending', time: '3 hours ago' }
    ] as any;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Exam Cell Admissions Portal
            </h2>

            <KPICards cards={examKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Entrance Exam Marks Entry */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Entrance Exam Grading Board
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-100 text-xs">
                            {[
                                { name: 'Karan Malhotra', code: 'APP00111', grade: 'Grade 11', score: 85, status: 'PASSED' },
                                { name: 'Preeti Deshmukh', code: 'APP00142', grade: 'Grade 12', score: 92, status: 'PASSED' },
                                { name: 'Amit Kumar', code: 'APP00118', grade: 'Grade 5', score: 48, status: 'FAILED' }
                            ].map((item, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.code} • {item.grade}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-indigo-600">{item.score}/100</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                            item.status === 'PASSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Priority Queue */}
                <div className="space-y-6">
                    <ActionQueueWidget items={mockActions} />
                </div>
            </div>
        </div>
    );
}

export default ExamCellDashboard;

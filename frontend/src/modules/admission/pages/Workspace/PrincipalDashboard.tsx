import React from 'react';
import { Award, Users, CheckCircle, TrendingUp } from 'lucide-react';
import ExecutiveAnalytics from '../../components/analytics/ExecutiveAnalytics';
import { ActionQueueWidget } from '../../components/widgets/DashboardWidgets';

export function PrincipalDashboard() {
    const mockActions = [
        { id: '1', title: 'Approve Admission Offer Letter', description: 'Rohan Sharma (APP00124) recommended for Grade 5 admission', status: 'urgent', time: 'Just now' },
        { id: '2', title: 'Approve Merit List Batch', description: 'Grade 11 Entrance Exam merit list is ready', status: 'pending', time: '1 hour ago' }
    ] as any;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Principal Admission Executive Workspace
            </h2>

            {/* Executive Analytics Section */}
            <ExecutiveAnalytics />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Approvals Queue */}
                <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                        Offers & Final Approvals Queue
                    </h3>

                    <div className="divide-y divide-gray-100 text-xs">
                        {[
                            { name: 'Rohan Sharma', code: 'APP00124', grade: 'Grade 5', score: 91, status: 'RECOMMENDED' },
                            { name: 'Preeti Deshmukh', code: 'APP00142', grade: 'Grade 12', score: 94, status: 'RECOMMENDED' }
                        ].map((item, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.code} • {item.grade}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-indigo-600">Score: {item.score}/100</span>
                                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Actions */}
                <div className="space-y-6">
                    <ActionQueueWidget items={mockActions} />
                </div>
            </div>
        </div>
    );
}

export default PrincipalDashboard;

import React, { useState } from 'react';
import { Phone, Users, Calendar, PhoneCall, Sparkles } from 'lucide-react';
import KPICards from '../../components/widgets/KPICards';
import TaskList from '../../components/productivity/TaskList';
import Search from '../../components/productivity/Search';

export function CounselorDashboard() {
    const counselorKPIs = [
        { title: 'My Total Leads', value: 48, description: 'Assigned to me', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { title: 'Pending Callbacks', value: 6, description: 'Follow-ups scheduled', icon: Phone, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { title: 'Conversions', value: 12, description: 'SIS Enrolled successfully', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
    ];

    const [tasks, setTasks] = useState([
        { id: '1', text: 'Call back Rohan Sharma parent regarding fees', done: false, type: 'callback' as const, dueDate: 'Today' },
        { id: '2', text: 'Verify Grade 10 marksheets copy', done: false, type: 'document' as const, dueDate: 'Tomorrow' },
        { id: '3', text: 'Reschedule written entrance for Amit', done: true, type: 'general' as const }
    ]);

    const handleToggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Admissions Counselor Workspace
            </h2>

            <KPICards cards={counselorKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Search and Leads list */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                My Assigned Candidates
                            </h3>
                        </div>

                        <Search onSearch={(q, f) => console.log('searching', q, f)} />

                        <div className="divide-y divide-gray-100 text-xs">
                            {[
                                { name: 'Karan Malhotra', code: 'APP00124', grade: 'Grade 11', score: 88, temp: 'HOT', status: 'DOCUMENT_CHECK' },
                                { name: 'Preeti Deshmukh', code: 'APP00142', grade: 'Grade 5', score: 92, temp: 'WARM', status: 'INTERVIEW' },
                                { name: 'Sagar Sen', code: 'APP00155', grade: 'Grade 2', score: 76, temp: 'COLD', status: 'NEW' }
                            ].map((lead, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{lead.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{lead.code} • {lead.grade}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                            lead.temp === 'HOT' ? 'bg-orange-50 text-orange-600' : lead.temp === 'WARM' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {lead.temp}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reminders column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-5 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1">
                            <PhoneCall className="w-4 h-4 text-indigo-500" /> Pending Reminders
                        </h3>
                        <TaskList 
                            tasks={tasks}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CounselorDashboard;

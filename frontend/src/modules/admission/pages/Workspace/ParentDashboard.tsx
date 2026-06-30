import React from 'react';
import { FileText, CheckCircle, Clock, CreditCard, HelpCircle } from 'lucide-react';
import { TimelineEngine, TimelineNode } from '../../components/timeline/TimelineEngine';

export function ParentDashboard() {
    const parentNodes: TimelineNode[] = [
        { id: 'inquiry', stage: 'Inquiry Logged', role: 'Receptionist', operator: 'Front Desk Officer', status: 'complete', timestamp: '4 days ago', slaHours: 2 },
        { id: 'submit', stage: 'Application Form Submitted', role: 'Parent', operator: 'Parent Self-service', status: 'complete', timestamp: '3 days ago', slaHours: 24 },
        { id: 'docs', stage: 'Documents Verification', role: 'Admission Officer', operator: 'Admissions Desk', status: 'complete', timestamp: '2 days ago', slaHours: 24 },
        { id: 'exam', stage: 'Entrance Exam & Interview', role: 'Exam Cell', operator: 'SIS Coordinator', status: 'current', slaHours: 48 },
        { id: 'offer', stage: 'Admission Offer Letter', role: 'Principal', operator: 'Principal Office', status: 'upcoming', slaHours: 24 }
    ];

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                        Parent Console
                    </span>
                    <h2 className="text-xl font-black">Track Your Child's Admission</h2>
                    <p className="text-xs text-indigo-100 font-medium">
                        Your application for Grade 5 is currently in the Written Entrance Exam & Interview phase. 
                        Please make sure your child attends the scheduled center interview.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-8 pointer-events-none">
                    <FileText className="w-48 h-48 rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Progress Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                            Workflow Progress Stage
                        </h3>
                        <TimelineEngine nodes={parentNodes} />
                    </div>
                </div>

                {/* Right Checklist & Action Column */}
                <div className="space-y-6">
                    {/* Documents checklist */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Required Documents
                            </h3>
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black rounded-lg">
                                Verified
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            {[
                                { name: 'Birth Certificate', desc: 'Verified copy', status: 'verified' },
                                { name: 'Previous School Marksheet', desc: 'Term reports', status: 'verified' },
                                { name: 'Passport Size Photo', desc: 'Candidate photo', status: 'verified' }
                            ].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between py-1.5 border-b last:border-0 border-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{doc.name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{doc.desc}</p>
                                    </div>
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support card */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-5 rounded-2xl shadow-sm space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1">
                            <HelpCircle className="w-4 h-4 text-indigo-500" /> Need Assistance?
                        </h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Have questions regarding the entrance exam syllabus or interview timings? Get in touch with our helpdesk counselor.
                        </p>
                        <div className="pt-2">
                            <a 
                                href="mailto:admissions@greenwood.edu.in" 
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-colors"
                            >
                                Contact Counselor
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ParentDashboard;

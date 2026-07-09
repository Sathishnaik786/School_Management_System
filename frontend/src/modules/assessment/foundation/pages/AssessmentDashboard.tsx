import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Sparkles, Settings, FileText, ClipboardList, Database, CheckCircle, 
    ArrowUpRight, Users, Bell, ShieldCheck, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export const AssessmentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hr = currentTime.getHours();
        if (hr < 12) return "Good Morning";
        if (hr < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const cards = [
        { 
            label: 'Question Bank', 
            value: 342, 
            icon: FileText, 
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', 
            trend: '18 added this week', 
            link: '/app/assessment/questions' 
        },
        { 
            label: 'Active Templates', 
            value: 14, 
            icon: ClipboardList, 
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', 
            trend: '3 draft versions pending', 
            link: '/app/assessment/templates' 
        },
        { 
            label: 'Review Workflows', 
            value: 8, 
            icon: Settings, 
            color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', 
            trend: '2 approval chains active', 
            link: '/app/assessment/settings' 
        },
        { 
            label: 'Active Candidates', 
            value: 128, 
            icon: Users, 
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', 
            trend: 'Next entrance in 24h', 
            link: '/app/admissions/exams' 
        },
    ];

    const actions = [
        { label: 'Settings & Workflows', icon: Settings, link: '/app/assessment/settings', desc: 'Rules & approval chains' },
        { label: 'Question Bank Manager', icon: FileText, link: '/app/assessment/questions', desc: 'Manage question entries' },
        { label: 'Template Builder', icon: ClipboardList, link: '/app/assessment/templates', desc: 'Create test templates' },
        { label: 'Entrance Exams', icon: ShieldCheck, link: '/app/admissions/exams', desc: 'Candidates list & evaluation' },
    ];

    return (
        <div className="space-y-6 lg:space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-card p-6 rounded-3xl border border-border/40 shadow-premium-sm">
                <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                        <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                        Assessment Governance Console
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {getGreeting()}, {user?.full_name || 'Administrator'}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        System active | {formattedDate}
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button className="flex items-center gap-2 p-2.5 bg-white dark:bg-card border border-border/40 rounded-xl hover:bg-gray-50 text-muted-foreground hover:text-primary transition-all shadow-premium-sm">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-all shadow-premium-md text-xs hover:scale-[1.01]">
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                        Sync Registry
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className="group relative bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-premium-sm hover:shadow-premium-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${c.color}`}>
                                <c.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">{c.trend}</span>
                        </div>
                        <div className="mt-5 space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                {c.label}
                            </p>
                            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                {c.value}
                            </span>
                        </div>
                        {c.link && (
                            <Link to={c.link} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-muted/60 hover:bg-primary hover:text-white rounded-lg text-muted-foreground">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Action panel & Vitals grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Operations Toolkit */}
                <div className="md:col-span-2 bg-white dark:bg-card border border-border/40 rounded-3xl p-6 shadow-premium-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                            <Database className="text-primary w-4.5 h-4.5" />
                            Assessment Operations Toolkit
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {actions.map((action, i) => (
                            <Link
                                key={i}
                                to={action.link}
                                className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-gray-50/20 dark:bg-muted/5 transition-all duration-200 group hover:bg-white dark:hover:bg-card hover:border-primary/20 hover:shadow-premium-md hover:scale-[1.01]"
                            >
                                <div className="w-10 h-10 bg-white dark:bg-muted/15 rounded-xl flex items-center justify-center border border-border/40 shadow-premium-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-colors">
                                    <action.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate">{action.label}</div>
                                    <div className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">{action.desc}</div>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System Vitality Panel */}
                <div className="bg-gradient-to-br from-gray-950 to-slate-900 rounded-3xl p-6 text-white shadow-premium-xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-bl-full filter blur-xl"></div>
                    <div>
                        <h3 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle className="text-primary w-4.5 h-4.5" />
                            Assessment Engine Health
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Attempt Dispatcher</span>
                                    <p className="text-xs font-black">All engines operational</p>
                                </div>
                                <span className="text-[9px] font-black uppercase py-0.5 px-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">Active</span>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Evaluation Queue</span>
                                    <p className="text-xs font-black">AI grader responsive</p>
                                </div>
                                <span className="text-[9px] font-black uppercase py-0.5 px-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">Healthy</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] text-white/40 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                        Next automated database health check scheduled for 00:00 UTC.
                    </div>
                </div>
            </div>
        </div>
    );
};

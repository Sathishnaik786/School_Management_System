import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import {
    Users,
    GraduationCap,
    BookOpen,
    FileCheck,
    ArrowUpRight,
    Search,
    ShieldCheck,
    Calendar,
    Settings,
    Bell,
    CheckCircle,
    ClipboardList,
    TrendingUp,
    Coins,
    CreditCard,
    Bus,
    Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityTimeline } from '../../../components/ActivityTimeline';

export const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/dashboard/admin/overview')
            .then(res => setStats(res.data))
            .catch(err => console.error('Dashboard load failed', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading Institutional Analytics...</p>
            </div>
        </div>
    );

    const cards = [
        { label: 'Total Students', value: stats?.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Admissions', value: stats?.pendingAdmissions, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50', link: '/app/admissions/review' },
        { label: 'Exams Scheduled', value: stats?.exams, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Fee Collection', value: 'Rs.' + (stats?.feeCollection || '0'), icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const quickActions = [
        { label: 'Review Admissions', icon: FileCheck, link: '/app/admissions/review', desc: `${stats?.pendingAdmissions || 0} applications pending` },
        { label: 'Academic Setup', icon: GraduationCap, link: '/app/academic/classes', desc: 'Classes & Sections' },
        { label: 'Exam Management', icon: BookOpen, link: '/app/exams/manage', desc: 'Planning & Results' },
        { label: 'Fee Structures', icon: Coins, link: '/app/fees/structures', desc: 'Manage Fees' },
        { label: 'Assign Fees', icon: FileCheck, link: '/app/fees/assign', desc: 'Student Billing' },
        { label: 'Record Payment', icon: CreditCard, link: '/app/fees/payments', desc: 'Cash/Cheque Entry' },
        { label: 'System Settings', icon: Settings, link: '/app/settings', desc: 'Global configuration' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
                    <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Welcome back, Administrator. Here's what's happening today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        <Bell className="w-5 h-5 text-gray-600" />
                    </button>
                    <Link to="/app/admissions/review" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 hover:scale-[1.02]">
                        <ShieldCheck className="w-5 h-5" />
                        Admin Actions
                    </Link>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {cards.map((c, i) => (
                    <div key={i} className="group relative bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                        <div className={`w-14 h-14 ${c.bg} ${c.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <c.icon className="w-7 h-7" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{c.label}</div>
                                <div className="text-4xl font-black text-gray-900 tracking-tighter">{c.value}</div>
                            </div>
                            {c.link && (
                                <Link to={c.link} className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-full text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <ArrowUpRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <ClipboardList className="text-blue-600 w-6 h-6" />
                                Administrative Core
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    to={action.link}
                                    className="flex items-center gap-4 p-5 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                                        <action.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{action.label}</div>
                                        <div className="text-sm text-gray-400">{action.desc}</div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-blue-600 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <TrendingUp className="text-emerald-600 w-6 h-6" />
                            Live School Feed
                        </h3>
                        <ActivityTimeline />
                    </div>
                </div>

                {/* System Vitality Panel */}
                <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-8 text-white shadow-2xl">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <CheckCircle className="text-blue-400 w-6 h-6" />
                        System Health
                    </h3>
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-white/60">Server Status</span>
                                <span className="text-xs font-bold uppercase py-0.5 px-2 bg-green-500/20 text-green-400 rounded">Optimal</span>
                            </div>
                            <div className="text-lg font-bold">API Gateway Online</div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-white/60">Total Applications</span>
                                <span className="text-xs font-bold uppercase py-0.5 px-2 bg-blue-500/20 text-blue-400 rounded">Live</span>
                            </div>
                            <div className="text-lg font-bold">{stats?.totalApplications || 0} Registered</div>
                        </div>

                        <div className="pt-4">
                            <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">
                                <Settings className="w-5 h-5" />
                                Maintenance Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Link } from 'react-router-dom';
import {
    FileText,
    Bell,
    Clock,
    CheckCircle2,
    Circle,
    ArrowRight,
    CreditCard,
    Calendar,
    GraduationCap,
    BookOpen,
    ShieldCheck
} from 'lucide-react';
import { ActivityTimeline } from '../../../components/ActivityTimeline';
import { Badge } from '../../../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

type FeeTrackerState = 'DUE' | 'VERIFYING' | 'VERIFIED' | 'HIDDEN';

export const ParentDashboard = () => {
    const [children, setChildren] = useState<any[]>([]);
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [feeData, setFeeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkCode, setLinkCode] = useState('');
    const [linking, setLinking] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [childRes, feeRes] = await Promise.all([
                    apiClient.get('/dashboard/parent/overview'),
                    apiClient.get('/fees/my')
                ]);
                setChildren(childRes.data.children);
                setAdmissions(childRes.data.admissions);
                setFeeData(feeRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleLink = async () => {
        try {
            setLinking(true);
            await apiClient.post('/students/my/link', { student_code: linkCode.trim() });
            alert("Success! Student linked.");
            window.location.reload();
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to link student");
            setLinking(false);
        }
    };

    const getFeeBalance = (studentId: string) => {
        const record = feeData.find(f => f.student?.id === studentId);
        return record?.summary?.balance || 0;
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'submitted': return 'Your application has been received and is waiting for initial review.';
            case 'under_review': return 'An Admission Officer is currently reviewing your documents.';
            case 'docs_verified': return 'Documents verified! The school will soon enable the fee payment option for you.';
            case 'payment_pending': return 'ACTION REQUIRED: Please submit your admission fee to proceed.';
            case 'payment_submitted': return 'Payment details received. Our finance team is verifying your transaction.';
            case 'payment_verified': return 'Payment verified! Your application is now moving for final school approval.';
            case 'recommended': return 'Recommended for admission! Waiting for final approval from the Head of Institution.';
            case 'approved': return 'CONGRATULATIONS! Your admission is approved. You will be enrolled soon.';
            default: return 'Monitoring your application progress...';
        }
    };

    // Canonical Tracker State Derivation (The Single Source of Truth)
    const getTrackerState = (app: any): FeeTrackerState => {
        if (!app?.payment_enabled) return 'HIDDEN';
        // If payment_reference exists AND it's not verified/recommended yet -> VERIFYING
        if (app.payment_reference && app.status !== 'payment_verified' && !['recommended', 'approved', 'enrolled'].includes(app.status)) {
            return 'VERIFYING';
        }
        // If verified or beyond -> VERIFIED
        if (['payment_verified', 'recommended', 'approved', 'enrolled'].includes(app.status)) {
            return 'VERIFIED';
        }
        // Otherwise it's DUE (Billing initialized but no reference or verified status yet)
        return 'DUE';
    };

    const trackerContext = useMemo(() => {
        const activeApps = (admissions || []).filter(a => getTrackerState(a) !== 'HIDDEN');
        const hasDue = activeApps.some(a => getTrackerState(a) === 'DUE');
        const isVerifying = activeApps.some(a => getTrackerState(a) === 'VERIFYING');
        const totalAmount = activeApps.reduce((sum, a) => sum + Number(a.payment_amount), 0);
        const stateKey = activeApps.map(a => getTrackerState(a)).join('-');

        return { activeApps, hasDue, isVerifying, totalAmount, stateKey };
    }, [admissions]);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

    const totalStudents = children.length;
    const totalDue = feeData.reduce((sum, f) => sum + (f.summary?.balance || 0), 0);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans text-slate-800 animate-in fade-in duration-700">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back! 👋</h1>
                    <p className="text-gray-500 mt-1">Track your child's academic journey and manage school activities.</p>
                </div>
            </div>

            {/* 2. Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Children</div>
                            <div className="text-4xl font-black text-gray-900">{totalStudents}</div>
                            <div className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active Profiles
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admission Fees</div>
                            <div className={`text-4xl font-black ${trackerContext.hasDue ? 'text-amber-600' : (trackerContext.isVerifying ? 'text-blue-600' : 'text-emerald-600')}`}>
                                {trackerContext.hasDue ? 'Action Due' : (trackerContext.activeApps.length > 0 ? (trackerContext.isVerifying ? 'Processing' : 'All Clear') : 'No Billing')}
                            </div>
                            <div className="text-xs text-gray-500 font-bold mt-2">
                                {trackerContext.activeApps.length > 0
                                    ? `Total: Rs. ${trackerContext.totalAmount.toLocaleString()}`
                                    : 'Gateway inactive'}
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${trackerContext.hasDue ? 'bg-amber-50 text-amber-600' : (trackerContext.isVerifying ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600')}`}>
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                {admissions.some(a => a.status === 'enrolled') ? 'Academic Fees' : 'Upcoming Academic Fees'}
                            </div>
                            <div className={`text-4xl font-black ${totalDue > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                                {totalDue > 0 ? 'Bills Due' : 'Paid'}
                            </div>
                            <div className="text-xs text-gray-500 font-bold mt-1">
                                Ledger Balance: Rs. {totalDue.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2.5 Admission Fee Status Tracker (Hardened Canonical UI) */}
            <AnimatePresence mode="wait">
                {trackerContext.activeApps.length > 0 && (
                    <motion.div
                        key={trackerContext.stateKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-blue-500/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <CreditCard className="w-48 h-48 -rotate-12" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fee Obligations Tracker</h3>
                                <p className="text-sm text-slate-400 font-bold mt-1">Real-time roadmap for your admission financial cycle.</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {trackerContext.activeApps.map(a => {
                                const state = getTrackerState(a);
                                const isDue = state === 'DUE';
                                const isVerifying = state === 'VERIFYING';
                                const isVerified = state === 'VERIFIED';

                                return (
                                    <div key={a.id} className={`group relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-8 rounded-3xl border transition-all duration-300 ${isDue ? 'bg-amber-50/20 border-amber-100 hover:border-amber-200' :
                                        isVerifying ? 'bg-blue-50/20 border-blue-100 hover:border-blue-200' :
                                            'bg-slate-50/50 border-slate-100 hover:border-emerald-200'
                                        }`}>
                                        {/* Left: Component Info */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${isDue ? 'bg-amber-500 animate-pulse' : (isVerifying ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500')}`} />
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{a.student_name}</div>
                                            </div>
                                            <div className="text-4xl font-black text-slate-900 tracking-tighter">₹{Number(a.payment_amount).toLocaleString()}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[9px] font-black bg-slate-200/50 text-slate-600">{a.grade_applied_for} ADMISSION</Badge>
                                                <Link to={`/app/admissions/${a.id}`} className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-widest">Detail View →</Link>
                                            </div>
                                        </div>

                                        {/* Center: Roadmap (Phase Roadmap) */}
                                        <div className="flex-1 max-w-2xl px-4">
                                            <div className="relative pt-6">
                                                <div className="flex justify-between relative z-10">
                                                    {/* Phase 1: Due */}
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isDue ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-110' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'}`}>
                                                            <Clock className="w-4 h-4" />
                                                        </div>
                                                        <span className={`text-[9px] lg:text-xs font-black uppercase tracking-tighter mt-3 ${isDue ? 'text-amber-600' : 'text-emerald-600'}`}>Due Fee</span>
                                                    </div>

                                                    {/* Line 1-2 */}
                                                    <div className="flex-1 h-[2px] mt-4 bg-slate-200 mx-2 relative overflow-hidden">
                                                        {!isDue && <div className="absolute inset-0 bg-emerald-500" />}
                                                    </div>

                                                    {/* Phase 2: Verification */}
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isVerifying ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' :
                                                            (isVerified ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-400')
                                                            }`}>
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </div>
                                                        <span className={`text-[9px] lg:text-xs font-black uppercase tracking-tighter mt-3 ${isVerifying ? 'text-blue-600' : (isVerified ? 'text-emerald-600' : 'text-slate-400')}`}>Verification</span>
                                                    </div>

                                                    {/* Line 2-3 */}
                                                    <div className="flex-1 h-[2px] mt-4 bg-slate-200 mx-2 relative overflow-hidden">
                                                        {isVerified && <div className="absolute inset-0 bg-emerald-500" />}
                                                    </div>

                                                    {/* Phase 3: Paid */}
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isVerified ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110' : 'bg-slate-200 text-slate-400'
                                                            }`}>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                        <span className={`text-[9px] lg:text-xs font-black uppercase tracking-tighter mt-3 ${isVerified ? 'text-emerald-600 font-black' : 'text-slate-400'}`}>Paid & Verified</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Summary */}
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">{isVerified ? 'Milestone Reached' : 'Status'}</div>
                                            <div className={`inline-flex px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border ${isDue ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                isVerifying ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {isDue ? 'Payment Pending' :
                                                    isVerifying ? 'Verifying Ref' :
                                                        'Payment Complete'}
                                            </div>
                                            {a.payment_reference && state !== 'DUE' && (
                                                <div className="mt-2 group/ref relative cursor-help inline-block">
                                                    <div className="text-[9px] font-mono text-slate-400 font-bold uppercase underline decoration-dotted">TXN: {a.payment_reference}</div>
                                                    <div className="absolute bottom-full right-0 mb-2 invisible group-hover/ref:visible bg-slate-900 text-white text-[9px] px-3 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-2xl">
                                                        This reference is currently under school verification.
                                                        <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Student Detail Cards */}
                <div className="lg:col-span-2 space-y-8">
                    {admissions.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Active Applications
                            </h2>
                            {admissions.map((app) => (
                                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6 flex justify-between items-center bg-amber-50/30 font-sans">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{app.student_name}</h3>
                                            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Applied for: {app.grade_applied_for}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                            <Link
                                                to={`/app/admissions/${app.id}`}
                                                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                View Details <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-white border-t border-amber-50">
                                        <p className="text-sm text-amber-800 font-medium mb-4 italic">
                                            "{getStatusMessage(app.status)}"
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-1000"
                                                    style={{
                                                        width:
                                                            app.status === 'submitted' ? '15%' :
                                                                app.status === 'under_review' ? '30%' :
                                                                    app.status === 'docs_verified' ? '45%' :
                                                                        app.status.startsWith('payment') ? '60%' :
                                                                            app.status === 'recommended' ? '80%' :
                                                                                app.status === 'approved' ? '95%' : '100%'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                {app.status === 'submitted' ? 'Stage 1/7' :
                                                    app.status === 'under_review' ? 'Stage 2/7' :
                                                        app.status === 'docs_verified' ? 'Stage 3/7' :
                                                            app.status.startsWith('payment') ? 'Stage 4/7' :
                                                                app.status === 'recommended' ? 'Stage 5/7' :
                                                                    app.status === 'approved' ? 'Stage 6/7' : 'Stage 7/7'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {children.length === 0 && admissions.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                            <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Students Linked</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">Please contact the school administration to link your student profile to this account.</p>
                        </div>
                    ) : (
                        children.map((child) => {
                            const s = child.student;
                            const balance = getFeeBalance(child.student_id);

                            return (
                                <div key={child.student_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{s.full_name}</h3>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {s.student_code}</div>
                                        </div>
                                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide border border-green-200">
                                            {s.status}
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        {/* Faculty Section */}
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                                Assigned Faculty
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {s.faculty_assignments?.length > 0 ? (
                                                    s.faculty_assignments.map((fa: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 p-2 pr-4 rounded-xl shadow-sm">
                                                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-xs">
                                                                {fa.faculty?.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-900">{fa.faculty?.full_name}</div>
                                                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Academic Guide</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-[10px] font-bold text-gray-300 italic">No faculty mapped yet</div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-8 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                Life at School
                                            </h4>
                                            <ActivityTimeline />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right Column: Quick Links & Tools */}
                <div className="space-y-6">
                    {/* Quick Notifications (Replaces Ext App) */}
                    {/* 
                      Note: You can add a quick notification text list here if needed, 
                      but user asked to replace 'Track Ext App' and keep 'Quick Actions'.
                      I'll just promote Quick Actions to top naturally.
                     */}

                    {/* Quick Links */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-1">
                            <Link to="/app/fees/my" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Pay Fees</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link to="/app/exams/results" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Detailed Marksheet</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link to="/app/timetable/my" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Class Timetable</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link to="/app/student/assignments" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Track Homework</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Need Help?</h3>
                            <p className="text-blue-100 text-sm mb-4">Contact school administration regarding admission or fees.</p>
                            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors border border-white/20">
                                Contact Support
                            </button>
                        </div>
                        <Circle className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform duration-700" strokeWidth={40} />
                    </div>
                </div>
            </div>
        </div>
    );
};

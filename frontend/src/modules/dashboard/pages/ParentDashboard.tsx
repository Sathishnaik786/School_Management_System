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
    ShieldCheck,
    Sparkles,
    Users
} from 'lucide-react';
import { ActivityTimeline } from '../../../components/ActivityTimeline';
import { Badge } from '../../../components/ui/badge';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { PageWrapper } from '../../../components/layout/PageWrapper';

type FeeTrackerState = 'DUE' | 'VERIFYING' | 'VERIFIED' | 'HIDDEN';

const AnimatedNumber = ({ value }: { value: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' });
        return rounded.on("change", (latest) => setDisplayVal(latest));
    }, [value]);

    return <span>{displayVal.toLocaleString()}</span>;
};

export const ParentDashboard = () => {
    const [children, setChildren] = useState<any[]>([]);
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [feeData, setFeeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Tracker State Derivation
    const getTrackerState = (app: any): FeeTrackerState => {
        if (!app?.payment_enabled) return 'HIDDEN';
        if (app.payment_reference && app.status !== 'payment_verified' && !['recommended', 'approved', 'enrolled'].includes(app.status)) {
            return 'VERIFYING';
        }
        if (['payment_verified', 'recommended', 'approved', 'enrolled'].includes(app.status)) {
            return 'VERIFIED';
        }
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Parent Portal...</p>
        </div>
    );

    const totalStudents = children.length;
    const totalDue = feeData.reduce((sum, f) => sum + (f.summary?.balance || 0), 0);

    const kpis = [
        { label: 'My Children', value: totalStudents, icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', sub: 'Active profiles' },
        {
            label: 'Admission status',
            value: trackerContext.hasDue ? 1 : 0,
            icon: CreditCard,
            color: trackerContext.hasDue ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            sub: trackerContext.hasDue ? 'Payment Pending' : 'All clear'
        },
        { label: 'Academic fees due', value: totalDue, icon: ShieldCheck, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', format: '₹', sub: 'Invoice generated' }
    ];

    const kpiElements = kpis.map((c, i) => (
        <div key={i} className="group relative bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-premium-sm hover:shadow-premium-md transition-all duration-300 card-hover-lift flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${c.color}`}>
                    <c.icon className="w-6 h-6" />
                </div>
            </div>

            <div className="mt-5 space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                    {c.label}
                </p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {c.format}
                        <AnimatedNumber value={c.value} />
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground ml-1">{c.sub}</span>
                </div>
            </div>
        </div>
    ));

    return (
        <PageWrapper
            title="Parent Dashboard"
            description="Track your child's academic cycles, grade logs, and fee ledger obligations."
            icon={Sparkles}
            kpis={<>{kpiElements}</>}
            timeline={
                <div className="space-y-6 lg:space-y-8">
                    {/* Quick actions links */}
                    <div className="bg-white dark:bg-card border border-border/40 rounded-3xl p-6 shadow-premium-sm">
                        <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider pb-4 border-b border-border/40 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Shortcut Actions
                        </h3>
                        <div className="space-y-2 font-bold">
                            <Link to="/app/fees/my" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/50 group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground">Pay Fees Portal</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:translate-x-0.5 transition-transform" />
                            </Link>

                            <Link to="/app/exams/results" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/50 group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground">Marksheet Tracker</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:translate-x-0.5 transition-transform" />
                            </Link>

                            <Link to="/app/timetable/my" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/50 group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground">Campus Timetable</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-indigo-800 p-6 rounded-3xl text-white shadow-premium-lg relative overflow-hidden">
                        <h3 className="font-black text-sm mb-1">Portal Assistance</h3>
                        <p className="text-white/80 text-xs mb-4">Need help regarding admissions, document processing, or fees? Contact school desk.</p>
                        <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm transition-all">
                            Submit Inquiry
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6 lg:space-y-8">
                {/* Active Fee Obligations Tracker Roadmap */}
                <AnimatePresence mode="wait">
                    {trackerContext.activeApps.length > 0 && (
                        <motion.div
                            key={trackerContext.stateKey}
                            className="bg-white dark:bg-card p-6 rounded-3xl border border-border/40 shadow-premium-sm relative overflow-hidden"
                        >
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6 pb-4 border-b border-border/40">
                                Financial Roadmap Tracker
                            </h3>

                            <div className="space-y-4">
                                {trackerContext.activeApps.map(a => {
                                    const state = getTrackerState(a);
                                    const isDue = state === 'DUE';
                                    const isVerifying = state === 'VERIFYING';
                                    const isVerified = state === 'VERIFIED';

                                    return (
                                        <div key={a.id} className="p-5 rounded-2xl border border-border/40 bg-gray-50/20 dark:bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{a.student_name}</span>
                                                <div className="text-2xl font-black text-gray-900 dark:text-white">₹{Number(a.payment_amount).toLocaleString()}</div>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${
                                                    isDue ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    isVerifying ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                }`}>
                                                    {isDue ? 'Due' : isVerifying ? 'Verifying' : 'Complete'}
                                                </div>
                                                <Link to={`/app/admissions/${a.id}`} className="text-[10px] font-black text-indigo-500 uppercase hover:underline">
                                                    Manage →
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Kids Overview */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        My Children Profiles
                    </h2>

                    {children.length === 0 && admissions.length === 0 ? (
                        <div className="bg-white dark:bg-card p-12 rounded-3xl border border-dashed border-border/60 text-center">
                            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <h3 className="text-sm font-black text-gray-900 dark:text-white">No active profiles mapped</h3>
                            <p className="text-xs text-muted-foreground mt-1.5">Contact school administrators to link student registries.</p>
                        </div>
                    ) : (
                        children.map((child) => {
                            const s = child.student;
                            return (
                                <div key={child.student_id} className="bg-white dark:bg-card border border-border/40 rounded-3xl overflow-hidden shadow-premium-sm">
                                    <div className="p-6 bg-gray-50/50 dark:bg-muted/10 border-b border-border/40 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-black text-sm text-gray-900 dark:text-white">{s.full_name}</h3>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {s.student_code}</p>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            {s.status}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">Assigned Academic Guides</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {s.faculty_assignments?.map((fa: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2.5 bg-gray-50/40 dark:bg-muted/5 border border-border/40 px-3.5 py-2 rounded-xl">
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                                        {fa.faculty?.full_name?.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{fa.faculty?.full_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

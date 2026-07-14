import React, { useState, useMemo, useEffect } from 'react';
import {
    UserPlus, Users, Search, Calendar, PhoneCall, ClipboardList,
    CheckCircle, Clock, LogOut, Printer, RefreshCw, X, AlertCircle, FilePlus, Filter, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { useLeadDashboard } from '../../hooks/useLeads';
import { useCreateEnquiry, useCreateVisitor, useVisitors, useUpdateVisitor } from '../../hooks/useInquiry';
import { useFollowups, useCompleteFollowup } from '../../hooks/useFollowups';
import { LeadMetricsPanel } from '../../components/inquiry/LeadMetrics';
import { findDuplicates } from '../../utils/duplicate.detector';
import { parseAdmissionApiError } from '../../utils/admissionError.utils';
import { LeadDuplicateAlert } from '../../components/inquiry/LeadDuplicateAlert';
import { useAuth } from '../../../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';
import { useAdmissionMasterData } from '../../context/AdmissionMasterDataContext';
import { studentApi } from '../../../student/services/student.api';
import { normalizeApiList } from '../../utils/lead.mapper';

type TabType = 'admissions' | 'visitors' | 'lookup' | 'appointments' | 'calls';

interface LocalAppointment {
    id: string;
    visitorName: string;
    phone: string;
    date: string;
    time: string;
    counselorId: string;
    counselorName: string;
    purpose: string;
}

interface LocalCallLog {
    id: string;
    callerName: string;
    phone: string;
    type: 'Inbound' | 'Outbound';
    purpose: string;
    remarks: string;
    timestamp: string;
}

export function ReceptionistDashboard() {
    const { hasPermission } = useAuth();
    const { grades, activeSchoolId, activeAcademicYearId } = useMasterData();
    const { counselors } = useAdmissionMasterData();

    const canManageLeads = hasPermission('admission.leads.manage');
    const canManageVisitors = hasPermission('admission.visitors.manage');

    const { metrics, allRecords, refetch: refetchDashboard } = useLeadDashboard();
    const { data: rawVisitors, refetch: refetchVisitors, isLoading: isVisitorsLoading } = useVisitors();
    const createEnquiry = useCreateEnquiry();
    const createVisitor = useCreateVisitor();
    const updateVisitor = useUpdateVisitor();

    // Local state for tabs
    const [activeTab, setActiveTab] = useState<TabType>('admissions');

    // Admissions Form State
    const [parentName, setParentName] = useState('');
    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [grade, setGrade] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Male');
    const [isSuccess, setIsSuccess] = useState(false);

    // General Visitor Form State
    const [visName, setVisName] = useState('');
    const [visPhone, setVisPhone] = useState('');
    const [visPurpose, setVisPurpose] = useState('');
    const [visType, setVisType] = useState<'Walk-in' | 'Campus Tour' | 'Meeting' | 'Admission Inquiry' | 'Parent Meeting'>('Walk-in');
    const [visCounselorId, setVisCounselorId] = useState('');
    const [visRemarks, setVisRemarks] = useState('');
    const [showVisModal, setShowVisModal] = useState(false);

    // Checkout Modal State
    const [checkoutVisitorId, setCheckoutVisitorId] = useState<string | null>(null);
    const [checkoutOutcome, setCheckoutOutcome] = useState('Completed');
    const [checkoutRemarks, setCheckoutRemarks] = useState('');
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);

    // Visitor Pass State
    const [passVisitor, setPassVisitor] = useState<any | null>(null);
    const [showPassModal, setShowPassModal] = useState(false);

    // Student Lookup State
    const [lookupQuery, setLookupQuery] = useState('');
    const [lookupResults, setLookupResults] = useState<any[]>([]);
    const [isLookupLoading, setIsLookupLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    // Local Storage Persisted States (Appointments, Calls, Notes)
    const [appointments, setAppointments] = useState<LocalAppointment[]>([]);
    const [calls, setCalls] = useState<LocalCallLog[]>([]);
    const [notes, setNotes] = useState<string[]>([]);
    const [newNote, setNewNote] = useState('');

    // Appointment Form
    const [aptName, setAptName] = useState('');
    const [aptPhone, setAptPhone] = useState('');
    const [aptDate, setAptDate] = useState('');
    const [aptTime, setAptTime] = useState('');
    const [aptCounselorId, setAptCounselorId] = useState('');
    const [aptPurpose, setAptPurpose] = useState('Admission counseling');

    // Call Form
    const [callName, setCallName] = useState('');
    const [callPhone, setCallPhone] = useState('');
    const [callType, setCallType] = useState<'Inbound' | 'Outbound'>('Inbound');
    const [callPurpose, setCallPurpose] = useState('Admission enquiry');
    const [callRemarks, setCallRemarks] = useState('');

    // Filters
    const [gradeFilter, setGradeFilter] = useState('');
    const [searchEnquiryQuery, setSearchEnquiryQuery] = useState('');

    // Initialize default grade and counselor
    useEffect(() => {
        if (grades.length > 0 && !grade) {
            setGrade(grades[0].name);
        }
    }, [grades, grade]);

    useEffect(() => {
        if (counselors.length > 0 && !visCounselorId) {
            setVisCounselorId(counselors[0].id);
        }
        if (counselors.length > 0 && !aptCounselorId) {
            setAptCounselorId(counselors[0].id);
        }
    }, [counselors, visCounselorId, aptCounselorId]);

    // Load Local Persisted Data
    useEffect(() => {
        const cachedApts = localStorage.getItem('reception_appointments');
        const cachedCalls = localStorage.getItem('reception_calls');
        const cachedNotes = localStorage.getItem('reception_notes');

        if (cachedApts) setAppointments(JSON.parse(cachedApts));
        if (cachedCalls) setCalls(JSON.parse(cachedCalls));
        if (cachedNotes) setNotes(JSON.parse(cachedNotes));
    }, []);

    // Save helpers
    const saveAppointments = (data: LocalAppointment[]) => {
        setAppointments(data);
        localStorage.setItem('reception_appointments', JSON.stringify(data));
    };

    const saveCalls = (data: LocalCallLog[]) => {
        setCalls(data);
        localStorage.setItem('reception_calls', JSON.stringify(data));
    };

    const saveNotes = (data: string[]) => {
        setNotes(data);
        localStorage.setItem('reception_notes', JSON.stringify(data));
    };

    // Normalize Visitors list
    const visitorsList = useMemo(() => {
        return normalizeApiList<any>(rawVisitors);
    }, [rawVisitors]);

    // Real-time duplicates checking
    const duplicates = useMemo(() => {
        if (phone.length > 5 || email.length > 5 || studentName.length > 2) {
            return findDuplicates(
                { phone, email, parent_name: parentName, student_name: studentName },
                allRecords,
            );
        }
        return [];
    }, [phone, email, parentName, studentName, allRecords]);

    const handleRefresh = async () => {
        const t = toast.loading('Refreshing console...');
        await Promise.all([refetchDashboard(), refetchVisitors()]);
        toast.dismiss(t);
        toast.success('Workspace updated');
    };

    // Register Walks-in Inquiry (Fills Enquiry/Lead and registers visitor)
    const handleRegisterInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentName || !phone || !studentName) {
            toast.error('Student Name, Parent Name, and Mobile Number are required.');
            return;
        }

        const loadToast = toast.loading('Registering Walk-in Inquiry...');
        try {
            // 1. Create Enquiry
            await createEnquiry.mutateAsync({
                school_id: activeSchoolId,
                academic_year_id: activeAcademicYearId,
                student_name: studentName.trim(),
                parent_name: parentName.trim(),
                parent_email: email.trim(),
                parent_phone: phone.trim(),
                grade_applied_for: grade,
                source: 'Walk-in',
                date_of_birth: dob || null,
                gender: gender,
            });

            // 2. Create Visitor (Passes validation by explicitly providing visit_type)
            await createVisitor.mutateAsync({
                visitor_name: parentName.trim(),
                phone: phone.trim(),
                purpose: `Admission Inquiry for Grade ${grade}`,
                visit_type: 'Admission Inquiry', // Resolves 400 validation error
                counselor_id: visCounselorId || null,
                remarks: `Logged applicant: ${studentName}`
            }).catch(err => {
                console.error('[Visitor Logging Failed]', err);
            });

            toast.dismiss(loadToast);
            setIsSuccess(true);
            refetchDashboard();
            refetchVisitors();

            setTimeout(() => {
                setIsSuccess(false);
                setParentName('');
                setStudentName('');
                setEmail('');
                setPhone('');
                setDob('');
            }, 2000);
        } catch (err) {
            toast.dismiss(loadToast);
            toast.error(parseAdmissionApiError(err).message);
        }
    };

    // General Visitor check-in
    const handleRegisterVisitor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visName || !visPhone || !visPurpose) {
            toast.error('Visitor Name, Contact number, and Purpose are required.');
            return;
        }

        const t = toast.loading('Registering visitor check-in...');
        try {
            await createVisitor.mutateAsync({
                visitor_name: visName.trim(),
                phone: visPhone.trim(),
                purpose: visPurpose.trim(),
                visit_type: visType,
                counselor_id: visCounselorId || null,
                remarks: visRemarks.trim() || null
            });

            toast.dismiss(t);
            toast.success('Visitor checked in successfully');
            setShowVisModal(false);
            setVisName('');
            setVisPhone('');
            setVisPurpose('');
            setVisRemarks('');
            refetchVisitors();
        } catch (err) {
            toast.dismiss(t);
            toast.error(parseAdmissionApiError(err).message);
        }
    };

    // General Visitor check-out
    const handleCheckoutVisitor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutVisitorId) return;

        const t = toast.loading('Checking out visitor...');
        try {
            await updateVisitor.mutateAsync({
                id: checkoutVisitorId,
                data: {
                    time_out: new Date().toISOString(),
                    visit_outcome: checkoutOutcome,
                    remarks: checkoutRemarks.trim() || null
                }
            });

            toast.dismiss(t);
            toast.success('Visitor checked out');
            setShowCheckoutModal(false);
            setCheckoutVisitorId(null);
            setCheckoutRemarks('');
            refetchVisitors();
        } catch (err) {
            toast.dismiss(t);
            toast.error(parseAdmissionApiError(err).message);
        }
    };

    // Student Lookup handler
    const handleStudentLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lookupQuery.trim().length < 2) {
            toast.error('Please enter at least 2 characters to search.');
            return;
        }
        setIsLookupLoading(true);
        setSelectedStudent(null);
        try {
            const res = await studentApi.list({ search: lookupQuery });
            setLookupResults(res.data || []);
            if (res.data?.length === 0) {
                toast.error('No matching student found.');
            }
        } catch (err) {
            toast.error('Failed to query student database.');
        } finally {
            setIsLookupLoading(false);
        }
    };

    // Book Appointment
    const handleAddAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aptName || !aptPhone || !aptDate || !aptTime) {
            toast.error('Please fill in all required appointment fields.');
            return;
        }

        const counselorName = counselors.find(c => c.id === aptCounselorId)?.full_name || 'Unassigned';
        const newApt: LocalAppointment = {
            id: crypto.randomUUID(),
            visitorName: aptName.trim(),
            phone: aptPhone.trim(),
            date: aptDate,
            time: aptTime,
            counselorId: aptCounselorId,
            counselorName,
            purpose: aptPurpose
        };

        saveAppointments([...appointments, newApt]);
        toast.success('Appointment slot scheduled');
        setAptName('');
        setAptPhone('');
        setAptDate('');
        setAptTime('');
    };

    // Log call
    const handleAddCall = (e: React.FormEvent) => {
        e.preventDefault();
        if (!callName || !callPhone) {
            toast.error('Caller Name and Contact phone number are required.');
            return;
        }

        const newCall: LocalCallLog = {
            id: crypto.randomUUID(),
            callerName: callName.trim(),
            phone: callPhone.trim(),
            type: callType,
            purpose: callPurpose,
            remarks: callRemarks.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        saveCalls([...calls, newCall]);
        toast.success('Call log entry saved');
        setCallName('');
        setCallPhone('');
        setCallRemarks('');
    };

    // Notes Checklist helpers
    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        saveNotes([...notes, newNote.trim()]);
        setNewNote('');
    };

    const handleDeleteNote = (idx: number) => {
        const filtered = notes.filter((_, i) => i !== idx);
        saveNotes(filtered);
    };

    // Filtering enquiries
    const filteredEnquiries = useMemo(() => {
        return allRecords.filter(item => {
            const matchesGrade = !gradeFilter || item.grade_applied_for === gradeFilter;
            const itemSearchStr = `${item.student_name} ${item.parent_name} ${item.phone} ${item.inquiry_number}`.toLowerCase();
            const matchesSearch = !searchEnquiryQuery || itemSearchStr.includes(searchEnquiryQuery.toLowerCase());
            return matchesGrade && matchesSearch;
        });
    }, [allRecords, gradeFilter, searchEnquiryQuery]);

    return (
        <div className="space-y-6 pb-8 text-gray-700 dark:text-gray-200">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" /> Front Desk Operations Console
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Enterprise Receptionist Management Portal · School Admissions & Visitor Log
                    </p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
                    </button>
                    <button
                        onClick={() => setShowVisModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Register Visitor
                    </button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <LeadMetricsPanel metrics={metrics} variant="reception" />

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-border/65 overflow-x-auto">
                {(['admissions', 'visitors', 'lookup', 'appointments', 'calls'] as const).map(tab => {
                    const icons = {
                        admissions: FilePlus,
                        visitors: Users,
                        lookup: Search,
                        appointments: Calendar,
                        calls: PhoneCall
                    };
                    const labels = {
                        admissions: 'Admissions Desk',
                        visitors: 'Visitor Registry',
                        lookup: 'Student Lookup',
                        appointments: 'Appointments',
                        calls: 'Phone Log & Notes'
                    };
                    const Icon = icons[tab];
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                                activeTab === tab
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {labels[tab]}
                            {tab === 'visitors' && visitorsList.filter(v => !v.timeOut).length > 0 && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-black animate-pulse">
                                    {visitorsList.filter(v => !v.timeOut).length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="transition-all duration-200">
                {/* 1. Admissions Desk Tab */}
                {activeTab === 'admissions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Registration Form */}
                        <div className="lg:col-span-1 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4 text-indigo-500" /> Log Walk-in Inquiry
                            </h3>

                            {duplicates.length > 0 && (
                                <LeadDuplicateAlert matches={duplicates} />
                            )}

                            {isSuccess ? (
                                <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-900 text-xs font-bold">
                                    <CheckCircle className="w-4 h-4" /> Inquiry registered successfully!
                                </div>
                            ) : (
                                <form onSubmit={handleRegisterInquiry} className="space-y-4 text-xs font-medium">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Student Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={studentName}
                                            onChange={e => setStudentName(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Parent/Guardian Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={parentName}
                                            onChange={e => setParentName(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Email ID</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Applying Grade</label>
                                            <select
                                                value={grade}
                                                onChange={e => setGrade(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                            >
                                                {grades.map(g => (
                                                    <option key={g.id} value={g.name}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Date of Birth *</label>
                                            <input
                                                type="date"
                                                required
                                                value={dob}
                                                onChange={e => setDob(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Gender</label>
                                            <select
                                                value={gender}
                                                onChange={e => setGender(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Assign Counselor</label>
                                            <select
                                                value={visCounselorId}
                                                onChange={e => setVisCounselorId(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                            >
                                                {counselors.map(c => (
                                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={createEnquiry.isPending}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {createEnquiry.isPending ? 'Logging Inquiry...' : 'Log Walk-in Lead'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Recent Enquiries Register */}
                        <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                                    Admissions Inquiry Feed
                                </h3>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search Inquiries..."
                                            value={searchEnquiryQuery}
                                            onChange={e => setSearchEnquiryQuery(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 border border-gray-200 dark:border-border/50 bg-gray-50 dark:bg-muted text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent dark:text-gray-100"
                                        />
                                    </div>
                                    <select
                                        value={gradeFilter}
                                        onChange={e => setGradeFilter(e.target.value)}
                                        className="p-1.5 border border-gray-200 dark:border-border/50 bg-gray-50 dark:bg-muted text-xs rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                    >
                                        <option value="">All Grades</option>
                                        {grades.map(g => (
                                            <option key={g.id} value={g.name}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-border/40">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-muted text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-150 dark:border-border/50">
                                            <th className="p-3">Inquiry ID</th>
                                            <th className="p-3">Student / Parent</th>
                                            <th className="p-3">Grade</th>
                                            <th className="p-3">Contact</th>
                                            <th className="p-3">Source</th>
                                            <th className="p-3">Counselor</th>
                                            <th className="p-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-border/10">
                                        {filteredEnquiries.map((enq) => (
                                            <tr key={enq.id} className="hover:bg-gray-50/50 dark:hover:bg-muted/10 transition text-gray-700 dark:text-gray-300">
                                                <td className="p-3 font-mono font-bold text-indigo-600">{enq.inquiry_number || enq.id.slice(0, 8)}</td>
                                                <td className="p-3">
                                                    <div className="font-bold text-gray-900 dark:text-gray-100">{enq.student_name}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">Parent: {enq.parent_name || '—'}</div>
                                                </td>
                                                <td className="p-3 font-semibold">{enq.grade_applied_for || 'General'}</td>
                                                <td className="p-3 font-medium">
                                                    <div>{enq.phone || '—'}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">{enq.email || '—'}</div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300">
                                                        {enq.source || 'Walk-in'}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-medium text-gray-500 dark:text-gray-400">
                                                    {enq.assigned_counselor || 'Unassigned'}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                                                        enq.application_id
                                                            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-300'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300'
                                                    }`}>
                                                        {enq.application_id ? 'Converted' : enq.status || 'New'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEnquiries.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                                                    No inquiries recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Visitor Registry Tab */}
                {activeTab === 'visitors' && (
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                                    Checked-in Guests & Visitors Log
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Logs all campus walk-ins, tours, parent meetings, and front-desk visits.</p>
                            </div>
                            <button
                                onClick={() => setShowVisModal(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Check-in New Guest
                            </button>
                        </div>

                        {isVisitorsLoading ? (
                            <div className="py-12 flex justify-center">
                                <Clock className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-border/40">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-muted text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-150 dark:border-border/50">
                                            <th className="p-3">Visitor Name</th>
                                            <th className="p-3">Contact</th>
                                            <th className="p-3">Purpose</th>
                                            <th className="p-3">Visit Type</th>
                                            <th className="p-3">Time In</th>
                                            <th className="p-3">Time Out</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-border/10">
                                        {visitorsList.map((visitor) => (
                                            <tr key={visitor.id} className="hover:bg-gray-50/50 dark:hover:bg-muted/10 transition text-gray-700 dark:text-gray-300">
                                                <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{visitor.visitorName}</td>
                                                <td className="p-3 font-semibold">{visitor.phone}</td>
                                                <td className="p-3 max-w-[200px] truncate">{visitor.purpose}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-lg border border-gray-200 dark:border-border/30 bg-gray-100 dark:bg-muted text-gray-600 dark:text-gray-300">
                                                        {visitor.visitType || 'Walk-in'}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-semibold text-gray-500">
                                                    {new Date(visitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-3 font-semibold text-gray-400">
                                                    {visitor.timeOut ? (
                                                        new Date(visitor.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    ) : (
                                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/20 dark:text-emerald-300">Checked In</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            setPassVisitor(visitor);
                                                            setShowPassModal(true);
                                                        }}
                                                        className="px-2.5 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 font-bold transition flex-inline items-center gap-1 text-[10px]"
                                                    >
                                                        <Printer className="w-3 h-3 inline" /> Pass
                                                    </button>
                                                    {!visitor.timeOut && (
                                                        <button
                                                            onClick={() => {
                                                                setCheckoutVisitorId(visitor.id);
                                                                setShowCheckoutModal(true);
                                                            }}
                                                            className="px-2.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-bold transition flex-inline items-center gap-1 text-[10px] shadow-sm"
                                                        >
                                                            <LogOut className="w-3 h-3 inline" /> Check-out
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {visitorsList.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                                                    No visitor registers loaded.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Student/Parent Lookup Tab */}
                {activeTab === 'lookup' && (
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                                Student & Parent Database Lookup
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">Quick search for current school students, admission numbers, enrollment status, and parent numbers.</p>
                        </div>

                        <form onSubmit={handleStudentLookup} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter Student Name, Roll No, or Parent Contact..."
                                    value={lookupQuery}
                                    onChange={e => setLookupQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-border/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-muted dark:text-gray-100"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLookupLoading}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-sm disabled:opacity-50"
                            >
                                {isLookupLoading ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        {lookupResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 overflow-x-auto rounded-xl border border-gray-150 dark:border-border/40">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-muted text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-150 dark:border-border/50">
                                                <th className="p-3">Reg ID</th>
                                                <th className="p-3">Student Name</th>
                                                <th className="p-3">Grade / Section</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">View Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-border/10">
                                            {lookupResults.map((std) => (
                                                <tr key={std.id} className="hover:bg-gray-50/50 dark:hover:bg-muted/10 transition text-gray-700 dark:text-gray-300">
                                                    <td className="p-3 font-mono font-bold text-gray-900 dark:text-gray-100">{std.admission_no || std.id.slice(0, 8)}</td>
                                                    <td className="p-3 font-semibold">{std.first_name} {std.last_name}</td>
                                                    <td className="p-3">{std.grade || 'Grade Primary'} · {std.section || 'Sec A'}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 text-[9px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => setSelectedStudent(std)}
                                                            className="text-indigo-600 hover:underline font-bold"
                                                        >
                                                            Inspect Contacts
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-gray-50 dark:bg-muted p-5 rounded-2xl border border-gray-200 dark:border-border/40">
                                    <h4 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-border/30 pb-2 flex items-center gap-1.5">
                                        <ShieldAlert className="w-4 h-4 text-rose-500" /> Parent / Guardian Profile
                                    </h4>
                                    {selectedStudent ? (
                                        <div className="space-y-4 mt-3 text-xs">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Father Details</p>
                                                <p className="font-bold mt-0.5 text-gray-900 dark:text-gray-100">{selectedStudent.father_name || 'Arun Soni'}</p>
                                                <p className="font-semibold text-indigo-600 mt-0.5">{selectedStudent.father_phone || '+91 98765 43210'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Mother Details</p>
                                                <p className="font-bold mt-0.5 text-gray-900 dark:text-gray-100">{selectedStudent.mother_name || 'Meena Soni'}</p>
                                                <p className="font-semibold text-indigo-600 mt-0.5">{selectedStudent.mother_phone || '+91 98765 43211'}</p>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-card border border-gray-150 rounded-xl">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Current Residential Address</p>
                                                <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                                                    {selectedStudent.address || 'H No 12-42, Banjara Hills, Road No 3, Hyderabad, TS'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 mt-8 text-center italic">Select a student row to inspect parent emergency numbers.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Appointments Tab */}
                {activeTab === 'appointments' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Book Appointment Slot */}
                        <div className="lg:col-span-1 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-indigo-500" /> Book Counselor Slot
                            </h3>
                            <form onSubmit={handleAddAppointment} className="space-y-4 text-xs font-medium">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Visitor Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={aptName}
                                        onChange={e => setAptName(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={aptPhone}
                                        onChange={e => setAptPhone(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Visit Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={aptDate}
                                            onChange={e => setAptDate(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Time Slot *</label>
                                        <input
                                            type="time"
                                            required
                                            value={aptTime}
                                            onChange={e => setAptTime(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Admissions Counselor</label>
                                    <select
                                        value={aptCounselorId}
                                        onChange={e => setAptCounselorId(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                    >
                                        {counselors.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Purpose of Visit</label>
                                    <select
                                        value={aptPurpose}
                                        onChange={e => setAptPurpose(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                    >
                                        <option value="Admission counseling">Admission counseling</option>
                                        <option value="Campus Tour">Campus Tour</option>
                                        <option value="Principal Meeting">Principal Meeting</option>
                                        <option value="Document submission">Document submission</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition shadow-sm"
                                >
                                    Schedule Visit Slot
                                </button>
                            </form>
                        </div>

                        {/* Appointments Feed */}
                        <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                                Today's Scheduled Admissions Appointments
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-border/40">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-muted text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-150 dark:border-border/50">
                                            <th className="p-3">Visitor Name</th>
                                            <th className="p-3">Contact</th>
                                            <th className="p-3">Counselor</th>
                                            <th className="p-3">Visit Date & Slot</th>
                                            <th className="p-3">Purpose</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-border/10">
                                        {appointments.map((apt) => (
                                            <tr key={apt.id} className="hover:bg-gray-50/50 dark:hover:bg-muted/10 transition text-gray-700 dark:text-gray-300">
                                                <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{apt.visitorName}</td>
                                                <td className="p-3 font-medium">{apt.phone}</td>
                                                <td className="p-3 font-semibold text-gray-500">{apt.counselorName}</td>
                                                <td className="p-3 font-bold">
                                                    <span>{apt.date}</span> · <span className="text-indigo-600">{apt.time}</span>
                                                </td>
                                                <td className="p-3 font-medium text-gray-400">{apt.purpose}</td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            const filtered = appointments.filter(a => a.id !== apt.id);
                                                            saveAppointments(filtered);
                                                            toast.success('Appointment cancelled');
                                                        }}
                                                        className="text-rose-600 font-bold hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {appointments.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                                                    No appointments scheduled.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Phone Log & Notes Tab */}
                {activeTab === 'calls' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Call logger */}
                        <div className="lg:col-span-1 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <PhoneCall className="w-4 h-4 text-indigo-500" /> Log Front Desk Phone Call
                            </h3>
                            <form onSubmit={handleAddCall} className="space-y-4 text-xs font-medium">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Caller / Parent Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={callName}
                                        onChange={e => setCallName(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={callPhone}
                                        onChange={e => setCallPhone(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Call Type</label>
                                        <select
                                            value={callType}
                                            onChange={e => setCallType(e.target.value as any)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                        >
                                            <option value="Inbound">Incoming</option>
                                            <option value="Outbound">Outgoing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase">Enquiry Topic</label>
                                        <select
                                            value={callPurpose}
                                            onChange={e => setCallPurpose(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                        >
                                            <option value="Admission enquiry">Admission query</option>
                                            <option value="Fee clarification">Fee query</option>
                                            <option value="Transport concern">Transport query</option>
                                            <option value="Hostel queries">Hostel query</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Call Summary</label>
                                    <textarea
                                        rows={2}
                                        value={callRemarks}
                                        onChange={e => setCallRemarks(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition shadow-sm"
                                >
                                    Log Call Details
                                </button>
                            </form>
                        </div>

                        {/* Recent call log list & notes checklist */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Call feed */}
                            <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                                    Phone Conversation Registry
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-border/40">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-muted text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-150 dark:border-border/50">
                                                <th className="p-3">Time</th>
                                                <th className="p-3">Caller Name</th>
                                                <th className="p-3">Phone</th>
                                                <th className="p-3">Direction</th>
                                                <th className="p-3">Topic</th>
                                                <th className="p-3 text-right">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-border/10">
                                            {calls.map((call) => (
                                                <tr key={call.id} className="hover:bg-gray-50/50 dark:hover:bg-muted/10 transition text-gray-700 dark:text-gray-300">
                                                    <td className="p-3 text-gray-400 font-medium">{call.timestamp}</td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-gray-900 dark:text-gray-100">{call.callerName}</div>
                                                        {call.remarks && <p className="text-[10px] text-gray-400 mt-0.5">{call.remarks}</p>}
                                                    </td>
                                                    <td className="p-3 font-semibold">{call.phone}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                            call.type === 'Inbound'
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-150 dark:bg-blue-950/20 dark:text-blue-300'
                                                                : 'bg-indigo-50 text-indigo-700 border border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-300'
                                                        }`}>
                                                            {call.type === 'Inbound' ? 'Incoming' : 'Outgoing'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-500 font-medium">{call.purpose}</td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                const filtered = calls.filter(c => c.id !== call.id);
                                                                saveCalls(filtered);
                                                            }}
                                                            className="text-rose-600 hover:text-rose-700 font-bold"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {calls.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                                                        No conversations logged today.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notepad / Tasks checklist */}
                            <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-indigo-500" /> Desk Tasks & Reminders
                                </h3>

                                <form onSubmit={handleAddNote} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add quick task (e.g. Call counselor Nancy, hand over student file...)"
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-border/50 bg-gray-50 dark:bg-muted text-xs rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                                    >
                                        Add
                                    </button>
                                </form>

                                <div className="space-y-2">
                                    {notes.map((note, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-xl text-xs border border-gray-200/50">
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{note}</p>
                                            <button
                                                onClick={() => handleDeleteNote(idx)}
                                                className="text-gray-400 hover:text-rose-600 font-bold"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ))}
                                    {notes.length === 0 && (
                                        <p className="text-gray-400 text-center italic text-xs py-4">No tasks in backlog.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Check-in Modal */}
            {showVisModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-card border dark:border-border/70 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-border/30 pb-3">
                            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">Campus Guest Check-in</h3>
                            <button onClick={() => setShowVisModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRegisterVisitor} className="space-y-4 text-xs font-medium">
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Visitor Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={visName}
                                    onChange={e => setVisName(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Contact Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={visPhone}
                                    onChange={e => setVisPhone(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Purpose of Visit *</label>
                                    <input
                                        type="text"
                                        required
                                        value={visPurpose}
                                        onChange={e => setVisPurpose(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Visit Type</label>
                                    <select
                                        value={visType}
                                        onChange={e => setVisType(e.target.value as any)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                    >
                                        <option value="Walk-in">Walk-in</option>
                                        <option value="Campus Tour">Campus Tour</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Admission Inquiry">Admission Inquiry</option>
                                        <option value="Parent Meeting">Parent Meeting</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Assign Counselor / Host</label>
                                <select
                                    value={visCounselorId}
                                    onChange={e => setVisCounselorId(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                >
                                    <option value="">No counselor allocation</option>
                                    {counselors.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Remarks</label>
                                <textarea
                                    rows={2}
                                    value={visRemarks}
                                    onChange={e => setVisRemarks(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowVisModal(false)}
                                    className="px-4 py-2 border border-gray-200 dark:border-border/50 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                                >
                                    Register Check-in
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Check-out Outcome Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-card border dark:border-border/70 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-border/30 pb-3">
                            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">Visitor Check-out Details</h3>
                            <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCheckoutVisitor} className="space-y-4 text-xs font-medium">
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Outcome Status *</label>
                                <select
                                    value={checkoutOutcome}
                                    onChange={e => setCheckoutOutcome(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none cursor-pointer dark:text-gray-100"
                                >
                                    <option value="Completed">Toured/Inquiry Done</option>
                                    <option value="Follow-up Needed">Follow-up Call Scheduled</option>
                                    <option value="Registered">Registered / Application Drafted</option>
                                    <option value="Meeting Concluded">General Meeting Concluded</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase">Desk remarks (Checkout notes)</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={checkoutRemarks}
                                    onChange={e => setCheckoutRemarks(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border/50 rounded-xl focus:outline-none dark:text-gray-100"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="px-4 py-2 border border-gray-200 dark:border-border/50 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
                                >
                                    Conclude Visit & Check-out
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Visitor Pass ID Card Modal */}
            {showPassModal && passVisitor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-card border dark:border-border/70 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-border/30 pb-3">
                            <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">Front-desk Visitor Pass</h3>
                            <button onClick={() => setShowPassModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Printable Pass Area */}
                        <div id="visitor-pass-print" className="p-4 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/20 text-center space-y-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-indigo-700 uppercase tracking-wider">GREENWOOD HIGH SCHOOL</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Visitor Gate Entry Badge</p>
                            </div>

                            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto text-indigo-600 text-2xl font-black uppercase">
                                {passVisitor.visitorName.slice(0, 2)}
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-sm font-black text-gray-900 dark:text-gray-100">{passVisitor.visitorName}</p>
                                <p className="text-xs font-bold text-gray-500">{passVisitor.phone}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-left pt-2 border-t border-gray-200/50">
                                <div>
                                    <span className="text-gray-400 font-bold uppercase">Time In</span>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                        {new Date(passVisitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-bold uppercase">Date</span>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                        {new Date(passVisitor.timeIn).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-bold uppercase">Purpose</span>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{passVisitor.purpose}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-bold uppercase">Host / Counselor</span>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                                        {counselors.find(c => c.id === passVisitor.counselorId)?.full_name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-[8px] font-mono text-gray-400">Pass ID: {passVisitor.id.slice(0, 18)}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    // Simulated Print Action
                                    const printContent = document.getElementById('visitor-pass-print')?.outerHTML;
                                    const win = window.open('', '', 'width=600,height=600');
                                    if (win) {
                                        win.document.write(`
                                            <html>
                                                <head>
                                                    <title>Visitor Pass - ${passVisitor.visitorName}</title>
                                                    <style>
                                                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                                                        #visitor-pass-print { border: 2px dashed #6366f1; padding: 24px; border-radius: 16px; text-align: center; width: 280px; }
                                                        h4 { color: #4338ca; margin: 0; font-size: 16px; text-transform: uppercase; }
                                                        p { margin: 4px 0; }
                                                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left; margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
                                                        .label { font-size: 9px; color: #9ca3af; text-transform: uppercase; font-weight: bold; }
                                                        .value { font-size: 11px; font-weight: bold; color: #374151; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div id="visitor-pass-print">
                                                        <h4>GREENWOOD HIGH SCHOOL</h4>
                                                        <p style="font-size: 9px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Visitor Gate Entry Badge</p>
                                                        <p style="font-size: 16px; font-weight: bold; margin-top: 16px; color: #111827;">${passVisitor.visitorName}</p>
                                                        <p style="font-size: 12px; color: #4b5563;">${passVisitor.phone}</p>
                                                        <div class="grid">
                                                            <div>
                                                                <div class="label">Time In</div>
                                                                <div class="value">${new Date(passVisitor.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                            <div>
                                                                <div class="label">Date</div>
                                                                <div class="value">${new Date(passVisitor.timeIn).toLocaleDateString()}</div>
                                                            </div>
                                                            <div>
                                                                <div class="label">Purpose</div>
                                                                <div class="value">${passVisitor.purpose}</div>
                                                            </div>
                                                            <div>
                                                                <div class="label">Host</div>
                                                                <div class="value">${counselors.find(c => c.id === passVisitor.counselorId)?.full_name || 'Unassigned'}</div>
                                                            </div>
                                                        </div>
                                                        <p style="font-size: 7px; color: #9ca3af; margin-top: 20px; font-family: monospace;">Pass ID: ${passVisitor.id}</p>
                                                    </div>
                                                    <script>
                                                        window.onload = function() { window.print(); window.close(); }
                                                    </script>
                                                </body>
                                            </html>
                                        `);
                                        win.document.close();
                                    }
                                }}
                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Gate Badge
                            </button>
                            <button
                                onClick={() => setShowPassModal(false)}
                                className="px-4 py-2 border border-gray-250 dark:border-border/60 rounded-xl hover:bg-gray-50 text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistDashboard;

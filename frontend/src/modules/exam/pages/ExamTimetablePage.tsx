import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../../lib/api-client';
import { Calendar, Plus, Trash2, Save, X, Info, AlertTriangle, BookOpen, Check, Loader2, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ExamProgressGuide } from '../components/ExamProgressGuide';
import { ExamTimetableMatrix } from '../components/ExamTimetableMatrix';

// =========================================================================================
// ARCHITECTURE GUARD: CLASS-SCOPED SCHEDULING
// =========================================================================================
// 1. Scheduling MUST always occur within a specific Class Context.
// 2. Conflicting logical checks are enforced by the Backend (HTTP 409).
// 3. Do NOT bypass the Class Selection step. Global scheduling is explicitly forbidden.
// =========================================================================================

export const ExamTimetablePage = () => {
    // --- State ---
    const [exams, setExams] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    // Selections
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Data
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const [stagingData, setStagingData] = useState<Record<string, any>>({});
    const [savingSubjectId, setSavingSubjectId] = useState<string | null>(null);

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
    const navigate = useNavigate();

    // --- Effects ---
    useEffect(() => {
        loadInitData();
    }, []);

    useEffect(() => {
        if (selectedExamId) {
            loadSchedules(selectedExamId);
        } else {
            setSchedules([]);
        }
    }, [selectedExamId]);

    // Fetch subjects when Class changes
    useEffect(() => {
        if (selectedClassId) {
            loadSubjects(selectedClassId);
            setIsCreating(false); // Reset creation mode to prevent stale subject data
        } else {
            setSubjects([]);
        }
    }, [selectedClassId]);

    // Sync Staging Data when Schedules or Subjects change
    useEffect(() => {
        if (!selectedClassId) return;

        const newStaging: Record<string, any> = {};
        subjects.forEach(sub => {
            const existing = schedules.find(s => s.subject?.id === sub.id || s.subject_id === sub.id);
            if (existing) {
                newStaging[sub.id] = {
                    ...existing,
                    exam_date: existing.exam_date ? new Date(existing.exam_date).toISOString().split('T')[0] : '',
                    // Ensure HH:MM format
                    start_time: existing.start_time?.slice(0, 5) || '',
                    end_time: existing.end_time?.slice(0, 5) || ''
                };
            } else {
                newStaging[sub.id] = {
                    exam_date: '',
                    start_time: '',
                    end_time: '',
                    max_marks: 100,
                    passing_marks: 35
                };
            }
        });
        setStagingData(newStaging);
    }, [schedules, subjects, selectedClassId]);

    // --- Loading Functions ---
    const loadInitData = async () => {
        try {
            const [exRes, clRes] = await Promise.all([
                apiClient.get('/exams'),
                apiClient.get('/academic/classes')
            ]);
            setExams(exRes.data);
            setClasses(clRes.data);
        } catch (e) {
            console.error("Init Error", e);
        }
    };

    const loadSubjects = async (classId: string) => {
        try {
            const res = await apiClient.get('/exams/subjects', { params: { classId } });
            setSubjects(res.data);
        } catch (e) {
            console.error("Subject Load Error", e);
        }
    };

    const loadSchedules = async (examId: string) => {
        setLoading(true);
        try {
            const res = await apiClient.get('/exams/exam-schedules', { params: { examId } });
            setSchedules(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Validations & Submission ---
    const onSubmit = async (data: any) => {
        // ARCHITECTURE SAFETY CHECK
        if (!selectedClassId) {
            console.error("CRITICAL: Attempted to schedule without Class Context.");
            return alert("Internal Error: Class context is missing. Please refresh.");
        }

        // UI Validations
        if (Number(data.passing_marks) >= Number(data.max_marks)) {
            return alert("Error: Passing marks must be strictly less than maximum marks.");
        }

        if (data.start_time >= data.end_time) {
            return alert("Error: End time must be after start time.");
        }

        // Prevent Duplicates
        const isDuplicate = schedules.some(s =>
            s.subject?.id === data.subject_id &&
            s.subject?.class_id === selectedClassId
            // Note: Safe duplicate check usually also checks exam_id (implicit here)
        );

        if (isDuplicate) {
            return alert("Error: This subject is already scheduled for this exam.");
        }

        try {
            await apiClient.post('/exams/exam-schedules', {
                ...data,
                exam_id: selectedExamId
            });
            setIsCreating(false);
            reset();
            loadSchedules(selectedExamId);
            alert("Schedule saved successfully!");
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError('root', {
                    type: 'server',
                    message: err.response.data.error || "Schedule conflict detected."
                });
            } else {
                alert(err.response?.data?.error || "Failed to add schedule");
            }
        }
    };

    // Derived state for filtering displayed schedules by class if possible
    // We try to match subject.class_id if available, or just show all if not.
    const filteredSchedules = selectedClassId
        ? schedules.filter(s => s.subject?.class_id === selectedClassId || s.subject?.class?.id === selectedClassId)
        : schedules;

    // Use filteredSchedules only if we have confidence data structure supports it.
    // If Subject relation includes class, it works. Based on previous audit, subject has class_id.
    // To be safe, if filteredSchedules is empty but schedules is not, and we are unsure, we might show all?
    // User requested "Scheduling ALWAYS happens in a Class context". Filtering is safer UX.
    const displaySchedules = selectedClassId ? filteredSchedules : schedules;

    // Phase-B: Validate Exam Applicability
    const selectedExam = exams.find(e => e.id === selectedExamId);
    const isClassApplicable = !selectedExamId || !selectedClassId || !selectedExam?.applicable_classes ||
        selectedExam.applicable_classes.length === 0 ||
        selectedExam.applicable_classes.includes(selectedClassId);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <ExamProgressGuide currentStep="schedule" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Exam Timetables
                    </h1>
                    <p className="text-gray-500 font-medium">Define dates and times for each subject.</p>
                </div>
            </div>

            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-end shadow-sm">
                <div className="w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">1. Select Exam Window</label>
                    <select
                        className="w-full p-4 border rounded-xl bg-gray-50 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedExamId}
                        onChange={e => setSelectedExamId(e.target.value)}
                    >
                        <option value="">-- Choose Exam --</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div className="w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">2. Select Class Context</label>
                    <select
                        className="w-full p-4 border rounded-xl bg-gray-50 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        disabled={!selectedExamId}
                    >
                        <option value="">-- Choose Class --</option>
                        {(() => {
                            const selectedExam = exams.find(e => e.id === selectedExamId);
                            const applicableClassIds = selectedExam?.applicable_classes;

                            // If no exam selected, or exam has no specific classes (implies ALL), show all.
                            // Otherwise, filter.
                            const availableClasses = (!applicableClassIds || applicableClassIds.length === 0)
                                ? classes
                                : classes.filter(c => applicableClassIds.includes(c.id));

                            return availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>);
                        })()}
                    </select>
                </div>
            </div>

            {selectedExamId ? (
                <div className="space-y-8">

                    {/* 1. MATRIX VIEW (ALWAYS VISIBLE FOR EXAM) */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ExamTimetableMatrix
                            exam={selectedExam}
                            classes={classes}
                            schedules={schedules}
                        />
                    </div>

                    {/* 2. CLASS SPECIFIC ACTIONS (ADD / LIST) */}
                    {selectedClassId ? (
                        <div className="border-t border-gray-200 pt-8 animate-in fade-in duration-500">
                            {/* Class Header & Add Button */}
                            {!isClassApplicable ? (
                                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex items-center justify-center text-center">
                                    <div className="max-w-md">
                                        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-amber-800 mb-1">Class Not Applicable</h3>
                                        <p className="text-amber-700">
                                            The exam <strong>{selectedExam?.name}</strong> is not scheduled for the selected class context.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                {classes.find(c => c.id === selectedClassId)?.name?.substring(0, 2) || 'CL'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Managing Context</p>
                                                <p className="font-bold text-gray-900">{classes.find(c => c.id === selectedClassId)?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                            {subjects.length} Subjects Found
                                        </div>
                                    </div>

                                    {/* Inline Class Timetable Editor */}
                                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm min-w-[1000px]">
                                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs tracking-wider">
                                                    <tr>
                                                        <th className="p-4 pl-6 w-1/4">Subject</th>
                                                        <th className="p-4 w-40">Date</th>
                                                        <th className="p-4 w-32">Start Time</th>
                                                        <th className="p-4 w-32">End Time</th>
                                                        <th className="p-4 w-24">Max</th>
                                                        <th className="p-4 w-24">Pass</th>
                                                        <th className="p-4 text-center w-32">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {subjects.length > 0 ? (
                                                        subjects.map(sub => {
                                                            const data = stagingData[sub.id] || {};
                                                            const existingSchedule = schedules.find(s => s.subject?.id === sub.id || s.subject_id === sub.id);
                                                            const isSaved = !!existingSchedule;
                                                            // Determine if modified (naive check)
                                                            // For now, simpler: user clicks save to upsert

                                                            return (
                                                                <tr key={sub.id} className={`hover:bg-gray-50/50 transition-colors ${isSaved ? 'bg-white' : 'bg-gray-50/20'}`}>
                                                                    <td className="p-4 pl-6">
                                                                        <div className="font-bold text-gray-900 text-base">{sub.name}</div>
                                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{sub.code}</div>
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="date"
                                                                                value={data.exam_date || ''}
                                                                                onChange={e => setStagingData(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], exam_date: e.target.value } }))}
                                                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <input
                                                                            type="time"
                                                                            value={data.start_time || ''}
                                                                            onChange={e => setStagingData(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], start_time: e.target.value } }))}
                                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <input
                                                                            type="time"
                                                                            value={data.end_time || ''}
                                                                            onChange={e => setStagingData(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], end_time: e.target.value } }))}
                                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <input
                                                                            type="number"
                                                                            value={data.max_marks || ''}
                                                                            onChange={e => setStagingData(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], max_marks: e.target.value } }))}
                                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                                            placeholder="100"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <input
                                                                            type="number"
                                                                            value={data.passing_marks || ''}
                                                                            onChange={e => setStagingData(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], passing_marks: e.target.value } }))}
                                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                                            placeholder="35"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4 text-center">
                                                                        <button
                                                                            onClick={async () => {
                                                                                setSavingSubjectId(sub.id);
                                                                                try {
                                                                                    // Validation
                                                                                    if (!data.exam_date || !data.start_time || !data.end_time) {
                                                                                        alert("Please fill in Date, Start Time and End Time.");
                                                                                        return;
                                                                                    }
                                                                                    if (data.start_time >= data.end_time) {
                                                                                        alert("End time must be after start time");
                                                                                        return;
                                                                                    }

                                                                                    // ---------------------------------------------------------
                                                                                    // UPDATE OR CREATE
                                                                                    // ---------------------------------------------------------
                                                                                    if (isSaved && existingSchedule?.id) {
                                                                                        // UPDATE (PUT)
                                                                                        await apiClient.put(`/exams/exam-schedules/${existingSchedule.id}`, {
                                                                                            exam_id: selectedExamId,
                                                                                            subject_id: sub.id,
                                                                                            exam_date: data.exam_date,
                                                                                            start_time: data.start_time,
                                                                                            end_time: data.end_time,
                                                                                            max_marks: data.max_marks,
                                                                                            passing_marks: data.passing_marks
                                                                                        });
                                                                                    } else {
                                                                                        // CREATE (POST)
                                                                                        await apiClient.post('/exams/exam-schedules', {
                                                                                            exam_id: selectedExamId,
                                                                                            subject_id: sub.id,
                                                                                            exam_date: data.exam_date,
                                                                                            start_time: data.start_time,
                                                                                            end_time: data.end_time,
                                                                                            max_marks: data.max_marks,
                                                                                            passing_marks: data.passing_marks
                                                                                        });
                                                                                    }
                                                                                    // ---------------------------------------------------------

                                                                                    // Success
                                                                                    await loadSchedules(selectedExamId); // Refresh

                                                                                } catch (err: any) {
                                                                                    if (err.response?.status === 409) {
                                                                                        alert("Schedule Conflict: " + (err.response.data.error || "Please check times."));
                                                                                    } else {
                                                                                        alert("Failed to save: " + (err.response?.data?.error || err.message));
                                                                                    }
                                                                                } finally {
                                                                                    setSavingSubjectId(null);
                                                                                }
                                                                            }}
                                                                            disabled={savingSubjectId === sub.id}
                                                                            className={`
                                                                                flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-sm w-full
                                                                                ${isSaved
                                                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                                                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                                                                }
                                                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                                            `}
                                                                        >
                                                                            {savingSubjectId === sub.id ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                            ) : isSaved ? (
                                                                                <>
                                                                                    <Check className="w-4 h-4" /> Updated
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Save className="w-4 h-4" /> Save
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        {/* Simple Delete if exists for quick fix */}
                                                                        {isSaved && (
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!confirm("Remove this schedule?")) return;
                                                                                    setSavingSubjectId(sub.id); // Block
                                                                                    try {
                                                                                        // Need DELETE endpoint. 
                                                                                        // Assuming we can't easily delete from here without route info?
                                                                                        // Wait, `schedules` has `id`.
                                                                                        // I need a DELETE schedule endpoint. 
                                                                                        // ExamScheduleService has deleteSchedule. Routes? Not exposed?
                                                                                        // I'll skip Delete in this "One Line" request to stay safe, user just wants entry.
                                                                                    } catch (e) { }
                                                                                    setSavingSubjectId(null);
                                                                                }}
                                                                                className="hidden text-red-400 hover:text-red-600 ml-2"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={7} className="p-12 text-center text-gray-400 font-bold">
                                                                No subjects found for this class. Please assign subjects first.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                            <h3 className="text-sm font-bold text-gray-900">Want to add or manage schedules?</h3>
                            <p className="text-xs text-gray-500 mt-1">Select a Class Context above to open the management form and detailed list.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Select Exam Window</h3>
                    <p className="font-bold text-gray-500 max-w-md mx-auto">Please select an Exam Window to view the consolidated timetable matrix.</p>
                </div>
            )}


            {/* Navigation Footer */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
                <Link to="/app/exam-admin/dashboard" className="text-gray-500 font-bold hover:text-gray-700 transition-colors text-sm flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Exam Dashboard
                </Link>

                <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {schedules.length} Schedules Ready
                    </div>
                    <button
                        onClick={async () => {
                            if (!selectedExamId) return;
                            if (schedules.length === 0) {
                                alert("Please add at least one schedule before publishing.");
                                return;
                            }
                            if (!confirm("Are you sure you want to PUBLISH this timetable? This will enable eligibility checks and lock the schedule structure.")) return;

                            setPublishing(true);
                            try {
                                await apiClient.put(`/exams/${selectedExamId}`, { status: 'PUBLISHED' });
                                alert("Timetable Published Successfully! You can now proceed to Eligibility checks.");
                                navigate('/app/exam-admin/eligibility');
                            } catch (e: any) {
                                alert("Failed to publish: " + (e.response?.data?.error || e.message));
                            } finally {
                                setPublishing(false);
                            }
                        }}
                        disabled={publishing || schedules.length === 0}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Publish Timetable
                    </button>
                </div>
            </div>
        </div>
    );
};

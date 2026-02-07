import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Calendar, Plus, Trash2, Save, X, Eye, Info, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ExamProgressGuide } from '../components/ExamProgressGuide';

export const ExamTimetablePage = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [schedules, setSchedules] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm();

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

    const loadInitData = async () => {
        try {
            const [exRes, subRes] = await Promise.all([
                apiClient.get('/exams'),
                apiClient.get('/academic/subjects')
            ]);
            setExams(exRes.data);
            setSubjects(subRes.data || []);
        } catch (e) {
            console.error("Init Error", e);
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

    const onSubmit = async (data: any) => {
        try {
            await apiClient.post('/exams/exam-schedules', {
                ...data,
                exam_id: selectedExamId
            });
            setIsCreating(false);
            reset();
            loadSchedules(selectedExamId);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to add schedule");
        }
    };

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
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-wrap gap-4 items-center shadow-sm">
                <select
                    className="p-3 border rounded-lg min-w-[250px] bg-gray-50 font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                >
                    <option value="">Select Exam to Schedule...</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>

                {selectedExamId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Subject Schedule
                    </button>
                )}
            </div>

            {/* Helper Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold">Scheduling Tip</p>
                    <p className="opacity-90">Ensure no two subjects overlap in timing for the same class. Seating generation depends on accurate schedules.</p>
                </div>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl ring-4 ring-indigo-50 animate-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                        <span>New Schedule Entry</span>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                            <select {...register('subject_id', { required: true })} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                            <input type="date" {...register('exam_date', { required: true })} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                                <input type="time" {...register('start_time', { required: true })} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                                <input type="time" {...register('end_time', { required: true })} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Marks</label>
                            <input type="number" {...register('max_marks')} defaultValue={100} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passing Marks</label>
                            <input type="number" {...register('passing_marks')} defaultValue={35} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-colors flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Schedule
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Timetable List */}
            {selectedExamId ? (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            Loading schedules...
                        </div>
                    ) : schedules.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-5 pl-6">Subject</th>
                                    <th className="p-5">Date & Time</th>
                                    <th className="p-5 text-center">Marks</th>
                                    <th className="p-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {schedules.map(sch => (
                                    <tr key={sch.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="p-5 pl-6">
                                            <div className="font-bold text-gray-900 text-base">{sch.subject?.name}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5">{sch.subject?.code}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 font-medium text-gray-700">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(sch.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 ml-6 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="font-mono font-bold text-gray-700 bg-gray-50 inline-block px-3 py-1 rounded">
                                                {sch.max_marks}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wide">
                                                Pass: {sch.passing_marks}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${sch.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                {sch.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">No Schedules Added Yet</h3>
                            <p className="max-w-xs mx-auto text-sm opacity-80 mb-6">Start by adding subjects, dates, and timings for this exam.</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-5 py-2 border border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                + Add First Schedule
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="font-bold text-gray-500">Select an exam from the dropdown above to manage its timetable.</p>
                </div>
            )}
        </div>
    );
};

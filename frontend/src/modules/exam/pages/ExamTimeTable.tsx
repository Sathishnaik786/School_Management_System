import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Calendar, Clock, BookOpen, Plus, Trash2, AlertCircle, Save } from 'lucide-react';

export const ExamTimeTable = () => {
    // --- State ---
    const [exams, setExams] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);

    // Selections
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Form inputs
    const [newSchedule, setNewSchedule] = useState({
        subject_id: '',
        exam_date: '',
        start_time: '',
        end_time: '',
        max_marks: 100,
        passing_marks: 35
    });

    const [loading, setLoading] = useState(false);

    // --- Effects ---

    // 1. Fetch initial data (Exams, Classes)
    useEffect(() => {
        apiClient.get('/exams').then(res => setExams(res.data));
        apiClient.get('/academic/classes').then(res => setClasses(res.data));
    }, []);

    // 2. Fetch Subjects when Class changes
    useEffect(() => {
        if (selectedClassId) {
            apiClient.get(`/exams/subjects?classId=${selectedClassId}`).then(res => setSubjects(res.data));
            // Reset subject selection
            setNewSchedule(prev => ({ ...prev, subject_id: '' }));
        } else {
            setSubjects([]);
        }
    }, [selectedClassId]);

    // 3. Fetch Schedules when Exam changes
    useEffect(() => {
        if (selectedExamId) {
            fetchSchedules();
        } else {
            setSchedules([]);
        }
    }, [selectedExamId]);

    const fetchSchedules = () => {
        apiClient.get(`/exams/exam-schedules?examId=${selectedExamId}`)
            .then(res => setSchedules(res.data))
            .catch(err => console.error(err));
    };

    // --- Handlers ---
    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExamId || !selectedClassId || !newSchedule.subject_id) {
            return alert("Please select Exam, Class and Subject");
        }

        setLoading(true);
        try {
            await apiClient.post('/exams/exam-schedules', {
                exam_id: selectedExamId,
                ...newSchedule
            });
            fetchSchedules();
            // Reset form partly
            setNewSchedule(prev => ({ ...prev, subject_id: '', exam_date: '', start_time: '', end_time: '' }));
            alert("Schedule Added Successfully");
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to add schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Timetable</h1>
                <p className="text-gray-500 mt-1">Schedule distinct dates and times for each subject within an exam window.</p>
            </header>

            {/* Selection Panel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Exam Window</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-700"
                        value={selectedExamId}
                        onChange={e => setSelectedExamId(e.target.value)}
                    >
                        <option value="">-- Choose Exam --</option>
                        {exams.map(exam => (
                            <option key={exam.id} value={exam.id}>{exam.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Class Context</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-700"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                    >
                        <option value="">-- Choose Class --</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2 ml-1">* Select class to load subjects</p>
                </div>
            </div>

            {selectedExamId && selectedClassId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                Add Schedule
                            </h3>
                            <form onSubmit={handleAddSchedule} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Subject</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                        value={newSchedule.subject_id}
                                        onChange={e => setNewSchedule({ ...newSchedule, subject_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Exam Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                        value={newSchedule.exam_date}
                                        onChange={e => setNewSchedule({ ...newSchedule, exam_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                            value={newSchedule.start_time}
                                            onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                            value={newSchedule.end_time}
                                            onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Max Marks</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                            value={newSchedule.max_marks}
                                            onChange={e => setNewSchedule({ ...newSchedule, max_marks: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Pass Marks</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                                            value={newSchedule.passing_marks}
                                            onChange={e => setNewSchedule({ ...newSchedule, passing_marks: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Add to Schedule'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Side */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Current Timetable</h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{schedules.length} Papers</span>
                        </div>

                        {schedules.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No schedules added yet for this exam.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Time</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Subject</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Marks</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {schedules.map((sch) => (
                                            <tr key={sch.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-bold text-gray-700 whitespace-nowrap">
                                                    {sch.exam_date}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                                                    {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-900">{sch.subject?.name}</div>
                                                    <div className="text-xs text-gray-400">{sch.subject?.code}</div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    <span className="font-bold text-gray-900">{sch.max_marks}</span>
                                                    <span className="text-xs ml-1">(Pass: {sch.passing_marks})</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        {sch.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
// @ts-ignore
import { useAuth } from '../../../context/AuthContext';
import { SubjectManagement } from './SubjectManagement';
import { MarksEntry } from './MarksEntry';
import { StudentResults } from './StudentResults';
import { Calendar, BookOpen, FileText, BarChart2 } from 'lucide-react';

export const ExamManagement = () => {
    const { hasRole } = useAuth();
    const isFaculty = hasRole('FACULTY');
    const [activeTab, setActiveTab] = useState<'terms' | 'subjects' | 'marks' | 'results'>('terms');

    useEffect(() => {
        if (isFaculty) {
            setActiveTab('marks');
        }
    }, [isFaculty]);

    // --- Tab 1: Exam Terms Logic ---
    const [exams, setExams] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [examType, setExamType] = useState('UNIT_TEST');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [activeYear, setActiveYear] = useState<any>(null);

    const fetchExams = () => {
        apiClient.get('/exams').then(res => setExams(res.data));
    };

    useEffect(() => {
        apiClient.get('/academic-years/current').then(res => setActiveYear(res.data));
        apiClient.get('/academic/classes').then(res => setClasses(res.data));
        fetchExams();
    }, []);

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeYear) return alert("No active year");

        try {
            await apiClient.post('/exams', {
                name,
                academic_year_id: activeYear.id,
                start_date: startDate,
                end_date: endDate,
                type: examType,
                applicable_classes: selectedClasses.length > 0 ? selectedClasses : null
            });
            setName('');
            setStartDate('');
            setEndDate('');
            setSelectedClasses([]);
            fetchExams();
            alert("Exam created successfully!");
        } catch (err: any) {
            console.error("Create Exam Error:", err);
            alert(`Failed to create exam: ${err.response?.data?.error || err.message}`);
        }
    };
    // -------------------------------

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Exam Management</h2>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'terms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Calendar className="w-4 h-4" /> Exam Schedule
                </button>

                {!isFaculty && (
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'subjects' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" /> Subjects
                    </button>
                )}

                <button
                    onClick={() => setActiveTab('marks')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'marks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FileText className="w-4 h-4" /> Marks Entry
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'results' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <BarChart2 className="w-4 h-4" /> Reports & Results
                </button>
            </div>

            {/* Content Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'terms' && (
                    <div className="space-y-6">
                        {!isFaculty && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4 text-gray-900">Create New Exam Term</h3>
                                <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Exam Name</label>
                                        <input
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-700 placeholder:font-normal"
                                            placeholder="e.g. Midterm  2026"
                                            value={name} onChange={e => setName(e.target.value)} required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-700"
                                            value={startDate} onChange={e => setStartDate(e.target.value)} required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-700"
                                            value={endDate} onChange={e => setEndDate(e.target.value)} required
                                        />
                                    </div>

                                    <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Exam Type</label>
                                            <select
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-700"
                                                value={examType}
                                                onChange={e => setExamType(e.target.value)}
                                            >
                                                <option value="UNIT_TEST">Unit Test</option>
                                                <option value="QUARTERLY">Quarterly</option>
                                                <option value="HALF_YEARLY">Half Yearly</option>
                                                <option value="ANNUAL">Annual</option>
                                                <option value="PRE_BOARD">Pre-Board</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                Applicable Classes <span className="text-gray-400 font-normal normal-case">(Default: All)</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded-xl bg-gray-50">
                                                {classes.map(cls => (
                                                    <label key={cls.id} className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-200 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                                            checked={selectedClasses.includes(cls.id)}
                                                            onChange={e => {
                                                                if (e.target.checked) setSelectedClasses([...selectedClasses, cls.id]);
                                                                else setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                                                            }}
                                                        />
                                                        <span className="text-xs font-bold text-gray-700">{cls.name}</span>
                                                    </label>
                                                ))}
                                                {classes.length === 0 && <span className="text-xs text-gray-400 p-1">Loading classes...</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-4 flex justify-end pt-4 border-t border-gray-50">
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                            Create Exam
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {exams.map(exam => (
                                <div key={exam.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{exam.name}</h4>
                                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-3">
                                            <span>{exam.start_date} — {exam.end_date}</span>
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                                                {exam.academic_year?.year_label}
                                            </span>
                                            {exam.type && (
                                                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                                                    {exam.type.replace('_', ' ')}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium mt-2">
                                            Classes: <span className="text-gray-600">
                                                {!exam.applicable_classes || exam.applicable_classes.length === 0
                                                    ? "All Classes"
                                                    : exam.applicable_classes.length + " Selected"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-emerald-600 font-bold text-sm">Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'subjects' && (
                    <SubjectManagement />
                )}

                {activeTab === 'marks' && (
                    <div>
                        <MarksEntry />
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-6">Student Results & Report Cards</h3>
                        <StudentResults />
                    </div>
                )}
            </div>
        </div>
    );
};

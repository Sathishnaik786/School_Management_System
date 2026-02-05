import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import {
    Award,
    Search,
    Save,
    ArrowLeft,
    AlertCircle,
    GraduationCap,
    BookOpen,
    UserCheck,
    History,
    FileEdit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const MarksEntry = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [mySections, setMySections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const [marksBuffer, setMarksBuffer] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const [examRes, secRes] = await Promise.all([
                    apiClient.get('/exams'),
                    apiClient.get('/academic/sections/my')
                ]);
                setExams(examRes.data);
                setMySections(secRes.data);
                if (secRes.data.length > 0) {
                    setSelectedSectionId(secRes.data[0].section.id);
                }
                if (examRes.data.length > 0) {
                    setSelectedExamId(examRes.data[0].id);
                }
            } catch (err: any) {
                console.error("Init Error:", err);
                if (err.response) {
                    console.error("Response:", err.response.data);
                    console.error("Status:", err.response.status);
                    alert(`Error loading data: ${err.response.data?.error || err.message} \nRequired: ${err.response.data?.required} \nHas: ${JSON.stringify(err.response.data?.has)}`);
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!selectedSectionId) return;

        const section = mySections.find((s: any) => s.section.id === selectedSectionId);
        if (section) {
            const classId = section.section.class?.id;
            if (!classId) {
                console.warn("Selected section has no class ID");
                return;
            }

            // Reset subjects to prevent invalid selection
            setSubjects([]);
            setSelectedSubjectId('');

            apiClient.get(`/exams/subjects?classId=${classId}`).then(res => {
                setSubjects(res.data);
                if (res.data.length > 0) setSelectedSubjectId(res.data[0].id);
            });

            // Fetch students for this section
            apiClient.get('/students', { params: { sectionId: selectedSectionId } }).then(res => {
                setStudents(res.data);

                // Fetch existing marks if everything is selected
                if (selectedExamId && selectedSubjectId) {
                    // Logic to fetch existing marks would go here in a production app
                }
            });
        }
    }, [selectedSectionId]);

    const handleSaveSingle = async (studentId: string) => {
        const marks = marksBuffer[studentId];
        if (marks === undefined) return;
        if (marks < 0 || marks > 100) {
            alert("Marks must be between 0 and 100");
            return;
        }

        if (!selectedExamId || !selectedSubjectId) {
            alert("Please ensure an Exam and Subject are selected.");
            return;
        }

        setSavingId(studentId);
        try {
            await apiClient.post('/exams/marks', {
                exam_id: selectedExamId,
                subject_id: selectedSubjectId,
                student_id: studentId,
                marks_obtained: marks
            });
            // Show temporary success state
            setTimeout(() => setSavingId(null), 1000);
        } catch (err) {
            alert("Failed to save marks");
            setSavingId(null);
        }
    };

    const sortedStudents = [...students].filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <Link to="/app/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Award className="w-10 h-10 text-indigo-600" />
                        Examination Marks Entry
                    </h1>
                    <p className="text-gray-500 font-medium">Record and update student performance for various assessments.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-2xl font-black transition-all shadow-sm border border-gray-100 hover:bg-gray-50">
                        <History className="w-4 h-4" />
                        Log History
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all">
                        <Save className="w-4 h-4" />
                        Batch Save
                    </button>
                </div>
            </div>

            {/* Selectors Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <GraduationCap className="w-3 h-3" /> Examination
                    </label>
                    <select
                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-bold text-gray-900 text-sm"
                        value={selectedExamId}
                        onChange={e => setSelectedExamId(e.target.value)}
                    >
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <FileEdit className="w-3 h-3" /> Division / Section
                    </label>
                    <select
                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-bold text-gray-900 text-sm"
                        value={selectedSectionId}
                        onChange={e => setSelectedSectionId(e.target.value)}
                    >
                        {mySections.map((s: any) => (
                            <option key={s.section.id} value={s.section.id}>
                                {s.section.class.name} - {s.section.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Subject Module
                    </label>
                    <select
                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all font-bold text-gray-900 text-sm"
                        value={selectedSubjectId}
                        onChange={e => setSelectedSubjectId(e.target.value)}
                    >
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Entry Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Find student by name..."
                            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm text-gray-900 placeholder:text-gray-300 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            <AlertCircle className="w-4 h-4" />
                            Valid Score Range: 0 - 100
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Identity</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Marks</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Outcome</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedStudents.map((stu) => (
                                <motion.tr
                                    layout
                                    key={stu.id}
                                    className="group hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-10 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[1rem] flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                {stu.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{stu.full_name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stu.student_code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-5">
                                        <div className="relative w-32">
                                            <input
                                                type="number"
                                                placeholder="0.0"
                                                className={`w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-4 transition-all font-black text-right pr-6 ${marksBuffer[stu.id] > 100 || marksBuffer[stu.id] < 0
                                                    ? 'focus:ring-rose-50 border-rose-100'
                                                    : 'focus:ring-indigo-50'
                                                    }`}
                                                value={marksBuffer[stu.id] || ''}
                                                onChange={e => setMarksBuffer({ ...marksBuffer, [stu.id]: parseFloat(e.target.value) })}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">PTS</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-5">
                                        <div className="flex justify-center">
                                            {marksBuffer[stu.id] >= 40 ? (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Passing Candidate</span>
                                            ) : marksBuffer[stu.id] !== undefined ? (
                                                <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">Review Required</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Awaiting entry</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-5">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleSaveSingle(stu.id)}
                                                disabled={savingId === stu.id || marksBuffer[stu.id] === undefined}
                                                className={`
                                                    p-3 rounded-[1rem] transition-all relative
                                                    ${savingId === stu.id
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white'
                                                    }
                                                    disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-400
                                                `}
                                            >
                                                {savingId === stu.id ? <UserCheck className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                                <AnimatePresence>
                                                    {savingId === stu.id && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1.5, opacity: 0 }}
                                                            className="absolute inset-0 bg-emerald-400 rounded-full"
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedStudents.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="inline-flex p-8 bg-gray-50 rounded-[2rem] text-gray-200 mb-6">
                                <Search className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">No Students Found</h3>
                            <p className="text-gray-500 font-medium">Try adjusting your filters or search term to see candidates.</p>
                        </div>
                    )}
                </div>

                <div className="p-10 bg-gray-900 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400">
                            {sortedStudents.length}
                        </div>
                        <div>
                            <div className="font-black">Ready to Finalize</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entries will be locked after publish</div>
                        </div>
                    </div>

                    <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-[1.2rem] font-black shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95">
                        Publish Final Results
                    </button>
                </div>
            </div>
        </div>
    );
};

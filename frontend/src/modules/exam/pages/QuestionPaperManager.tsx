import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../context/AuthContext';
import { FileText, Lock, Upload, CheckCircle2, History, AlertCircle } from 'lucide-react';
// import { supabase } from '../../../lib/supabase'; // Assuming supabase import exists or logic is mocked as per previous file

export const QuestionPaperManager = () => {
    const { hasRole } = useAuth();
    // PART 3 SAFETY: Only Exam Cell Admin can lock. Global Admin is restricted.
    const canLock = hasRole('EXAM_CELL_ADMIN');
    const isAdmin = hasRole('ADMIN') || canLock; // For generic admin views if any, but specifically for locking we use canLock

    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');

    const [papers, setPapers] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    // Initial Load - Get Exams
    useEffect(() => {
        // If query params exist, prefer them
        const searchParams = new URLSearchParams(window.location.search);
        const qExamId = searchParams.get('examId');
        const qScheduleId = searchParams.get('scheduleId');

        apiClient.get('/exams').then(res => {
            setExams(res.data);
            if (qExamId) setSelectedExamId(qExamId);
        });

        if (qScheduleId && qExamId) {
            // We need to wait for schedules to load? 
            // Actually, the dependency chain will handle it if we set examId
            // But we need to setScheduleId after schedules load.
            // Let's handle it in the schedules effect
        }
    }, []);

    // Load Schedules
    useEffect(() => {
        if (!selectedExamId) return;

        const searchParams = new URLSearchParams(window.location.search);
        const qScheduleId = searchParams.get('scheduleId');

        apiClient.get('/exams/exam-schedules', { params: { examId: selectedExamId } })
            .then(res => {
                setSchedules(res.data);
                if (qScheduleId && res.data.some((s: any) => s.id === qScheduleId)) {
                    setSelectedScheduleId(qScheduleId);
                }
            })
            .catch(console.error);
    }, [selectedExamId]);

    // Load Papers
    useEffect(() => {
        if (!selectedScheduleId) {
            setPapers([]);
            return;
        }
        fetchPapers();
    }, [selectedScheduleId]);

    const fetchPapers = async () => {
        try {
            const res = await apiClient.get('/exams/question-papers', { params: { examScheduleId: selectedScheduleId } });
            setPapers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Mock Upload Logic for UI Demo
            // In real app, use supabase storage
            // const { data, error } = await supabase.storage...

            const mockUrl = `https://storage.school.com/qp/${Date.now()}_${file.name}`;

            await apiClient.post('/exams/question-papers', {
                examScheduleId: selectedScheduleId,
                fileUrl: mockUrl,
                fileName: file.name,
                status: 'DRAFT'
            });

            alert("File uploaded successfully");
            fetchPapers();

        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleLock = async () => {
        if (!isAdmin) return; // Double check
        if (!confirm("Are you sure? Once locked, no further uploads are allowed.")) return;
        try {
            await apiClient.post('/exams/question-papers/lock', { examScheduleId: selectedScheduleId });
            alert("Paper Locked Successfully");
            fetchPapers();
        } catch (err) {
            alert("Lock failed");
        }
    };

    const latestPaper = papers.length > 0 ? papers[0] : null;
    const isLocked = latestPaper?.status === 'LOCKED';

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 py-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                Question Paper Manager
            </h1>

            {!isAdmin && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 text-amber-800 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Faculty Note: You can upload drafts. Only the Exam Administrator can finalize and lock the paper.</p>
                </div>
            )}

            {/* Selection */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Exam</label>
                    <select
                        className="w-full p-2 border rounded-xl"
                        value={selectedExamId}
                        onChange={e => { setSelectedExamId(e.target.value); setSelectedScheduleId(''); }}
                    >
                        <option value="">Select Exam</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject / Schedule</label>
                    <select
                        className="w-full p-2 border rounded-xl"
                        value={selectedScheduleId}
                        onChange={e => setSelectedScheduleId(e.target.value)}
                        disabled={!selectedExamId}
                    >
                        <option value="">Select Subject</option>
                        {schedules.map(s => <option key={s.id} value={s.id}>{s.subject?.name} - {new Date(s.exam_date).toLocaleDateString()}</option>)}
                    </select>
                </div>
            </div>

            {selectedScheduleId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Active Paper Status */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${isLocked ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Current Status</h2>
                                <p className="text-gray-500 font-medium">
                                    {isLocked ? "Secure & Ready for Exam" : "Draft Mode - Pending Final Lock"}
                                </p>
                            </div>
                            {isLocked ? (
                                <Lock className="w-10 h-10 text-emerald-500" />
                            ) : (
                                <History className="w-10 h-10 text-amber-500" />
                            )}
                        </div>

                        {latestPaper ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-red-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 max-w-[150px] truncate" title={latestPaper.file_name}>{latestPaper.file_name}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Version {latestPaper.version}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-500">
                                        {new Date(latestPaper.uploaded_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {canLock && !isLocked && (
                                    <button
                                        onClick={handleLock}
                                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                                    >
                                        <Lock className="w-4 h-4" /> Lock & Finalize
                                    </button>
                                )}
                                {!canLock && !isLocked && hasRole('ADMIN') && (
                                    <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed group relative">
                                        <Lock className="w-4 h-4" /> Lock & Finalize
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48 text-center">
                                            Exam Cell operations are handled by the Examination Cell Admin
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 font-bold italic border-2 border-dashed border-gray-100 rounded-xl">
                                No papers uploaded yet.
                            </div>
                        )}
                    </div>

                    {/* Upload New Version */}
                    {!isLocked && (
                        <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Upload className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-indigo-900 mb-2">Upload New Version</h3>
                            <p className="text-indigo-600/80 font-medium mb-6 max-w-xs">
                                Uploading will create a new version (v{(latestPaper?.version || 0) + 1}) automatically.
                            </p>

                            <label className="cursor-pointer">
                                <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
                                <span className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                                    {uploading ? 'Uploading...' : 'Select PDF File'}
                                </span>
                            </label>
                        </div>
                    )}

                    {isLocked && (
                        <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-emerald-900 mb-2">Exam Locked</h3>
                            <p className="text-emerald-600/80 font-medium">
                                This paper is finalized. {isAdmin ? "Unlock via DB if urgent." : "Contact Admin if changes are needed."}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Version History */}
            {selectedScheduleId && papers.length > 1 && (
                <div className="mt-8 border-t border-gray-100 pt-8 opacity-60 hover:opacity-100 transition-opacity">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Version History</h3>
                    <div className="space-y-2">
                        {papers.slice(1).map(p => (
                            <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-500">v{p.version}</div>
                                    <div className="text-gray-600 truncate max-w-[200px]">{p.file_name}</div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(p.uploaded_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

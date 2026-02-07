import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Armchair, Printer, AlertTriangle, Users } from 'lucide-react';
import { ExamProgressGuide } from '../components/ExamProgressGuide';

export const ExamSeating = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [allocations, setAllocations] = useState<any[]>([]);
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        if (selectedExamId) {
            loadSeating(selectedExamId);
        } else {
            setAllocations([]);
            setHalls([]);
        }
    }, [selectedExamId]);

    const loadExams = async () => {
        const res = await apiClient.get('/exams');
        setExams(res.data || []);
    };

    const loadSeating = async (examId: string) => {
        setLoading(true);
        try {
            const [allocRes, hallsRes] = await Promise.all([
                apiClient.get('/exams/seating', { params: { examId } }),
                apiClient.get('/exams/halls')
            ]);
            setAllocations(allocRes.data || []);
            setHalls(hallsRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateClick = () => {
        setShowConfirm(true);
    };

    const confirmGenerate = async () => {
        setShowConfirm(false);
        setGenerating(true);
        try {
            await apiClient.post('/exams/seating/generate', { exam_id: selectedExamId });
            loadSeating(selectedExamId);
        } catch (err: any) {
            alert(err.response?.data?.error || "Generation Failed");
        } finally {
            setGenerating(false);
        }
    };

    // Group Allocations by Hall
    const seatingByHall = halls.map(hall => {
        return {
            ...hall,
            students: allocations.filter(a => a.exam_hall?.id === hall.id)
        };
    }).filter(h => h.students.length > 0);

    const totalAllocated = allocations.length;
    const totalCapacity = halls.reduce((acc, h) => acc + h.capacity, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <ExamProgressGuide currentStep="seating" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Seating Allocation
                    </h1>
                    <p className="text-gray-500 font-medium">Auto-assign students to examination halls.</p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end justify-between">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Exam</label>
                    <select
                        className="p-3 border rounded-xl min-w-[280px] bg-gray-50 font-medium text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedExamId}
                        onChange={e => setSelectedExamId(e.target.value)}
                    >
                        <option value="">Choose Exam...</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                {selectedExamId && (
                    <div className="flex gap-3">
                        {allocations.length > 0 && (
                            <button
                                onClick={window.print}
                                className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 hover:text-black transition-colors print:hidden shadow-sm"
                            >
                                <Printer className="w-5 h-5" /> Print Plan
                            </button>
                        )}
                        <button
                            onClick={handleGenerateClick}
                            disabled={generating}
                            className="px-6 py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Armchair className="w-5 h-5" /> {allocations.length > 0 ? 'Regenerate Seating' : 'Generate Seating'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-center text-gray-900 mb-2">Overwrite Existing Plan?</h3>
                        <p className="text-center text-gray-500 mb-8">
                            This will clear all current student seat allocations for this exam and generate a fresh plan based on current logic. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmGenerate}
                                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-200 transition-colors"
                            >
                                Yes, Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics */}
            {selectedExamId && allocations.length > 0 && (
                <div className="flex items-center gap-6 px-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-700">{totalAllocated} Students Seated</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <Armchair className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-700">{totalCapacity} Total Seats Available</span>
                    </div>
                </div>
            )}

            {/* Visualizer */}
            {selectedExamId ? (
                loading ? (
                    <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        Fetching seating arrangements...
                    </div>
                ) :
                    seatingByHall.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2 print:gap-8">
                            {seatingByHall.map(hall => (
                                <div key={hall.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm break-inside-avoid hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50">
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg">{hall.name}</h3>
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Capacity: {hall.capacity}</span>
                                        </div>
                                        <div className="w-full max-w-[80px] text-right">
                                            <div className="text-2xl font-black text-indigo-600 leading-none">{hall.students.length}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Occupied</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {hall.students.map((alloc: any) => (
                                            <div key={alloc.id} className="aspect-square bg-white border-2 border-indigo-50 rounded-lg flex flex-col items-center justify-center relative group hover:border-indigo-500 hover:z-10 transition-all cursor-help shadow-sm">
                                                <div className="text-[9px] text-gray-400 font-mono mb-0.5">{alloc.seat_number}</div>
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                    {alloc.student?.admission?.student_code?.slice(-2) || '..'}
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none transition-all shadow-xl">
                                                    <div className="font-bold">{alloc.student?.full_name}</div>
                                                    <div className="text-[10px] text-gray-400">{alloc.student?.admission?.student_code}</div>
                                                    <div className="w-2 h-2 bg-gray-900 absolute top-full left-1/2 -translate-x-1/2 rotate-45"></div>
                                                </div>
                                            </div>
                                        ))}
                                        {Array.from({ length: hall.capacity - hall.students.length }).map((_, i) => (
                                            <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                <Armchair className="w-10 h-10 text-indigo-300" />
                            </div>
                            <h3 className="font-black text-gray-900 text-xl mb-2">No Seating Allocated Yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Click "Generate Seating" to automatically distribute students into exam halls based on hall capacity.
                            </p>
                            <button
                                onClick={handleGenerateClick}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                            >
                                Generate First Plan
                            </button>
                        </div>
                    )
            ) : (
                <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center opacity-70">
                    <Armchair className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="font-bold text-gray-500">Select an exam above to manage student placement.</p>
                </div>
            )}
        </div>
    );
};

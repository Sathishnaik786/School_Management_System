import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Play, Printer, Users } from 'lucide-react';

export const ExamSeatingAllocation = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');

    // Seating Data
    const [allocation, setAllocation] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Initial Load
    useEffect(() => {
        apiClient.get('/exams').then(res => setExams(res.data));
    }, []);

    // Load Schedules
    useEffect(() => {
        if (!selectedExamId) return;
        apiClient.get('/exams/exam-schedules', { params: { examId: selectedExamId } }) // Check if param name matches API
            .then(res => setSchedules(res.data))
            .catch(console.error);
    }, [selectedExamId]);

    // Load Existing Allocation
    useEffect(() => {
        if (!selectedScheduleId) {
            setAllocation([]);
            return;
        }
        fetchAllocation();
    }, [selectedScheduleId]);

    const fetchAllocation = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/exams/seating', { params: { examScheduleId: selectedScheduleId } });
            setAllocation(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!confirm("This will overwrite existing seating for this exam. Continue?")) return;
        setGenerating(true);
        try {
            const res = await apiClient.post('/exams/seating/generate', { examScheduleId: selectedScheduleId });
            alert(res.data.message);
            fetchAllocation();
        } catch (err: any) {
            alert(err.response?.data?.error || "Generation Failed");
        } finally {
            setGenerating(false);
        }
    };

    // Group By Hall
    const hallsMap: any = {};
    allocation.forEach((a: any) => {
        const hName = a.hall.hall_name;
        if (!hallsMap[hName]) hallsMap[hName] = [];
        hallsMap[hName].push(a);
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seating Allocation</h1>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    <Printer className="w-4 h-4" /> Print Chart
                </button>
            </div>

            {/* Controls (Hidden in Print) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 print:hidden">
                <select
                    className="p-2 border rounded-xl"
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                >
                    <option value="">Select Exam</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>

                <select
                    className="p-2 border rounded-xl"
                    value={selectedScheduleId}
                    onChange={e => setSelectedScheduleId(e.target.value)}
                    disabled={!selectedExamId}
                >
                    <option value="">Select Subject / Schedule</option>
                    {schedules.map(s => <option key={s.id} value={s.id}>{s.subject?.name} ({s.exam_date})</option>)}
                </select>

                <button
                    onClick={handleGenerate}
                    disabled={!selectedScheduleId || generating}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 ml-auto"
                >
                    <Play className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate Seating'}
                </button>
            </div>

            {/* Display */}
            {loading ? <div className="text-center p-12">Loading...</div> : (
                <div className="space-y-8">
                    {Object.entries(hallsMap).map(([hallName, students]: any) => (
                        <div key={hallName} className="bg-white p-8 rounded-none shadow-none border border-gray-200 print:break-inside-avoid">
                            <div className="border-b-2 border-gray-900 pb-4 mb-6 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-gray-900">{hallName}</h2>
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {students.length} Students
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {students.map((stu: any) => (
                                    <div key={stu.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center">
                                        <div className="text-xs font-black text-indigo-600 mb-1">{stu.seat_number}</div>
                                        <div className="font-bold text-gray-900 truncate">{stu.student?.full_name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{stu.student?.student_code}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {allocation.length === 0 && selectedScheduleId && (
                        <div className="text-center p-12 text-gray-400 font-bold italic">
                            No seating allocated yet. Click Generate.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

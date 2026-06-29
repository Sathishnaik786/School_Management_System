import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { Calendar, User, PenLine, Check, CheckCircle2 } from 'lucide-react';

export function EntranceExamPage() {
    const queryClient = useQueryClient();
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [marks, setMarks] = useState<Record<string, number>>({});
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});

    const recordMarksMutation = useMutation({
        mutationFn: admissionApi.recordExamMarks,
        onSuccess: () => {
            alert('Results saved successfully!');
            setSelectedExamId(null);
        },
    });

    const mockExams = [
        { id: 'ex1', subject: 'Mathematics Entrance', date: '2026-07-02', candidatesCount: 4 },
        { id: 'ex2', subject: 'English Proficiency', date: '2026-07-05', candidatesCount: 2 },
    ];

    const mockCandidates = [
        { id: 'c1', name: 'Kabir Verma', email: 'kabir@mail.com', marks: 82, present: true },
        { id: 'c2', name: 'Neelam Jha', email: 'neelam@mail.com', marks: 45, present: true },
    ];

    const handleSaveResults = () => {
        recordMarksMutation.mutate({
            examId: selectedExamId,
            marks,
            attendance,
        });
    };

    return (
        <div className="space-y-6 pb-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Entrance Examination</h1>
                <p className="text-sm text-gray-500 mt-1">Manage exam templates, attendance, and record merit scores.</p>
            </div>

            {!selectedExamId ? (
                /* Scheduled Exams Lists */
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wide">Upcoming Entrance Exams</h2>
                        <div className="space-y-3">
                            {mockExams.map(exam => (
                                <div key={exam.id} className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{exam.subject}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{exam.date} · {exam.candidatesCount} Candidates</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setSelectedExamId(exam.id)}
                                        className="bg-gray-900 text-white text-xs font-bold"
                                    >
                                        Enter Results
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Candidates Attendance & Marks Grid */
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-sm font-black text-gray-900">Entrance Results Entry</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Mathematics Entrance — 2026-07-02</p>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedExamId(null)}>Cancel</Button>
                    </div>

                    <div className="space-y-4">
                        {mockCandidates.map(c => (
                            <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{c.name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{c.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Attendance */}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked={c.present}
                                            onChange={e => setAttendance({ ...attendance, [c.id]: e.target.checked })}
                                            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                                        />
                                        <span className="text-xs font-bold text-gray-600">Present</span>
                                    </label>

                                    {/* Marks */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Marks</label>
                                        <input
                                            type="number"
                                            placeholder="Score"
                                            defaultValue={c.marks}
                                            onChange={e => setMarks({ ...marks, [c.id]: Number(e.target.value) })}
                                            className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleSaveResults}
                            className="bg-primary text-white flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Save & Publish
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EntranceExamPage;

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../../lib/api-client';
import { Printer, AlertTriangle, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const MyHallTicket = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    // Prioritize param (for parents/admin), fallback to logged-in user
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId') || user?.id;

    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (examId && studentId) {
            apiClient.get(`/exams/hall-ticket?examId=${examId}&studentId=${studentId}`)
                .then(res => setData(res.data))
                .catch(err => {
                    // Extract helpful message if possible
                    setError(err.response?.data?.error || "Hall ticket is not generated yet.");
                })
                .finally(() => setLoading(false));
        } else {
            setError("Exam information is missing. Please return to the dashboard.");
            setLoading(false);
        }
    }, [examId, studentId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex items-center justify-center p-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-xl mx-auto mt-12 p-8 text-center animate-in fade-in duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-6 text-amber-500">
                <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                {error.includes("fee") ?
                    "There seems to be a pending administrative requirement (Fees). Please contact the school office." :
                    error.includes("attendance") ?
                        "Attendance requirements for this exam cycle have not been met." :
                        error
                }
            </p>
            <Link to="/app/student/exams" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                Return to My Exams
            </Link>
        </div>
    );

    if (!data) return null;

    return (
        <div className="max-w-3xl mx-auto my-10 bg-white shadow-2xl rounded-none print:shadow-none print:w-full animate-in zoom-in-95 duration-300">
            {/* Actions (Hidden in Print) */}
            <div className="flex justify-between items-center bg-gray-50 p-4 print:hidden border-b border-gray-100">
                <Link to="/app/student/exams" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md"
                >
                    <Printer className="w-4 h-4" /> Print Ticket
                </button>
            </div>

            <div className="p-10">
                {/* Ticket Header */}
                <div className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gray-900 text-white flex items-center justify-center font-black text-3xl rounded-lg">
                            R
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Rapid School</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Official Hall Ticket</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-black text-indigo-600 border-b-2 border-indigo-600 inline-block pb-1">{data.exam.name}</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">{new Date().getFullYear()} Academic Session</p>
                    </div>
                </div>

                {/* Student Details Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Candidate Name</label>
                        <p className="text-xl font-bold text-gray-900">{data.student.full_name}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Student ID/Code</label>
                        <p className="text-xl font-bold text-gray-900 font-mono tracking-tight">{data.student.student_code}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Roll Number</label>
                        <p className="text-lg font-bold text-gray-900">{data.student.roll_number || '---'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Eligibility</label>
                        <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs border border-emerald-100 uppercase tracking-wide">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                        </div>
                    </div>
                </div>

                {/* Schedule Table */}
                <div className="mb-10">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-px bg-gray-300"></span> Exam Timetable
                    </h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Time</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Subject</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Invigilator Sign</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {data.schedule.map((sch: any) => (
                                    <tr key={sch.id}>
                                        <td className="p-4 font-bold text-gray-700 whitespace-nowrap">{sch.exam_date}</td>
                                        <td className="p-4 font-medium text-gray-600 whitespace-nowrap">{sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}</td>
                                        <td className="p-4 font-bold text-gray-900">{sch.subject?.name}</td>
                                        <td className="p-4 border-l border-dashed border-gray-200"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Candidate Instructions</h4>
                    <ul className="space-y-3">
                        {data.instructions.map((inst: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 font-medium flex gap-3 items-start leading-relaxed">
                                <span className="font-bold text-gray-300 text-xs mt-0.5">0{i + 1}</span>
                                {inst}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <div className="mt-16 flex justify-between items-end pt-8 border-t-2 border-dashed border-gray-200">
                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                        Issued: {new Date(data.generated_at).toLocaleDateString()}
                    </div>
                    <div className="text-center">
                        {/* Placeholder Signature */}
                        <div className="font-nothing-you-could-do text-2xl text-indigo-900 mb-1 -rotate-2 opacity-80">Principal</div>
                        <div className="h-px bg-gray-300 w-32 mb-2"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authority Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { LayoutDashboard, Calendar, FileText, CheckCircle2, AlertCircle, Clock, ChevronRight, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExamDashboard = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        published: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await apiClient.get('/exams');
            const data = res.data || [];

            setExams(data);

            // Calculate Stats
            const upcoming = data.filter((e: any) => e.status === 'SCHEDULED' || e.status === 'DRAFT').length;
            const completed = data.filter((e: any) => e.status === 'COMPLETED').length;
            const published = data.filter((e: any) => e.status === 'PUBLISHED').length;

            setStats({ upcoming, completed, published });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-100 rounded-2xl"></div>
                    <div className="h-32 bg-gray-100 rounded-2xl"></div>
                    <div className="h-32 bg-gray-100 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Examination Control Center</h1>
                <p className="text-gray-500 font-medium">Welcome back. Here is what is happening today.</p>
            </div>

            {/* Improved KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm font-bold uppercase tracking-wider text-indigo-100 mb-2">Upcoming Exams</div>
                        <div className="text-4xl font-black">{stats.upcoming}</div>
                        <Link to="/app/exam-admin/timetable" className="inline-flex items-center gap-2 mt-4 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                            Manage Schedules <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-100 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
                            <FileText className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Exams</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{exams.length}</div>
                    </div>
                    <div className="w-full h-1 bg-gray-100 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(stats.completed / (exams.length || 1)) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 font-medium">
                        {stats.completed} Completed
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-emerald-100 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-emerald-600 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Published</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.published}</div>
                    </div>
                    <Link to="/app/exam-admin/results" className="text-xs font-bold text-emerald-600 hover:underline mt-4">
                        View Results &rarr;
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attention Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Needs Attention
                        </h3>

                        <div className="space-y-3">
                            {/* Mock logic for attention items */}
                            {stats.upcoming > 0 ? (
                                <Link to="/app/exam-admin/seating" className="block p-4 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-colors group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 bg-amber-500 rounded-full shrink-0 animate-pulse" />
                                        <div>
                                            <p className="font-bold text-amber-900 text-sm group-hover:underline">Seating Generation</p>
                                            <p className="text-xs text-amber-700 mt-1">Check if seating is ready for upcoming exams.</p>
                                        </div>
                                    </div>
                                </Link>
                            ) : null}

                            {exams.some(e => e.status === 'COMPLETED') ? (
                                <Link to="/app/exam-admin/results" className="block p-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0" />
                                        <div>
                                            <p className="font-bold text-indigo-900 text-sm group-hover:underline">Pending Results</p>
                                            <p className="text-xs text-indigo-700 mt-1">Review and publish results for completed exams.</p>
                                        </div>
                                    </div>
                                </Link>
                            ) : null}

                            {stats.upcoming === 0 && stats.published === exams.length && (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">All caught up!</p>
                                    <p className="text-xs text-gray-500">No pending actions required.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Guide */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg text-white">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-200">
                            <Clock className="w-5 h-5" /> Quick Workflow
                        </h3>
                        <ul className="space-y-4 relative">
                            <li className="flex gap-4 relative">
                                <span className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-gray-700"></span>
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold z-10">1</div>
                                <div>
                                    <p className="text-sm font-bold">Schedule</p>
                                    <p className="text-xs text-gray-400">Created timetable</p>
                                </div>
                            </li>
                            <li className="flex gap-4 relative">
                                <span className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-gray-700"></span>
                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold z-10">2</div>
                                <div>
                                    <p className="text-sm font-bold">Seating</p>
                                    <p className="text-xs text-gray-400">Allocate halls</p>
                                </div>
                            </li>
                            <li className="flex gap-4 relative">
                                <span className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-gray-700"></span>
                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold z-10">3</div>
                                <div>
                                    <p className="text-sm font-bold">Question Papers</p>
                                    <p className="text-xs text-gray-400">Upload & Lock</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold z-10">4</div>
                                <div>
                                    <p className="text-sm font-bold">Results</p>
                                    <p className="text-xs text-gray-400">Publish to Students</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Main List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Active Exams
                            </h3>
                            <Link to="/app/exam-admin/timetable" className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                + Schedule New
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {exams.filter(e => e.status !== 'COMPLETED').slice(0, 5).map(exam => (
                                <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 text-lg">{exam.name}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${exam.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                                                    exam.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-gray-200 text-gray-600'
                                                }`}>
                                                {exam.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(exam.start_date).toLocaleDateString()}
                                            </span>
                                            <span>•</span>
                                            <span>{exam.type}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to="/app/exam-admin/timetable" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="Edit Schedule">
                                            <Calendar className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {exams.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold mb-1">No Exams Found</h3>
                                    <p className="text-gray-500 text-sm mb-4">Get started by creating your first exam schedule.</p>
                                    <Link to="/app/exam-admin/timetable" className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                                        Create Exam Schedule
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

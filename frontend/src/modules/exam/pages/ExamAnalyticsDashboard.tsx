import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { BarChart, Users, Medal, GraduationCap, TrendingUp, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as CBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export const ExamAnalyticsDashboard = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [overview, setOverview] = useState<any>(null);
    const [grades, setGrades] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [top, setTop] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiClient.get('/exams').then(res => setExams(res.data));
    }, []);

    useEffect(() => {
        if (!selectedExamId) return;
        fetchAnalytics();
    }, [selectedExamId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [ov, gr, sub, tp] = await Promise.all([
                apiClient.get('/exams/analytics/overview', { params: { examId: selectedExamId } }),
                apiClient.get('/exams/analytics/grades', { params: { examId: selectedExamId } }),
                apiClient.get('/exams/analytics/subjects', { params: { examId: selectedExamId } }),
                apiClient.get('/exams/analytics/top-performers', { params: { examId: selectedExamId } })
            ]);
            setOverview(ov.data);
            setGrades(gr.data);
            setSubjects(sub.data);
            setTop(tp.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <BarChart className="w-8 h-8 text-indigo-600" />
                Exam Analytics
            </h1>

            {/* Select Exam */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full md:w-1/3">
                <select
                    className="w-full p-2 border rounded-xl"
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                >
                    <option value="">Select Exam for Insights</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>

            {selectedExamId && (
                <>
                    {/* 1. KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <KPI icon={Users} title="Total Students" value={overview?.totalStudents || 0} sub="Scheduled & Graded" />
                        <KPI icon={GraduationCap} title="Net Pass %" value={`${overview?.passPercentage || 0}%`} sub={`${overview?.passCount} Passed / ${overview?.failCount} Failed`} highlight />
                        <KPI icon={TrendingUp} title="Class Average" value={`${overview?.avgPercentage || 0}%`} sub="Across all subjects" />
                        <KPI icon={BookOpen} title="Subjects Analyzed" value={subjects.length} sub="Included in this Report" />
                    </div>

                    {/* 2. Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Grade Distribution */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Grade Distribution</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={grades} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={80} label>
                                            {grades.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Subject Performance */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Subject Averages</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <CBarChart data={subjects}>
                                        <XAxis dataKey="subjectName" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="average" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                    </CBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 3. Tables Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Performers */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Medal className="w-5 h-5 text-amber-500" /> Top Performers
                            </h3>
                            <div className="overflow-auto max-h-64">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 font-bold border-b">
                                        <tr>
                                            <th className="pb-2">Rank</th>
                                            <th className="pb-2">Student</th>
                                            <th className="pb-2 text-right">Score</th>
                                            <th className="pb-2 text-right">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {top.map((t, i) => (
                                            <tr key={i}>
                                                <td className="py-3 font-bold text-indigo-600">#{i + 1}</td>
                                                <td className="py-3">
                                                    <div className="font-medium text-gray-900">{t.student?.full_name}</div>
                                                    <div className="text-xs text-gray-500">{t.student?.student_code}</div>
                                                </td>
                                                <td className="py-3 text-right font-mono">{t.total_obtained}</td>
                                                <td className="py-3 text-right font-bold">{t.percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Subject Details List */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Subject Breakdown</h3>
                            <div className="overflow-auto max-h-64">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 font-bold border-b">
                                        <tr>
                                            <th className="pb-2">Subject</th>
                                            <th className="pb-2 text-right">Avg</th>
                                            <th className="pb-2 text-right">High</th>
                                            <th className="pb-2 text-right">Low</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {subjects.map((s, i) => (
                                            <tr key={i}>
                                                <td className="py-3 font-medium text-gray-900">{s.subjectName}</td>
                                                <td className="py-3 text-right">{s.average}</td>
                                                <td className="py-3 text-right text-emerald-600">{s.highest}</td>
                                                <td className="py-3 text-right text-red-500">{s.lowest}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const KPI = ({ icon: Icon, title, value, sub, highlight }: any) => (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-900'} shadow-sm`}>
        <div className="flex items-center gap-3 mb-2 opacity-80">
            <Icon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        <div className="text-3xl font-black mb-1">{value}</div>
        <div className={`text-xs font-medium ${highlight ? 'text-indigo-100' : 'text-gray-500'}`}>{sub}</div>
    </div>
);

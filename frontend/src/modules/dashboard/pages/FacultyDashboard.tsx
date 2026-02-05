import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../lib/api-client';
import {
    Calendar,
    Users,
    BookOpen,
    Award,
    Clock,
    UserCheck,
    ArrowRight,
    LayoutDashboard,
    Bell,
    Settings,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ActivityTimeline } from '../../../components/ActivityTimeline';

export const FacultyDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/dashboard/faculty/overview')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Faculty Workspace
                    </h1>
                    <p className="text-gray-500 font-medium">Welcome back! Here's what's happening with your sections today.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick Search..."
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden"
                >
                    <div className="relative z-10 space-y-4">
                        <div className="text-5xl font-black">{stats?.classes_today || 0}</div>
                        <div className="text-sm font-black uppercase tracking-widest opacity-80">Classes Today</div>
                    </div>
                    <Clock className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group"
                >
                    <div className="space-y-1">
                        <div className="text-4xl font-black text-gray-900">{stats?.sections_count || 0}</div>
                        <div className="text-sm font-black text-gray-400 uppercase tracking-widest">My Sections</div>
                    </div>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-8 h-8" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group"
                >
                    <div className="space-y-1">
                        <div className="text-4xl font-black text-gray-900">{stats?.pending_assignments || 0}</div>
                        <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Pending Work</div>
                    </div>
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="hidden lg:flex bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm items-center justify-between group"
                >
                    <div className="space-y-1">
                        <div className="text-4xl font-black text-gray-900">98%</div>
                        <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Avg Attendance</div>
                    </div>
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserCheck className="w-8 h-8" />
                    </div>
                </motion.div>
            </div>

            {/* Action Center - High Fidelity */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Action Center</h3>
                        <p className="text-gray-500 font-medium">Quick links to your daily academic responsibilities.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Settings className="w-5 h-5" /></button>
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Bell className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                    <Link to="/app/academic/my-students" className="group">
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex flex-col items-center text-center gap-4 transition-all hover:shadow-2xl hover:shadow-blue-100"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-blue-900 text-lg">My Students</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">Automatic Roster</p>
                            </div>
                            <div className="mt-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/app/attendance/mark" className="group">
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 flex flex-col items-center text-center gap-4 transition-all hover:shadow-2xl hover:shadow-rose-100"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                                <UserCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-rose-900 text-lg">Mark Attendance</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mt-1">Daily Records</p>
                            </div>
                            <div className="mt-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight className="w-4 h-4 text-rose-600" />
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/app/timetable/my" className="group">
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center gap-4 transition-all hover:shadow-2xl hover:shadow-indigo-100"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 text-lg">My Timetable</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">Weekly Schedule</p>
                            </div>
                            <div className="mt-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight className="w-4 h-4 text-indigo-600" />
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/app/exams/marks" className="group">
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex flex-col items-center text-center gap-4 transition-all hover:shadow-2xl hover:shadow-emerald-100"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                <Award className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-emerald-900 text-lg">Enter Marks</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1">Exam Grading</p>
                            </div>
                            <div className="mt-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight className="w-4 h-4 text-emerald-600" />
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/app/academic/assignments" className="group">
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-violet-50 p-8 rounded-[2rem] border border-violet-100 flex flex-col items-center text-center gap-4 transition-all hover:shadow-2xl hover:shadow-violet-100"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-violet-900 text-lg">Class Work</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mt-1">Assignments</p>
                            </div>
                            <div className="mt-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight className="w-4 h-4 text-violet-600" />
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* Bottom Section - Placeholder for Recent Activity or Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                        Today's Sessions
                    </h3>
                    <div className="space-y-4">
                        <div className="text-center py-10">
                            <Clock className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold italic">Check your timetable for today's classes.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-rose-600" />
                        Live Feed
                    </h3>
                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <ActivityTimeline />
                    </div>
                </div>
            </div>
        </div>
    );
};

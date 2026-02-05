import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../context/AuthContext';
import {
    Users,
    Search,
    Filter,
    Info,
    MoreVertical,
    GraduationCap,
    UserPlus,
    LayoutGrid,
    CheckCircle2,
    Calendar,
    ChevronRight,
    ArrowUpDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ImportWizard } from '../../../components/import/ImportWizard';

export const StudentList = () => {
    const { hasPermission, user } = useAuth(); // Assuming useAuth provides 'user.roles' or 'hasPermission'
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [page, limit, searchTerm]);

    const fetchData = () => {
        setLoading(true);
        apiClient.get('/students', { params: { page, limit, search: searchTerm } })
            .then(res => {
                setData(res.data.data || []);
                setTotalPages(res.data.meta?.totalPages || 1);
                setTotalRecords(res.data.meta?.total || 0);
            })
            .finally(() => setLoading(false));
    };

    const filteredStudents = data; // Server-side filtered

    const canImport = user?.roles?.includes('ADMIN');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Import Wizard Modal */}
            <ImportWizard
                isOpen={isImportOpen}
                onClose={() => { setIsImportOpen(false); fetchData(); }} // Refresh data on close for UX
                entityType="STUDENT"
                title="Students"
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <Users className="w-10 h-10 text-blue-600" />
                        Student Directory
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Manage and monitor institutional student records.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl border border-gray-100 font-bold hover:bg-gray-100 transition-all">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>

                    {canImport && (
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl border border-blue-100 font-bold hover:bg-blue-50 transition-all shadow-sm"
                        >
                            <Calendar className="w-5 h-5" /> {/* Reusing Calendar Icon as Import Placeholder or use DownloadCloud if imported */}
                            Import CSV
                        </button>
                    )}

                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100">
                        <UserPlus className="w-5 h-5" />
                        Add Manually
                    </button>
                </div>
            </div>

            {/* toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, student code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 font-bold bg-gray-50 px-4 py-3 rounded-xl">
                    <LayoutGrid className="w-4 h-4" />
                    TOTAL: {totalRecords} STUDENTS
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        RECORDS <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">STATUS</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">PERSONAL DETAILS</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                <tr key={student.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                {student.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 uppercase">{student.full_name}</div>
                                                <div className="text-xs font-bold text-gray-400 mt-0.5 tracking-tight">{student.student_code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest 
                                        ${student.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                Born: {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                                                Gender: {student.gender}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/app/students/${student.id}`}
                                                className="p-2.5 bg-white text-gray-400 hover:text-blue-600 rounded-xl border border-gray-100 shadow-sm transition-all"
                                                title="View Profile"
                                            >
                                                <Info className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                to={`/app/academic/classes`} // Direct to assignment
                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100 transition-all uppercase"
                                            >
                                                Assign Section
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                                <Search className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <p className="text-gray-400 font-bold text-sm">No students matched your search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Rows per page
                    </span>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold p-2 outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-xs font-bold text-gray-400">
                        Total {totalRecords} records
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <span className="text-sm font-black text-gray-900 px-2">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

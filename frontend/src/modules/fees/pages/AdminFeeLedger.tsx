import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Search, ChevronLeft, ChevronRight, FileDown, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const AdminFeeLedger = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50 });
    const [academicYearId, setAcademicYearId] = useState('');
    const [bridgeData, setBridgeData] = useState<Record<string, any>>({});

    // Filters
    const [search, setSearch] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [dueOnly, setDueOnly] = useState(false); // Client-side filter for now or add to API?

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey: string) => {
        if (sortConfig?.key === columnKey) {
            return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
        }
        return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-300" />;
    };

    // Load initial metadata (Classes)
    useEffect(() => {
        Promise.all([
            apiClient.get('/academic/classes'),
            apiClient.get('/academic-years?status=OPEN')
        ]).then(([clsRes, yearRes]) => {
            setClasses(clsRes.data);
            if (yearRes.data?.length > 0) setAcademicYearId(yearRes.data[0].id);
        }).catch(err => console.error(err));
    }, []);

    // Load Sections when Class changes
    // Load Sections & Bridge Data when Class changes
    useEffect(() => {
        if (!selectedClass) {
            setSections([]);
            setBridgeData({});
            return;
        }
        apiClient.get(`/academic/classes/${selectedClass}/sections`)
            .then(res => setSections(res.data))
            .catch(err => console.error(err));

        if (academicYearId) {
            fetchBridgeData();
        }
    }, [selectedClass, academicYearId]);

    const fetchBridgeData = async () => {
        if (!selectedClass || !academicYearId) return;
        try {
            const res = await apiClient.get(`/exams/admin/bridge/${selectedClass}/status?academicYearId=${academicYearId}`);
            // Map array to object for O(1) lookup
            const map: Record<string, any> = {};
            res.data.forEach((s: any) => map[s.id] = s);
            setBridgeData(map);
        } catch (err) {
            console.error("Bridge fetch failed", err);
        }
    };

    const handleExamOverride = async (studentId: string, newStatus: boolean) => {
        if (!confirm(`Are you sure you want to manually set Exam Eligibility to ${newStatus ? 'ELIGIBLE' : 'BLOCKED'}? This overrides the financial status.`)) return;

        // Optimistic Update
        setBridgeData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                fees: { ...prev[studentId]?.fees, is_cleared: newStatus, source: 'ADMIN' }
            }
        }));

        try {
            await apiClient.post('/exams/admin/bridge/fees', {
                studentId,
                academicYearId,
                status: newStatus ? 'PAID' : 'UNPAID', // Mapping clear->PAID for exam logic
                userId: 'CURRENT_USER_ID_HANDLED_BY_BACKEND'
            });
            fetchBridgeData(); // Refresh to be safe
        } catch (err) {
            console.error("Override failed", err);
            alert("Failed to save override");
            fetchBridgeData(); // Revert
        }
    };

    // Load Ledger Data
    useEffect(() => {
        fetchLedger(1);
    }, [selectedSection, search, sortConfig]); // Note: If class selected but no section, we might need to handle filtering by class in API (which we skipped for simplicity).
    // Let's rely on Section Selection for now as per API design, or Search.

    const fetchLedger = (page: number) => {
        setLoading(true);
        const params: any = { page, limit: 50 };
        if (selectedSection) params.sectionId = selectedSection;
        if (search) params.search = search;
        if (sortConfig) {
            params.sortBy = sortConfig.key;
            params.sortOrder = sortConfig.direction;
        }

        apiClient.get('/fees/admin/ledger', { params })
            .then(res => {
                setData(res.data.data);
                setMeta(res.data.meta);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLedger(1);
    };

    // Derived Visual Data
    const displayData = dueOnly
        ? data.filter(r => r.balance > 1)
        : data;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Fee Ledger</h1>
                    <p className="text-gray-500">Complete financial overview of all students</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm">
                        <FileDown className="w-4 h-4" />
                        Export
                    </button>
                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            disabled={meta.page === 1}
                            onClick={() => fetchLedger(meta.page - 1)}
                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium">Page {meta.page}</span>
                        <button
                            disabled={meta.page * meta.limit >= meta.total}
                            onClick={() => fetchLedger(meta.page + 1)}
                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-1 w-full md:w-auto">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Search Student</label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Name or Request ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchLedger(1)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="w-full md:w-48">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Class</label>
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-48">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Section</label>
                    <select
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        disabled={!selectedClass}
                        className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        <option value="">All Sections</option>
                        {sections.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 pb-2">
                    <input
                        type="checkbox"
                        id="dueToggle"
                        checked={dueOnly}
                        onChange={e => setDueOnly(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="dueToggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Show Dues Only
                    </label>
                </div>

                <button onClick={() => fetchLedger(1)} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
                    Apply
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th
                                className="p-4 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('full_name')}
                            >
                                <div className="flex items-center">
                                    Student {getSortIcon('full_name')}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('class_name')}
                            >
                                <div className="flex items-center">
                                    Class/Sec {getSortIcon('class_name')}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-gray-500 uppercase text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('total_fee')}
                            >
                                <div className="flex items-center justify-end">
                                    Total Assigned {getSortIcon('total_fee')}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-gray-500 uppercase text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('total_paid')}
                            >
                                <div className="flex items-center justify-end">
                                    Paid {getSortIcon('total_paid')}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-gray-500 uppercase text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('balance')}
                            >
                                <div className="flex items-center justify-end">
                                    Balance {getSortIcon('balance')}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-gray-500 uppercase text-center cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('balance')}
                            >
                                <div className="flex items-center justify-center">
                                    Fin. Status {getSortIcon('balance')}
                                </div>
                            </th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Exam Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
                                </tr>
                            ))
                        ) : displayData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-gray-400">
                                    No records found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            displayData.map((row, i) => {
                                const isCleared = row.balance <= 1;
                                // Merge Bridge Data
                                const bridge = bridgeData[row.student_id];
                                const isOverride = bridge?.fees?.source === 'ADMIN';
                                const isExamCleared = bridge?.fees?.is_cleared ?? isCleared; // Default to financial status

                                return (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{row.full_name}</div>
                                            <div className="text-xs text-gray-400">{row.student_code}</div>
                                            {row.is_test_data && (
                                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200 uppercase">
                                                    Test Seed
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {row.class_name} - {row.section_name}
                                        </td>
                                        <td className="p-4 text-right font-medium text-gray-900">
                                            Rs. {row.total_fee.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right font-medium text-emerald-600">
                                            Rs. {row.total_paid.toLocaleString()}
                                        </td>
                                        <td className={`p-4 text-right font-bold ${isCleared ? 'text-gray-400' : 'text-red-600'}`}>
                                            Rs. {row.balance.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isCleared ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {isCleared ? 'Cleared' : 'Due'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleExamOverride(row.student_id, !isExamCleared)}
                                                disabled={!academicYearId || !selectedClass}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isExamCleared
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-blue-500 hover:text-blue-600'
                                                    }`}
                                                title={!selectedClass ? "Select a Class to enable overrides" : "Toggle Exam Eligibility"}
                                            >
                                                {isOverride && (
                                                    <span className="mr-1 text-[10px] bg-purple-100 text-purple-700 px-1 rounded">ADMIN</span>
                                                )}
                                                {isExamCleared ? 'ELIGIBLE' : 'BLOCKED'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-gray-400 text-center">
                Showing {displayData.length} of {meta.total} records (Server limit: 50)
            </div>
        </div>
    );
};

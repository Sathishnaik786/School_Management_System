import React, { useEffect, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';
import type { ExamRegistration, RegistrationStatus } from '../types';

const STATUS_COLORS: Record<RegistrationStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    PENDING: 'bg-yellow-100 text-yellow-700',
    VERIFIED: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    HALL_TICKET_GENERATED: 'bg-purple-100 text-purple-700',
    CHECKED_IN: 'bg-cyan-100 text-cyan-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_FLOW: RegistrationStatus[] = [
    'DRAFT', 'PENDING', 'VERIFIED', 'APPROVED', 'HALL_TICKET_GENERATED', 'CHECKED_IN', 'COMPLETED'
];

export const RegistrationsPage: React.FC = () => {
    const { registrations, registrationTotal, loading, error, fetchRegistrations, updateRegistrationStatus, generateHallTicket, clearError } = useExamOperationsStore();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchRegistrations({ status: statusFilter || undefined, page });
    }, [statusFilter, page]);

    const handleAdvance = async (reg: ExamRegistration) => {
        const currentIdx = STATUS_FLOW.indexOf(reg.status);
        if (currentIdx < STATUS_FLOW.length - 1) {
            await updateRegistrationStatus(reg.id, STATUS_FLOW[currentIdx + 1], remarks);
            setExpandedId(null);
            setRemarks('');
        }
    };

    const handleHallTicket = async (reg: ExamRegistration) => {
        await generateHallTicket(reg.id);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Candidate Registrations</h1>
                    <p className="text-sm text-gray-500 mt-1">{registrationTotal} total registrations</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600">Student</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600">Roll No.</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600">Exam</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-600">Registered</th>
                            <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading && (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading registrations...</td></tr>
                        )}
                        {!loading && registrations.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">No registrations found.</td></tr>
                        )}
                        {registrations.map(reg => (
                            <React.Fragment key={reg.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {reg.students ? `${reg.students.first_name} ${reg.students.last_name}` : reg.student_id.slice(0, 8) + '…'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{reg.students?.roll_number || '—'}</td>
                                    <td className="px-6 py-4 text-gray-600">{reg.exams?.name || reg.exam_id.slice(0, 8) + '…'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[reg.status]}`}>
                                            {reg.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mr-3"
                                        >
                                            {expandedId === reg.id ? 'Collapse' : 'Manage'}
                                        </button>
                                        {reg.status === 'APPROVED' && (
                                            <button
                                                onClick={() => handleHallTicket(reg)}
                                                className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition-colors"
                                            >
                                                Generate Ticket
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                {expandedId === reg.id && (
                                    <tr className="bg-indigo-50">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    {STATUS_FLOW.map((s, i) => (
                                                        <span key={s} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${reg.status === s ? 'bg-indigo-600 text-white' : STATUS_COLORS[s]}`}>
                                                            {i + 1}. {s.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Remarks (optional)"
                                                    value={remarks}
                                                    onChange={e => setRemarks(e.target.value)}
                                                    className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"
                                                />
                                                {reg.status !== 'COMPLETED' && reg.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => handleAdvance(reg)}
                                                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Advance →
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateRegistrationStatus(reg.id, 'CANCELLED', 'Manually cancelled')}
                                                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Page {page}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            ← Prev
                        </button>
                        <button
                            disabled={registrations.length < 20}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationsPage;

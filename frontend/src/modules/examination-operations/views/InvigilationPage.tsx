import React, { useEffect, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';

const STATUS_COLORS = {
    ASSIGNED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
};

const ROLE_COLORS = {
    CHIEF_SUPERINTENDENT: 'bg-purple-100 text-purple-700',
    INVIGILATOR: 'bg-indigo-100 text-indigo-700',
    RELIEVER: 'bg-gray-100 text-gray-600',
};

export const InvigilationPage: React.FC = () => {
    const {
        assignments, availability, loading, error,
        fetchAssignments, assignInvigilator, removeAssignment,
        fetchAvailability, setAvailability, clearError
    } = useExamOperationsStore();

    const [activeTab, setActiveTab] = useState<'assignments' | 'availability'>('assignments');
    const [scheduleIdFilter, setScheduleIdFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignForm, setAssignForm] = useState({
        exam_schedule_id: '', room_id: '', faculty_profile_id: '', role: 'INVIGILATOR'
    });

    useEffect(() => {
        if (activeTab === 'assignments') fetchAssignments(scheduleIdFilter || undefined);
        if (activeTab === 'availability') fetchAvailability(dateFilter || undefined);
    }, [activeTab, scheduleIdFilter, dateFilter]);

    const handleAssign = async () => {
        if (!assignForm.exam_schedule_id || !assignForm.room_id || !assignForm.faculty_profile_id) return;
        await assignInvigilator(assignForm);
        setAssignForm({ exam_schedule_id: '', room_id: '', faculty_profile_id: '', role: 'INVIGILATOR' });
        setShowAssignForm(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invigilation Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Assign and manage invigilators for exam sessions</p>
                </div>
                {activeTab === 'assignments' && (
                    <button
                        onClick={() => setShowAssignForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        + Assign Invigilator
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 font-bold text-xl leading-none">×</button>
                </div>
            )}

            {/* Tab Bar */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button onClick={() => setActiveTab('assignments')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'assignments' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}>
                    📋 Assignments
                </button>
                <button onClick={() => setActiveTab('availability')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'availability' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}>
                    📅 Availability
                </button>
            </div>

            {/* ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
                <>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Filter by Schedule ID"
                            value={scheduleIdFilter}
                            onChange={e => setScheduleIdFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
                        />
                        <button
                            onClick={() => fetchAssignments(scheduleIdFilter || undefined)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                            Load
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Faculty</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Room</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                                    <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>}
                                {!loading && assignments.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                                        <div className="text-4xl mb-2">👨‍🏫</div>
                                        <p>No assignments yet. Add invigilators for upcoming exams.</p>
                                    </td></tr>
                                )}
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {a.faculty_profiles?.users
                                                ? `${a.faculty_profiles.users.first_name} ${a.faculty_profiles.users.last_name}`
                                                : a.faculty_profile_id.slice(0, 8) + '…'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{a.exam_rooms?.room_number || a.room_id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${ROLE_COLORS[a.role]}`}>{a.role.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => removeAssignment(a.id)}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* AVAILABILITY TAB */}
            {activeTab === 'availability' && (
                <>
                    <div className="flex gap-3 items-center">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                            onClick={() => fetchAvailability(dateFilter || undefined)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                            Load
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Faculty</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Time Window</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Available</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>}
                                {!loading && availability.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">No availability records for this date.</td></tr>
                                )}
                                {availability.map(av => (
                                    <tr key={av.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {av.faculty_profiles?.users
                                                ? `${av.faculty_profiles.users.first_name} ${av.faculty_profiles.users.last_name}`
                                                : av.faculty_profile_id.slice(0, 8) + '…'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{av.available_date}</td>
                                        <td className="px-6 py-4 text-gray-600">{av.start_time} – {av.end_time}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${av.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {av.is_available ? '✓ Available' : '✗ Not Available'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Assign Form Modal */}
            {showAssignForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Assign Invigilator</h2>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Exam Schedule ID *" value={assignForm.exam_schedule_id} onChange={e => setAssignForm(f => ({ ...f, exam_schedule_id: e.target.value }))} />
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Room ID *" value={assignForm.room_id} onChange={e => setAssignForm(f => ({ ...f, room_id: e.target.value }))} />
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Faculty Profile ID *" value={assignForm.faculty_profile_id} onChange={e => setAssignForm(f => ({ ...f, faculty_profile_id: e.target.value }))} />
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={assignForm.role} onChange={e => setAssignForm(f => ({ ...f, role: e.target.value }))}>
                            <option value="INVIGILATOR">Invigilator</option>
                            <option value="CHIEF_SUPERINTENDENT">Chief Superintendent</option>
                            <option value="RELIEVER">Reliever</option>
                        </select>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowAssignForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleAssign} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm hover:bg-indigo-700">Assign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvigilationPage;

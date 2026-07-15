import React, { useEffect, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';

export const SchedulingPage: React.FC = () => {
    const {
        sessions, scheduleRooms, loading, error,
        fetchSessions, createSession, updateSession, deleteSession,
        fetchScheduleRooms, addScheduleRoom, removeScheduleRoom, clearError
    } = useExamOperationsStore();

    const [activeTab, setActiveTab] = useState<'sessions' | 'schedule-rooms'>('sessions');
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [sessionForm, setSessionForm] = useState({ name: '', start_time: '', end_time: '' });
    const [editingSession, setEditingSession] = useState<string | null>(null);
    const [scheduleIdFilter, setScheduleIdFilter] = useState('');

    useEffect(() => {
        if (activeTab === 'sessions') fetchSessions();
        if (activeTab === 'schedule-rooms' && scheduleIdFilter) fetchScheduleRooms(scheduleIdFilter);
    }, [activeTab]);

    const handleCreateSession = async () => {
        if (!sessionForm.name || !sessionForm.start_time || !sessionForm.end_time) return;
        if (editingSession) {
            await updateSession(editingSession, sessionForm);
            setEditingSession(null);
        } else {
            await createSession(sessionForm);
        }
        setSessionForm({ name: '', start_time: '', end_time: '' });
        setShowSessionForm(false);
    };

    const startEdit = (session: any) => {
        setEditingSession(session.id);
        setSessionForm({ name: session.name, start_time: session.start_time, end_time: session.end_time });
        setShowSessionForm(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Scheduling</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage exam sessions and room-schedule mappings</p>
                </div>
                {activeTab === 'sessions' && (
                    <button
                        onClick={() => { setEditingSession(null); setSessionForm({ name: '', start_time: '', end_time: '' }); setShowSessionForm(true); }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        + New Session
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 font-bold text-xl leading-none">×</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button onClick={() => setActiveTab('sessions')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'sessions' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}>
                    ⏰ Sessions
                </button>
                <button onClick={() => setActiveTab('schedule-rooms')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'schedule-rooms' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}>
                    🔗 Schedule–Rooms
                </button>
            </div>

            {/* SESSIONS */}
            {activeTab === 'sessions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading && <div className="col-span-3 text-center py-10 text-gray-400">Loading sessions...</div>}
                    {!loading && sessions.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-gray-400">
                            <div className="text-5xl mb-3">⏰</div>
                            <p className="text-lg font-medium">No sessions configured</p>
                            <p className="text-sm mt-1">Create sessions like "Morning" or "Afternoon" to organize your exams.</p>
                        </div>
                    )}
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">{session.name}</h3>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs">{session.start_time}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs">{session.end_time}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(session)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                                    <button onClick={() => deleteSession(session.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SCHEDULE-ROOMS */}
            {activeTab === 'schedule-rooms' && (
                <>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Exam Schedule ID"
                            value={scheduleIdFilter}
                            onChange={e => setScheduleIdFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
                        />
                        <button
                            onClick={() => fetchScheduleRooms(scheduleIdFilter || undefined)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                            Load
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Room</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Building</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Capacity</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Allocated</th>
                                    <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>}
                                {!loading && scheduleRooms.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400">No rooms assigned to this schedule.</td></tr>}
                                {scheduleRooms.map(sr => (
                                    <tr key={sr.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-800">🚪 {sr.exam_rooms?.room_number || sr.room_id.slice(0, 8)}</td>
                                        <td className="px-6 py-3 text-gray-600">{sr.exam_rooms?.exam_buildings?.name || '—'}</td>
                                        <td className="px-6 py-3 text-gray-600">{sr.exam_rooms?.capacity || '—'}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sr.allocated_capacity > (sr.exam_rooms?.capacity || 999) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {sr.allocated_capacity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button onClick={() => removeScheduleRoom(sr.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Session Form Modal */}
            {showSessionForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">{editingSession ? 'Edit' : 'New'} Session</h2>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Session Name (e.g. Morning Session)"
                            value={sessionForm.name}
                            onChange={e => setSessionForm(f => ({ ...f, name: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={sessionForm.start_time}
                                    onChange={e => setSessionForm(f => ({ ...f, start_time: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                                <input
                                    type="time"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={sessionForm.end_time}
                                    onChange={e => setSessionForm(f => ({ ...f, end_time: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowSessionForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreateSession} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm hover:bg-indigo-700">{editingSession ? 'Save Changes' : 'Create Session'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchedulingPage;

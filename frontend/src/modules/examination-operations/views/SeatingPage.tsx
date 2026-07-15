import React, { useEffect, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';

const SEAT_STATUS_COLORS = {
    ALLOCATED: 'bg-blue-100 text-blue-700',
    CHANGED: 'bg-amber-100 text-amber-700',
    RELEASED: 'bg-gray-100 text-gray-500',
};

export const SeatingPage: React.FC = () => {
    const {
        allocations, allocationAuditLogs, rooms, loading, error,
        fetchAllocations, autoAllocate, changeSeat, fetchAuditLogs, fetchRooms, clearError
    } = useExamOperationsStore();

    const [examScheduleId, setExamScheduleId] = useState('');
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    const [showAuditPanel, setShowAuditPanel] = useState(false);
    const [showChangeSeatModal, setShowChangeSeatModal] = useState<string | null>(null);
    const [changeSeatForm, setChangeSeatForm] = useState({ new_seat_number: '', new_room_id: '', remarks: '' });

    useEffect(() => { fetchRooms(); }, []);

    const handleFetchAllocations = () => {
        if (examScheduleId) fetchAllocations(examScheduleId);
    };

    const handleAutoAllocate = async () => {
        if (!examScheduleId || selectedRoomIds.length === 0) return;
        await autoAllocate({ exam_schedule_id: examScheduleId, room_ids: selectedRoomIds });
    };

    const handleChangeSeat = async () => {
        if (!showChangeSeatModal) return;
        await changeSeat(showChangeSeatModal, changeSeatForm);
        setShowChangeSeatModal(null);
        setChangeSeatForm({ new_seat_number: '', new_room_id: '', remarks: '' });
    };

    const toggleRoomSelection = (roomId: string) => {
        setSelectedRoomIds(prev => prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]);
    };

    const totalCapacity = rooms.filter(r => selectedRoomIds.includes(r.id)).reduce((acc, r) => acc + r.capacity, 0);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Seating Allocation</h1>
                <p className="text-sm text-gray-500 mt-1">Auto-allocate and manage exam seating plans</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none">×</button>
                </div>
            )}

            {/* Control Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-semibold text-gray-800 text-lg">Auto-Allocation Engine</h2>

                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Exam Schedule ID"
                        value={examScheduleId}
                        onChange={e => setExamScheduleId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                        onClick={handleFetchAllocations}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        Load Allocations
                    </button>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Rooms for Auto-Allocation</p>
                    <div className="flex flex-wrap gap-2">
                        {rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => toggleRoomSelection(room.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    selectedRoomIds.includes(room.id)
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                                }`}
                            >
                                🚪 {room.room_number} ({room.capacity})
                            </button>
                        ))}
                        {rooms.length === 0 && <span className="text-xs text-gray-400">No rooms available. Add rooms in Venues first.</span>}
                    </div>
                    {selectedRoomIds.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">Selected: {selectedRoomIds.length} rooms · Total capacity: {totalCapacity} seats</p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleAutoAllocate}
                        disabled={!examScheduleId || selectedRoomIds.length === 0 || loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Allocating...' : '⚡ Auto-Allocate Seats'}
                    </button>
                    <button
                        onClick={() => { fetchAuditLogs(); setShowAuditPanel(!showAuditPanel); }}
                        className="border border-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                    >
                        📋 Audit Log
                    </button>
                </div>
            </div>

            {/* Allocations Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Seat Allocations ({allocations.length})</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-3 font-semibold text-gray-600">Student</th>
                            <th className="text-left px-6 py-3 font-semibold text-gray-600">Roll No.</th>
                            <th className="text-left px-6 py-3 font-semibold text-gray-600">Room</th>
                            <th className="text-left px-6 py-3 font-semibold text-gray-600">Seat No.</th>
                            <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                            <th className="text-right px-6 py-3 font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {!loading && allocations.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">No allocations loaded. Enter a schedule ID and click Load.</td></tr>
                        )}
                        {allocations.map(alloc => (
                            <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 font-medium text-gray-800">
                                    {alloc.students ? `${alloc.students.first_name} ${alloc.students.last_name}` : alloc.student_id.slice(0, 8) + '…'}
                                </td>
                                <td className="px-6 py-3 text-gray-500">{alloc.students?.roll_number || '—'}</td>
                                <td className="px-6 py-3 text-gray-600">{alloc.exam_rooms?.room_number || alloc.room_id.slice(0, 8)}</td>
                                <td className="px-6 py-3 font-mono text-gray-800">{alloc.seat_number}</td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${SEAT_STATUS_COLORS[alloc.status]}`}>
                                        {alloc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button
                                        onClick={() => setShowChangeSeatModal(alloc.id)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Change Seat
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Audit Panel */}
            {showAuditPanel && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">Seat Allocation Audit Log</h2>
                        <button onClick={() => setShowAuditPanel(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">×</button>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                        {allocationAuditLogs.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No audit events yet.</p>}
                        {allocationAuditLogs.map(log => (
                            <div key={log.id} className="px-6 py-3 text-sm flex items-center gap-4">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.action === 'CREATE' ? 'bg-green-100 text-green-700' : log.action === 'CHANGE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                                {log.old_seat && <span className="text-gray-500">{log.old_seat} → {log.new_seat}</span>}
                                {!log.old_seat && log.new_seat && <span className="text-gray-500">Allocated: {log.new_seat}</span>}
                                {log.remarks && <span className="text-gray-400 text-xs italic">"{log.remarks}"</span>}
                                <span className="text-gray-400 text-xs ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Change Seat Modal */}
            {showChangeSeatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Change Seat</h2>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="New Seat Number *" value={changeSeatForm.new_seat_number} onChange={e => setChangeSeatForm(f => ({ ...f, new_seat_number: e.target.value }))} />
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={changeSeatForm.new_room_id} onChange={e => setChangeSeatForm(f => ({ ...f, new_room_id: e.target.value }))}>
                            <option value="">Keep same room</option>
                            {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} (cap: {r.capacity})</option>)}
                        </select>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Reason/Remarks" value={changeSeatForm.remarks} onChange={e => setChangeSeatForm(f => ({ ...f, remarks: e.target.value }))} />
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowChangeSeatModal(null)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleChangeSeat} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm hover:bg-indigo-700">Confirm Change</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatingPage;

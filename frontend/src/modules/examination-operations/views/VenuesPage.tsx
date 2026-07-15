import React, { useEffect, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';
import type { ExamCenter, ExamBuilding } from '../types';

export const VenuesPage: React.FC = () => {
    const {
        centers, buildings, rooms, loading, error,
        fetchCenters, fetchBuildings, fetchRooms,
        createCenter, updateCenter, deleteCenter,
        createBuilding, updateBuilding,
        createRoom, updateRoom, deleteRoom,
        clearError
    } = useExamOperationsStore();

    const [activeTab, setActiveTab] = useState<'centers' | 'buildings' | 'rooms'>('centers');
    const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<ExamBuilding | null>(null);

    // Modals
    const [showCenterForm, setShowCenterForm] = useState(false);
    const [showBuildingForm, setShowBuildingForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);

    const [centerForm, setCenterForm] = useState({ name: '', code: '', campus: '' });
    const [buildingForm, setBuildingForm] = useState({ name: '', floors_count: 1, center_id: '' });
    const [roomForm, setRoomForm] = useState({ building_id: '', room_number: '', capacity: 30, floor_number: 0, rows_count: 5, cols_count: 6 });

    useEffect(() => { fetchCenters(); }, []);
    useEffect(() => {
        if (activeTab === 'buildings' && selectedCenter) fetchBuildings(selectedCenter.id);
        if (activeTab === 'rooms' && selectedBuilding) fetchRooms(selectedBuilding.id);
    }, [activeTab, selectedCenter, selectedBuilding]);

    const handleCreateCenter = async () => {
        if (!centerForm.name || !centerForm.code) return;
        await createCenter(centerForm);
        setCenterForm({ name: '', code: '', campus: '' });
        setShowCenterForm(false);
    };

    const handleCreateBuilding = async () => {
        if (!buildingForm.name || !buildingForm.center_id) return;
        await createBuilding(buildingForm);
        setBuildingForm({ name: '', floors_count: 1, center_id: '' });
        setShowBuildingForm(false);
    };

    const handleCreateRoom = async () => {
        if (!roomForm.building_id || !roomForm.room_number) return;
        await createRoom(roomForm);
        setRoomForm({ building_id: '', room_number: '', capacity: 30, floor_number: 0, rows_count: 5, cols_count: 6 });
        setShowRoomForm(false);
    };

    const tabs = [
        { id: 'centers', label: '🏛️ Centers' },
        { id: 'buildings', label: '🏢 Buildings' },
        { id: 'rooms', label: '🚪 Rooms' },
    ] as const;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Examination Venues</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage exam centers, buildings, and rooms</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'centers' && (
                        <button onClick={() => setShowCenterForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                            + Add Center
                        </button>
                    )}
                    {activeTab === 'buildings' && selectedCenter && (
                        <button onClick={() => { setBuildingForm(f => ({ ...f, center_id: selectedCenter.id })); setShowBuildingForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                            + Add Building
                        </button>
                    )}
                    {activeTab === 'rooms' && selectedBuilding && (
                        <button onClick={() => { setRoomForm(f => ({ ...f, building_id: selectedBuilding.id })); setShowRoomForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                            + Add Room
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none">×</button>
                </div>
            )}

            {/* Tab Bar */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CENTERS */}
            {activeTab === 'centers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading && <div className="col-span-3 text-center py-10 text-gray-400">Loading centers...</div>}
                    {!loading && centers.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-gray-400">
                            <div className="text-5xl mb-3">🏛️</div>
                            <p className="text-lg font-medium">No exam centers yet</p>
                            <p className="text-sm mt-1">Add your first exam center to get started.</p>
                        </div>
                    )}
                    {centers.map(center => (
                        <div key={center.id}
                            onClick={() => { setSelectedCenter(center); setActiveTab('buildings'); fetchBuildings(center.id); }}
                            className={`bg-white rounded-2xl border-2 cursor-pointer hover:shadow-md transition-all p-5 ${selectedCenter?.id === center.id ? 'border-indigo-500' : 'border-transparent shadow-sm'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">{center.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Code: {center.code}</p>
                                    {center.campus && <p className="text-xs text-gray-400 mt-0.5">Campus: {center.campus}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${center.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {center.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                <span>{center.exam_buildings?.length || 0} buildings</span>
                                <span>{center.exam_buildings?.reduce((acc, b) => acc + (b.exam_rooms?.length || 0), 0) || 0} rooms</span>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); deleteCenter(center.id); }}
                                className="mt-3 text-xs text-red-500 hover:text-red-700"
                            >
                                Delete center
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* BUILDINGS */}
            {activeTab === 'buildings' && (
                <>
                    {selectedCenter && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <button onClick={() => setActiveTab('centers')} className="text-indigo-600 hover:underline">Centers</button>
                            <span>›</span>
                            <span className="font-medium text-gray-800">{selectedCenter.name}</span>
                        </div>
                    )}
                    {!selectedCenter && <div className="text-center py-10 text-gray-400">Select a center first to view buildings.</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading && <div className="col-span-3 text-center py-10 text-gray-400">Loading buildings...</div>}
                        {buildings.map(building => (
                            <div key={building.id}
                                onClick={() => { setSelectedBuilding(building); setActiveTab('rooms'); fetchRooms(building.id); }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all p-5"
                            >
                                <h3 className="font-bold text-gray-900">🏢 {building.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{building.floors_count} floor(s)</p>
                                <p className="text-xs text-gray-400 mt-1">{building.exam_rooms?.length || 0} rooms</p>
                            </div>
                        ))}
                        {!loading && buildings.length === 0 && selectedCenter && (
                            <div className="col-span-3 text-center py-12 text-gray-400">
                                <div className="text-4xl mb-2">🏢</div>
                                <p>No buildings in {selectedCenter.name}</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ROOMS */}
            {activeTab === 'rooms' && (
                <>
                    {selectedBuilding && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <button onClick={() => setActiveTab('centers')} className="text-indigo-600 hover:underline">Centers</button>
                            <span>›</span>
                            <button onClick={() => { setActiveTab('buildings'); fetchBuildings(selectedCenter?.id); }} className="text-indigo-600 hover:underline">{selectedCenter?.name}</button>
                            <span>›</span>
                            <span className="font-medium text-gray-800">{selectedBuilding.name}</span>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Room</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Floor</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Capacity</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Layout</th>
                                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Accessible</th>
                                    <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading rooms...</td></tr>}
                                {!loading && rooms.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No rooms added yet.</td></tr>}
                                {rooms.map(room => (
                                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">🚪 {room.room_number}</td>
                                        <td className="px-6 py-4 text-gray-600">Floor {room.floor_number}</td>
                                        <td className="px-6 py-4 text-gray-600">{room.capacity} seats</td>
                                        <td className="px-6 py-4 text-gray-500">{room.rows_count} × {room.cols_count}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${room.accessibility_supported ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {room.accessibility_supported ? '✓ Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteRoom(room.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* MODALS */}
            {showCenterForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Add Exam Center</h2>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Center Name *" value={centerForm.name} onChange={e => setCenterForm(f => ({ ...f, name: e.target.value }))} />
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Center Code * (e.g. CEN-01)" value={centerForm.code} onChange={e => setCenterForm(f => ({ ...f, code: e.target.value }))} />
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Campus (optional)" value={centerForm.campus} onChange={e => setCenterForm(f => ({ ...f, campus: e.target.value }))} />
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowCenterForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreateCenter} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm hover:bg-indigo-700">Create Center</button>
                        </div>
                    </div>
                </div>
            )}

            {showBuildingForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Add Building</h2>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Building Name *" value={buildingForm.name} onChange={e => setBuildingForm(f => ({ ...f, name: e.target.value }))} />
                        <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Number of Floors" value={buildingForm.floors_count} onChange={e => setBuildingForm(f => ({ ...f, floors_count: +e.target.value }))} />
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowBuildingForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreateBuilding} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm hover:bg-indigo-700">Create Building</button>
                        </div>
                    </div>
                </div>
            )}

            {showRoomForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Add Room</h2>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Room Number * (e.g. A-101)" value={roomForm.room_number} onChange={e => setRoomForm(f => ({ ...f, room_number: e.target.value }))} />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Capacity *" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: +e.target.value }))} />
                            <input type="number" min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Floor No." value={roomForm.floor_number} onChange={e => setRoomForm(f => ({ ...f, floor_number: +e.target.value }))} />
                            <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Rows" value={roomForm.rows_count} onChange={e => setRoomForm(f => ({ ...f, rows_count: +e.target.value }))} />
                            <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Columns" value={roomForm.cols_count} onChange={e => setRoomForm(f => ({ ...f, cols_count: +e.target.value }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowRoomForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreateRoom} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm hover:bg-indigo-700">Create Room</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenuesPage;

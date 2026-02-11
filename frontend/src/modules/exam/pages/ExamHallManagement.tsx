import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Plus, Trash2, MapPin, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';

export const ExamHallManagement = () => {
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset } = useForm();
    const [creating, setCreating] = useState(false);

    const fetchHalls = async () => {
        try {
            const res = await apiClient.get('/exams/halls');
            setHalls(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const onSubmit = async (data: any) => {
        setCreating(true);
        try {
            await apiClient.post('/exams/halls', data);
            reset();
            fetchHalls();
        } catch (err) {
            alert("Failed to create hall");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await apiClient.delete(`/exams/halls/${id}`);
            fetchHalls();
        } catch (err) {
            alert("Failed to delete hall");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Halls</h1>

            {/* Create Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 tracking-widest uppercase">Hall Name</label>
                    <input {...register("hall_name", { required: true })} className="w-full p-2.5 border rounded-xl" placeholder="e.g. Block A - 101" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 tracking-widest uppercase">Capacity</label>
                    <input type="number" {...register("capacity", { required: true, min: 1 })} className="w-full p-2.5 border rounded-xl" placeholder="40" />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-indigo-500">Rows</label>
                    <input type="number" {...register("rows_count", { min: 1 })} defaultValue={5} className="w-full p-2.5 border border-indigo-100 bg-indigo-50/30 rounded-xl" />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 tracking-widest uppercase text-indigo-500">Cols</label>
                    <input type="number" {...register("cols_count", { min: 1 })} defaultValue={5} className="w-full p-2.5 border border-indigo-100 bg-indigo-50/30 rounded-xl" />
                </div>
                <div className="col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 tracking-widest uppercase">Location / Notes</label>
                    <input {...register("location")} className="w-full p-2.5 border rounded-xl" placeholder="First Floor" />
                </div>
                <button disabled={creating} className="bg-indigo-600 text-white h-[45px] rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 font-bold w-full">
                    <Plus className="w-5 h-5" /> <span>Add Hall</span>
                </button>
            </form>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {halls.map(hall => (
                    <div key={hall.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-xl text-gray-900">{hall.hall_name}</h3>
                                <div className="text-xs font-bold text-gray-400 uppercase mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {hall.location || 'No location info'}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(hall.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-gray-900">{hall.capacity}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Max Capacity</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Layout</div>
                                <div className="text-xs font-bold text-gray-700">{hall.rows_count || 5} × {hall.cols_count || 5} Grid</div>
                            </div>
                        </div>
                    </div>
                ))}

                {halls.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-400 italic font-medium">
                        No halls created yet.
                    </div>
                )}
            </div>
        </div>
    );
};

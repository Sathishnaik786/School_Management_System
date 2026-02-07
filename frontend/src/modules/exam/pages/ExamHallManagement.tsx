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
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Hall Name</label>
                    <input {...register("hall_name", { required: true })} className="w-full p-2 border rounded-xl" placeholder="e.g. Block A - 101" />
                </div>
                <div className="w-32">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Capacity</label>
                    <input type="number" {...register("capacity", { required: true, min: 1 })} className="w-full p-2 border rounded-xl" placeholder="40" />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Location / Notes</label>
                    <input {...register("location")} className="w-full p-2 border rounded-xl" placeholder="First Floor" />
                </div>
                <button disabled={creating} className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {halls.map(hall => (
                    <div key={hall.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{hall.hall_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Users className="w-4 h-4" /> Capacity: {hall.capacity}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin className="w-4 h-4" /> {hall.location || 'No location info'}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(hall.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

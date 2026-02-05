import { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../../lib/api-client';
import { Printer, Trash2, ChartBar, DollarSign } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { TransportFeeManager } from '../../transport/components/TransportFeeManager';

export const FeeStructureManagement = () => {
    const [view, setView] = useState<'general' | 'transport'>('general');
    const [structures, setStructures] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        fee_details: '',
        applicable_classes: '',
        payment_schedule: '',
        discount_info: ''
    });
    const [activeYear, setActiveYear] = useState<any>(null);
    const printRef = useRef(null);

    useEffect(() => {
        apiClient.get('/academic-years/current').then(res => setActiveYear(res.data));
        fetchStructures();
    }, []);

    const fetchStructures = () => {
        apiClient.get('/fees/structures').then(res => setStructures(res.data));
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Fee_Structure_${activeYear?.year_label || '2026-27'}`,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/fees/structures', {
                academic_year_id: activeYear.id,
                ...formData,
                amount: parseFloat(formData.amount)
            });
            setFormData({ name: '', amount: '', fee_details: '', applicable_classes: '', payment_schedule: '', discount_info: '' });
            fetchStructures();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await apiClient.delete(`/fees/structures/${id}`);
        fetchStructures();
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8 text-indigo-900">
                <div>
                    <h2 className="text-3xl font-extrabold flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-600" /> Fee Management
                    </h2>
                    <p className="text-gray-500 mt-1">Institutional fee charts & transport slabs</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex border border-gray-200">
                        <button
                            onClick={() => setView('general')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'general' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <ChartBar className="w-4 h-4" /> General Structure
                        </button>
                        <button
                            onClick={() => setView('transport')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'transport' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            🚌 Transport (By Stop)
                        </button>
                    </div>
                </div>
            </div>

            {view === 'transport' ? (
                <TransportFeeManager />
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-50">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-indigo-950">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm">1</span>
                            Add New Fee Entry
                        </h3>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
                            <div className="col-span-1 lg:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Fee Description</label>
                                <input className="w-full border-gray-100 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all border"
                                    placeholder="e.g. Registration Fees"
                                    value={formData.fee_details}
                                    onChange={e => setFormData({ ...formData, fee_details: e.target.value, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Classes</label>
                                <input className="w-full border-gray-100 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white border outline-none transition-all"
                                    placeholder="Nur - X"
                                    value={formData.applicable_classes}
                                    onChange={e => setFormData({ ...formData, applicable_classes: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Amount (₹)</label>
                                <input type="number" className="w-full border-gray-100 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white border outline-none transition-all font-mono font-bold"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Schedule</label>
                                <select className="w-full border-gray-100 bg-gray-50/50 p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.payment_schedule}
                                    onChange={e => setFormData({ ...formData, payment_schedule: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    <option value="One time only">One time only</option>
                                    <option value="Per month">Per month</option>
                                    <option value="Per quarter">Per quarter</option>
                                    <option value="Per annum">Per annum</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-[48px] rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center">
                                    SAVE ENTRY
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handlePrint} className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                            <Printer className="w-4 h-4" /> Download Official Chart
                        </button>
                    </div>

                    <div ref={printRef} className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-indigo-50 print:shadow-none print:border-none">
                        <div className="bg-indigo-950 text-white p-10 text-center print:bg-white print:text-black">
                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Academic Fee Structure</h1>
                            <p className="text-indigo-300 print:text-gray-500 font-medium tracking-widest uppercase text-xs">Official Schedule for Session {activeYear?.year_label}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-indigo-950 border-b border-gray-100 print:bg-white">
                                    <tr>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-xxs">Fees Description</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-xxs">Classes</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-xxs">Amount</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-xxs">Schedule</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-widest text-xxs text-center print:hidden">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {structures.map((s) => (
                                        <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-indigo-950">{s.fee_details || s.name}</td>
                                            <td className="px-8 py-5 text-gray-500 font-medium">{s.applicable_classes || '-'}</td>
                                            <td className="px-8 py-5 font-mono font-black text-indigo-900 leading-none">
                                                ₹ {Number(s.amount).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xxs font-black text-gray-500 uppercase">{s.payment_schedule || '-'}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center print:hidden">
                                                <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

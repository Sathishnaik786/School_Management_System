import React, { useState } from 'react';
import { UserPlus, Users, ClipboardList, CheckCircle } from 'lucide-react';
import KPICards from '../../components/widgets/KPICards';
import { ActionQueueWidget } from '../../components/widgets/DashboardWidgets';

export function ReceptionistDashboard() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [grade, setGrade] = useState('1');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;
        
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setName('');
            setEmail('');
            setPhone('');
        }, 2000);
    };

    const receptionistKPIs = [
        { title: 'Today\'s Walk-ins', value: 8, description: 'Registered visitors', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { title: 'Total Inquiries', value: 142, description: 'Active lead pipeline', icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
    ];

    const mockActions = [
        { id: '1', title: 'Call back Amit Kumar', description: 'Left inquiry on form 2 mins ago', status: 'urgent', time: 'Just now' },
        { id: '2', title: 'Verify Document Batch Grade 2', description: 'Awaiting copy checklist', status: 'pending', time: '1 hour ago' }
    ] as any;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Receptionist Admissions Console
            </h2>

            <KPICards cards={receptionistKPIs as any} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Walk-in log form */}
                <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1">
                        <UserPlus className="w-4 h-4 text-indigo-500" /> Log Walk-in Inquiry
                    </h3>

                    {isSuccess ? (
                        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 border border-emerald-100 text-xs font-bold animate-fadeIn">
                            <CheckCircle className="w-4 h-4" /> Inquiry registered and mapped successfully!
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4 text-xs font-medium">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Parent/Guardian Name *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter parent name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number *</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Email ID</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Applying Grade</label>
                                    <select 
                                        value={grade}
                                        onChange={e => setGrade(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    >
                                        <option value="1">Grade 1</option>
                                        <option value="2">Grade 2</option>
                                        <option value="3">Grade 3</option>
                                        <option value="4">Grade 4</option>
                                        <option value="5">Grade 5</option>
                                        <option value="6">Grade 6</option>
                                        <option value="7">Grade 7</option>
                                        <option value="8">Grade 8</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors shadow-sm"
                                >
                                    Log Lead Inquiry
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Priority Queue column */}
                <div className="space-y-6">
                    <ActionQueueWidget items={mockActions} />
                </div>
            </div>
        </div>
    );
}

export default ReceptionistDashboard;

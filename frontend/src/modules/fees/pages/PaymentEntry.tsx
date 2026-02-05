import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';

export const PaymentEntry = () => {
    const [studentId, setStudentId] = useState('');
    const [ledger, setLedger] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState('cash');
    const [ref, setRef] = useState('');
    const [loadTrigger, setLoadTrigger] = useState(0);

    useEffect(() => {
        if (!studentId) return;
        // Basic check to avoid 404 spam on incomplete UUID
        if (studentId.length > 10) {
            apiClient.get(`/fees/student/${studentId}`)
                .then(res => setLedger(res.data))
                .catch(() => setLedger(null));
        }
    }, [studentId, loadTrigger]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/fees/payments', {
                student_id: studentId,
                amount_paid: parseFloat(amount),
                payment_mode: mode,
                reference_no: ref,
                remarks: "Counter Payment"
            });
            alert("Payment Recorded");
            setAmount('');
            setRef('');
            setLoadTrigger(prev => prev + 1);
        } catch (err: any) {
            alert("Payment Failed");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-2xl font-bold mb-6">Record Payment</h2>
                <form onSubmit={handlePayment} className="bg-white p-6 rounded shadow mb-8">
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Student ID</label>
                        <input className="w-full border p-2 rounded" value={studentId} onChange={e => setStudentId(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Amount</label>
                        <input type="number" className="w-full border p-2 rounded" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Mode</label>
                        <select className="w-full border p-2 rounded" value={mode} onChange={e => setMode(e.target.value)}>
                            <option value="cash">Cash</option>
                            <option value="online">Online</option>
                            <option value="cheque">Cheque</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-1">Reference No.</label>
                        <input className="w-full border p-2 rounded" value={ref} onChange={e => setRef(e.target.value)} placeholder="Txn ID / Cheque No" />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Record Payment</button>
                </form>
            </div>

            <div>
                {ledger && (
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Student Ledger</h3>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="block text-xs text-gray-500">Total Billed</span>
                                <span className="font-bold text-lg">{ledger.summary.totalFees.toFixed(2)}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="block text-xs text-gray-500">Balance Due</span>
                                <span className={`font-bold text-lg ${ledger.summary.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {ledger.summary.balance.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <h4 className="font-bold text-xs uppercase text-gray-500 mt-4 mb-2">Assigned Fees</h4>
                        <div className="max-h-40 overflow-y-auto mb-4 border rounded p-2">
                            {ledger.fees.map((f: any) => (
                                <div key={f.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                                    <span>{f.fee_structure.name}</span>
                                    <span className="font-mono">{Number(f.assigned_amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <h4 className="font-bold text-xs uppercase text-gray-500 mt-4 mb-2">Recent Payments</h4>
                        <div className="max-h-40 overflow-y-auto border rounded p-2">
                            {ledger.payments.map((p: any) => (
                                <div key={p.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                                    <div>
                                        <div className="font-medium text-green-700">+{Number(p.amount_paid).toFixed(2)}</div>
                                        <div className="text-xs text-gray-400">{p.payment_mode} • {p.payment_date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

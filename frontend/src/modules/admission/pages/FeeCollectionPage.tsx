import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { DataTableFramework, ColumnDefinition } from '../../../components/tables/DataTableFramework';
import { CreditCard, CheckCircle, Trash2, Printer, CheckCircle2 } from 'lucide-react';

export function FeeCollectionPage() {
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [amountPaid, setAmountPaid] = useState(0);
    const [referenceNo, setReferenceNo] = useState('');

    const collectMutation = useMutation({
        mutationFn: admissionApi.collectPayment,
        onSuccess: () => {
            alert('Payment recorded successfully!');
            setSelectedAppId(null);
        },
    });

    const columns: ColumnDefinition<any>[] = [
        { key: 'student_name', header: 'Student Name' },
        { key: 'structure', header: 'Fee Structure' },
        { key: 'totalAmount', header: 'Total Fee' },
        { key: 'paidAmount', header: 'Paid Amount' },
        {
            key: 'outstanding',
            header: 'Outstanding Balance',
            render: (row: any) => (
                <span className="font-bold text-gray-900">
                    ₹{row.totalAmount - row.paidAmount}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
                <Button
                    size="sm"
                    onClick={() => { setSelectedAppId(row.id); setAmountPaid(row.totalAmount - row.paidAmount); }}
                    className="bg-primary text-white text-xs font-bold flex items-center gap-1"
                >
                    <CreditCard className="w-3.5 h-3.5" /> Collect Payment
                </Button>
            ),
        },
    ];

    const mockFees = [
        { id: 'f1', student_name: 'Tarun Saxena', structure: 'Grade 5 Standard Structure', totalAmount: 45000, paidAmount: 20000 },
        { id: 'f2', student_name: 'Anjali Shah', structure: 'Grade 1 RTE Structure', totalAmount: 0, paidAmount: 0 },
    ];

    const handleRecordPayment = () => {
        collectMutation.mutate({
            applicationId: selectedAppId,
            mode: paymentMode,
            amount: amountPaid,
            reference: referenceNo,
        });
    };

    return (
        <div className="space-y-6 pb-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Fee Collection Desk</h1>
                <p className="text-sm text-gray-500 mt-1">Assign structures, collect payments, and print receipts.</p>
            </div>

            {!selectedAppId ? (
                /* Ledgers list */
                <div>
                    <DataTableFramework
                        columns={columns}
                        data={mockFees}
                    />
                </div>
            ) : (
                /* Payment form panel */
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 max-w-md animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-sm font-black text-gray-900">Collect Payment</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Recording details for Tarun Saxena</p>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedAppId(null)}>Cancel</Button>
                    </div>

                    <div className="space-y-4">
                        {/* Mode */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Payment Mode</label>
                            <select
                                id="pages-payment-mode-select"
                                value={paymentMode}
                                onChange={e => setPaymentMode(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                            >
                                <option value="Cash">💵 Cash</option>
                                <option value="Cheque">🏦 Cheque</option>
                                <option value="UPI">📱 UPI Payment</option>
                                <option value="Card">💳 Credit/Debit Card</option>
                                <option value="Net Banking">💻 Net Banking</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Amount to Collect (INR)</label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={e => setAmountPaid(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                            />
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Transaction Ref / Cheque No</label>
                            <input
                                type="text"
                                placeholder="Ref details..."
                                value={referenceNo}
                                onChange={e => setReferenceNo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleRecordPayment}
                            className="bg-primary text-white flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Record Payment
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeeCollectionPage;

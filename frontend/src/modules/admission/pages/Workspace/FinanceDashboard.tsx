import React from 'react';
import { DollarSign, ShieldAlert, CreditCard, ShieldCheck, Download } from 'lucide-react';
import KPICards from '../../components/widgets/KPICards';
import { ActionQueueWidget } from '../../components/widgets/DashboardWidgets';

export function FinanceDashboard() {
    const financeKPIs = [
        { title: 'Fees Collected', value: '₹12,45,000', description: 'Total this term', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { title: 'Pending Receipts', value: 8, description: 'Requires validation', icon: CreditCard, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { title: 'Mismatched Ledgers', value: 1, description: 'Transaction verification error', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-100' }
    ];

    const mockActions = [
        { id: '1', title: 'Verify Rohan Sharma Fee Receipt', description: 'Receipt of ₹45,000 uploaded by parent', status: 'urgent', time: 'Just now' },
        { id: '2', title: 'Validate Bank Transfer', description: 'Preeti Deshmukh bank transfer of ₹55,000 received', status: 'pending', time: '2 hours ago' }
    ] as any;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Finance Admissions Desk Workspace
            </h2>

            <KPICards cards={financeKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                        Pending Fee Payments Ledger
                    </h3>

                    <div className="divide-y divide-gray-100 text-xs">
                        {[
                            { name: 'Rohan Sharma', code: 'APP00124', amount: '₹45,000', reference: 'TXN889249021', date: 'Yesterday' },
                            { name: 'Preeti Deshmukh', code: 'APP00142', amount: '₹55,000', reference: 'UPI200149021', date: '2 days ago' }
                        ].map((txn, idx) => (
                            <div key={idx} className="py-3.5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{txn.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{txn.code} • {txn.reference} • {txn.date}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-gray-800 dark:text-gray-200">{txn.amount}</span>
                                    <button className="p-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 flex items-center gap-0.5">
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Actions */}
                <div className="space-y-6">
                    <ActionQueueWidget items={mockActions} />
                </div>
            </div>
        </div>
    );
}

export default FinanceDashboard;

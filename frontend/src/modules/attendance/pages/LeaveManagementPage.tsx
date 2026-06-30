import { useState } from 'react';
import { useLeave } from '../hooks/useLeave';
import { LeaveCard } from '../components/leave/LeaveCard';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { PlaneTakeoff, Inbox, CheckCircle2, ShieldAlert } from 'lucide-react';

export function LeaveManagementPage() {
    const { requests, approveLeave, rejectLeave } = useLeave();
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    const handleApprove = async (id: string) => {
        try {
            await approveLeave({ id, remarks: 'Approved by principal' });
            alert('Leave request approved!');
        } catch (err) {
            console.error('Approve failed', err);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectLeave({ id, remarks: 'Insufficient reasons' });
            alert('Leave request rejected!');
        } catch (err) {
            console.error('Reject failed', err);
        }
    };

    const mockRequests = [
        { id: 'l1', student_name: 'Rahul Soni', leave_type: 'Sick Leave', start_date: '2026-07-02', end_date: '2026-07-04', reason: 'High fever and cold symptoms.', status: 'PENDING' as const },
        { id: 'l2', student_name: 'Diya Sharma', leave_type: 'Casual Leave', start_date: '2026-07-10', end_date: '2026-07-11', reason: 'Attending family marriage ceremony.', status: 'PENDING' as const },
    ];

    const activeList = requests.length > 0 ? requests : mockRequests;

    return (
        <div className="space-y-6 pb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <PlaneTakeoff className="w-8 h-8 text-indigo-600" /> Leave Management Desk
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Review student leave applications, check balances, and track approvals.</p>
                </div>
            </div>

            <div className="flex border-b border-gray-100 gap-6 text-xs font-black uppercase tracking-wider mb-4">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 border-b-2 transition-all ${
                        activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                    }`}
                >
                    Inbox Applications
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 border-b-2 transition-all ${
                        activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                    }`}
                >
                    Approval Logs
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    {activeTab === 'pending' ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {activeList.map((req: any) => (
                                <LeaveCard
                                    key={req.id}
                                    request={req as any}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="p-6 border-0 shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Archived Application Logs
                            </h3>
                            <div className="text-xs font-bold text-gray-400 italic py-6 text-center">
                                No historical entries in this register.
                            </div>
                        </Card>
                    )}
                </div>

                {/* Balances widgets */}
                <Card className="p-6 border-0 shadow-sm space-y-4 h-fit">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" /> Active School Leave Limits
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                            <span>Sick Leave (SL) Limit</span>
                            <span>12 days / yr</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                            <span>Casual Leave (CL) Limit</span>
                            <span>8 days / yr</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                            <span>Medical Leave (ML) Limit</span>
                            <span>15 days / yr</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default LeaveManagementPage;

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { DataTableFramework, ColumnDefinition } from '../../../components/tables/DataTableFramework';
import { FileText, Send, CheckCircle2, XCircle } from 'lucide-react';

export function OfferLetterPage() {
    const [cycle, setCycle] = useState('all');

    const sendMutation = useMutation({
        mutationFn: admissionApi.sendOffer,
        onSuccess: () => {
            alert('Offer Letter dispatched via email successfully!');
        },
    });

    const columns: ColumnDefinition<any>[] = [
        { key: 'student_name', header: 'Student Name' },
        { key: 'email', header: 'Parent Email' },
        { key: 'offerDate', header: 'Dispatched Date' },
        { key: 'expiry', header: 'Expiry Countdown', render: (row: any) => `${row.expiryDays} days remaining` },
        {
            key: 'status',
            header: 'Response',
            render: (row: any) => {
                const colors: Record<string, string> = {
                    Pending: 'bg-yellow-50 text-yellow-600',
                    Accepted: 'bg-green-50 text-green-600',
                    Declined: 'bg-red-50 text-red-600',
                };
                return (
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${colors[row.status]}`}>
                        {row.status}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
                <div className="flex gap-2">
                    {row.status === 'Pending' && (
                        <Button
                            size="sm"
                            onClick={() => sendMutation.mutate({ id: row.id })}
                            disabled={sendMutation.isPending}
                            className="bg-primary text-white text-xs font-bold flex items-center gap-1"
                        >
                            <Send className="w-3 h-3" /> Resend
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const mockOffers = [
        { id: 'o1', student_name: 'Tarun Saxena', email: 'tarun@mail.com', offerDate: '2026-06-25', expiryDays: 3, status: 'Pending' },
        { id: 'o2', student_name: 'Priyanka Sen', email: 'priyanka@mail.com', offerDate: '2026-06-20', expiryDays: 0, status: 'Accepted' },
    ];

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Offer Dispatch Desk</h1>
                    <p className="text-sm text-gray-500 mt-1">Review, dispatch, and track offer letter responses.</p>
                </div>
            </div>

            <div>
                <DataTableFramework
                    columns={columns}
                    data={mockOffers}
                />
            </div>
        </div>
    );
}

export default OfferLetterPage;

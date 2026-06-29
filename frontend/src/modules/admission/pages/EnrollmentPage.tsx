import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export function EnrollmentPage() {
    const queryClient = useQueryClient();
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

    const enrollMutation = useMutation({
        mutationFn: admissionApi.enrollStudent,
        onSuccess: () => {
            alert('Student enrollment successfully finalized!');
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
        },
    });

    const mockStatusList = [
        { key: 'student_master', label: 'Student Master Record', status: 'SUCCESS' },
        { key: 'user_account', label: 'Supabase User Account', status: 'SUCCESS' },
        { key: 'academic_allocation', label: 'Academic Roll & Section', status: 'SUCCESS' },
        { key: 'library', label: 'Library Access Card', status: 'FAILED' },
        { key: 'transport', label: 'Transport Route Allocation', status: 'SUCCESS' },
        { key: 'hostel', label: 'Hostel Room Assignment', status: 'SUCCESS' },
    ];

    const handleEnroll = () => {
        enrollMutation.mutate({ applicationId: selectedAppId });
    };

    const handleRetryStep = (stepKey: string) => {
        alert(`Retrying provisioning for: ${stepKey}...`);
    };

    return (
        <div className="space-y-6 pb-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Enrollment Handoff Desk</h1>
                <p className="text-sm text-gray-500 mt-1">Verify ERP provisioning systems and finalize school enrollment.</p>
            </div>

            {!selectedAppId ? (
                /* Handoff queue */
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-wide">Approved & Paid Applications</h2>
                    <div className="divide-y divide-gray-50">
                        {[
                            { id: 'app1', name: 'Nikhil Sen', grade: 'Grade 5', status: 'Ready to Enroll' },
                        ].map(app => (
                            <div key={app.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-xs font-black text-gray-900">{app.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{app.grade} · {app.status}</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedAppId(app.id)}
                                    className="bg-primary text-white text-xs font-bold"
                                >
                                    Review Handoff
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Handoff Provision checks */
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 max-w-lg">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-sm font-black text-gray-900">ERP Resource Provisioning</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Finalizing handoff for Nikhil Sen</p>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedAppId(null)}>Cancel</Button>
                    </div>

                    <div className="space-y-3">
                        {mockStatusList.map(step => (
                            <div key={step.key} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-700">{step.label}</span>
                                <div className="flex items-center gap-2">
                                    {step.status === 'SUCCESS' ? (
                                        <span className="flex items-center gap-1 text-[10px] font-black text-green-600">
                                            <CheckCircle2 className="w-4 h-4" /> SUCCESS
                                        </span>
                                    ) : (
                                        <>
                                            <span className="flex items-center gap-1 text-[10px] font-black text-red-500 mr-2">
                                                <AlertCircle className="w-4 h-4" /> FAILED
                                            </span>
                                            <button
                                                onClick={() => handleRetryStep(step.key)}
                                                className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                                                title="Retry system setup"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleEnroll}
                            disabled={enrollMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-green-100"
                        >
                            Finalize Student Enrollment
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnrollmentPage;

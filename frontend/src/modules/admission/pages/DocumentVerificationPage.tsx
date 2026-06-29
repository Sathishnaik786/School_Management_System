import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { DocumentViewer } from '../components/DocumentViewer';
import { FileText, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export function DocumentVerificationPage() {
    const queryClient = useQueryClient();
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [activeDocIndex, setActiveDocIndex] = useState(0);

    const { data: apps, isLoading: appsLoading } = useQuery({
        queryKey: ['admissions', 'review-queue'],
        queryFn: () => admissionApi.list({ status: 'submitted' }).then(res => res.data),
    });

    const { data: selectedApp, isLoading: docLoading } = useQuery({
        queryKey: ['admissions', 'detail', selectedAppId],
        queryFn: () => admissionApi.getById(selectedAppId!).then(res => res.data),
        enabled: !!selectedAppId,
    });

    const verifyMutation = useMutation({
        mutationFn: ({ id, remark }: { id: string; remark: string }) =>
            admissionApi.verifyDocs(id, remark),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'review-queue'] });
            setSelectedAppId(null);
        },
    });

    const mockApps = apps?.results || [
        { id: '1', student_name: 'Priyanka Sen', status: 'submitted' },
        { id: '2', student_name: 'Harish Rao', status: 'submitted' },
    ];

    const mockDocs = selectedApp?.admission_documents || [
        { id: 'd1', document_type: 'Birth Certificate', file_url: 'https://umvbyywkojuxnxgkuwbt.supabase.co/storage/v1/object/public/school-erp-assets/demo/birth_cert.png' },
        { id: 'd2', document_type: 'Transfer Certificate', file_url: 'https://umvbyywkojuxnxgkuwbt.supabase.co/storage/v1/object/public/school-erp-assets/demo/tc_doc.pdf' },
    ];

    const handleVerifyDecision = (status: 'approved' | 'rejected', remark: string) => {
        if (selectedAppId) {
            verifyMutation.mutate({ id: selectedAppId, remark: `${status.toUpperCase()} - ${remark}` });
        }
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center gap-4">
                {selectedAppId && (
                    <button onClick={() => setSelectedAppId(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Document Verification Center</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and approve uploaded files side-by-side.</p>
                </div>
            </div>

            {!selectedAppId ? (
                /* Application Queue */
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Verification Pending Queue
                    </h2>
                    <div className="divide-y divide-gray-50">
                        {mockApps.map((app: any) => (
                            <div key={app.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-xs font-black text-gray-900">{app.student_name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">ID: {app.id}</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => { setSelectedAppId(app.id); setActiveDocIndex(0); }}
                                    className="bg-gray-900 text-white text-xs font-bold"
                                >
                                    Verify Documents
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Document Viewer View */
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Document Selector Column */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-sm font-black text-gray-900">{selectedApp?.student_name || 'Applicant'}</h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">Please review each document type carefully</p>
                        </div>
                        <div className="space-y-2">
                            {mockDocs.map((doc, idx) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setActiveDocIndex(idx)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                                        idx === activeDocIndex ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs font-bold">{doc.document_type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Viewer Column */}
                    <div className="lg:col-span-2">
                        {mockDocs[activeDocIndex] && (
                            <DocumentViewer
                                fileUrl={mockDocs[activeDocIndex].file_url}
                                fileName={mockDocs[activeDocIndex].document_type}
                                onVerify={handleVerifyDecision}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentVerificationPage;

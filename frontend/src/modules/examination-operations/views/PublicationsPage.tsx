import React, { useEffect, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';
import type { PublicationStatus } from '../types';

const WORKFLOW_STAGES: PublicationStatus[] = [
    'EVALUATED', 'AUTO_VALIDATION', 'MODERATOR', 'EXAM_CELL', 'PRINCIPAL', 'PUBLISHED'
];

const STAGE_LABELS: Record<PublicationStatus, string> = {
    EVALUATED: 'Evaluated',
    AUTO_VALIDATION: 'Auto Validation',
    MODERATOR: 'Moderator Review',
    EXAM_CELL: 'Exam Cell',
    PRINCIPAL: 'Principal Approval',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
};

const STAGE_COLORS: Record<PublicationStatus, string> = {
    EVALUATED: 'bg-gray-100 text-gray-600 border-gray-200',
    AUTO_VALIDATION: 'bg-blue-100 text-blue-700 border-blue-200',
    MODERATOR: 'bg-amber-100 text-amber-700 border-amber-200',
    EXAM_CELL: 'bg-orange-100 text-orange-700 border-orange-200',
    PRINCIPAL: 'bg-purple-100 text-purple-700 border-purple-200',
    PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
    ARCHIVED: 'bg-gray-200 text-gray-500 border-gray-300',
};

export const PublicationsPage: React.FC = () => {
    const {
        publications, selectedPublication, loading, error,
        fetchPublications, fetchPublication, advancePublication, freezePublication, clearError
    } = useExamOperationsStore();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [comments, setComments] = useState('');
    const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'APPROVE' | 'ROLLBACK' | 'FREEZE' } | null>(null);

    useEffect(() => { fetchPublications(); }, []);
    useEffect(() => {
        if (selectedId) fetchPublication(selectedId);
    }, [selectedId]);

    const handleAction = async () => {
        if (!confirmAction) return;
        if (confirmAction.action === 'FREEZE') {
            await freezePublication(confirmAction.id);
        } else {
            await advancePublication(confirmAction.id, { action: confirmAction.action, comments });
        }
        setConfirmAction(null);
        setComments('');
        fetchPublications();
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Result Publications</h1>
                <p className="text-sm text-gray-500 mt-1">6-stage approval workflow for exam result publishing</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 font-bold text-xl leading-none">×</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Publication List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Publications</h2>
                    {loading && <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>}
                    {!loading && publications.length === 0 && (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
                            <div className="text-3xl mb-2">📊</div>
                            <p>No result publications yet.</p>
                        </div>
                    )}
                    {publications.map(pub => (
                        <button
                            key={pub.id}
                            onClick={() => setSelectedId(pub.id)}
                            className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md ${selectedId === pub.id ? 'border-indigo-500' : 'border-transparent shadow-sm'}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{pub.exams?.name || pub.exam_id.slice(0, 12) + '…'}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{pub.exams?.code}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STAGE_COLORS[pub.status]}`}>
                                        {STAGE_LABELS[pub.status]}
                                    </span>
                                    {pub.frozen && <span className="text-xs text-gray-400">🔒 Frozen</span>}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{new Date(pub.created_at).toLocaleDateString()}</p>
                        </button>
                    ))}
                </div>

                {/* Publication Detail */}
                <div className="lg:col-span-2">
                    {!selectedPublication && (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 h-full min-h-64 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="text-5xl mb-3">📋</div>
                                <p>Select a publication to manage</p>
                            </div>
                        </div>
                    )}

                    {selectedPublication && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedPublication.exams?.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Code: {selectedPublication.exams?.code}</p>
                                </div>
                                {selectedPublication.frozen && (
                                    <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full font-medium">🔒 Frozen</span>
                                )}
                            </div>

                            {/* Workflow Progress Bar */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-3">Workflow Progress</p>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {WORKFLOW_STAGES.map((stage, idx) => {
                                        const currentIdx = WORKFLOW_STAGES.indexOf(selectedPublication.status);
                                        const isDone = idx < currentIdx;
                                        const isCurrent = idx === currentIdx;
                                        return (
                                            <React.Fragment key={stage}>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isCurrent ? STAGE_COLORS[stage] + ' ring-2 ring-offset-1 ring-indigo-400' : isDone ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    {isDone ? '✓' : isCurrent ? '●' : (idx + 1).toString()}
                                                    {STAGE_LABELS[stage]}
                                                </div>
                                                {idx < WORKFLOW_STAGES.length - 1 && (
                                                    <span className={`text-gray-300 text-sm ${isDone ? 'text-green-400' : ''}`}>→</span>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Approval History */}
                            {selectedPublication.approval_history && selectedPublication.approval_history.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Approval History</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedPublication.approval_history.map(h => (
                                            <div key={h.id} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${h.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.status}</span>
                                                <span className="text-gray-600 font-medium">{STAGE_LABELS[h.stage as PublicationStatus] || h.stage}</span>
                                                {h.comments && <span className="text-gray-400 italic text-xs">"{h.comments}"</span>}
                                                <span className="text-gray-400 text-xs ml-auto">{new Date(h.created_at).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {!selectedPublication.frozen && selectedPublication.status !== 'ARCHIVED' && (
                                <div className="flex gap-3 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => setConfirmAction({ id: selectedPublication.id, action: 'ROLLBACK' })}
                                        disabled={selectedPublication.status === 'EVALUATED'}
                                        className="border border-amber-300 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors disabled:opacity-40"
                                    >
                                        ← Rollback
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction({ id: selectedPublication.id, action: 'APPROVE' })}
                                        disabled={selectedPublication.status === 'PUBLISHED'}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
                                    >
                                        {selectedPublication.status === 'PRINCIPAL' ? '🚀 Publish' : 'Advance →'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction({ id: selectedPublication.id, action: 'FREEZE' })}
                                        className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        🔒 Freeze
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 capitalize">
                            {confirmAction.action === 'FREEZE' ? '🔒 Freeze Publication' :
                             confirmAction.action === 'APPROVE' ? '✅ Advance to Next Stage' :
                             '↩ Rollback to Previous Stage'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {confirmAction.action === 'FREEZE'
                                ? 'This will lock the publication from any further changes.'
                                : 'Please add any relevant comments before confirming.'}
                        </p>
                        {confirmAction.action !== 'FREEZE' && (
                            <textarea
                                rows={3}
                                placeholder="Comments (optional)"
                                value={comments}
                                onChange={e => setComments(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                            />
                        )}
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleAction} className={`flex-1 text-white rounded-xl py-2 text-sm font-medium ${confirmAction.action === 'ROLLBACK' ? 'bg-amber-500 hover:bg-amber-600' : confirmAction.action === 'FREEZE' ? 'bg-gray-700 hover:bg-gray-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicationsPage;

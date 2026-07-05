import { UserCheck, UserMinus, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { useLeadAssignment } from '../../hooks/useLeadAssignment';
import type { Lead } from '../../types/admission.types';

interface LeadAssignmentProps {
    lead: Lead;
    counselorId?: string;
    counselorName?: string;
    onAssigned?: () => void;
}

export function LeadAssignment({ lead, counselorId, counselorName, onAssigned }: LeadAssignmentProps) {
    const { assign, reassign, unassign, changeCounselor, isAssigning } = useLeadAssignment();
    const isAssigned = !!(lead.assigned_counselor ?? lead.assigned_counselor_id);

    const handleAssign = async () => {
        if (!counselorId) return;
        try {
            if (isAssigned) {
                await changeCounselor(lead.id, counselorId);
            } else {
                await assign(lead.id, counselorId);
            }
            onAssigned?.();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnassign = async () => {
        try {
            await unassign(lead.id);
            onAssigned?.();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-500">
                {isAssigned ? lead.assigned_counselor ?? counselorName ?? 'Assigned' : 'Unassigned'}
            </span>
            {counselorId && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] gap-1"
                    onClick={handleAssign}
                    disabled={isAssigning}
                >
                    {isAssigned ? (
                        <><RefreshCw className="w-3 h-3" /> Reassign</>
                    ) : (
                        <><UserCheck className="w-3 h-3" /> Assign</>
                    )}
                </Button>
            )}
            {isAssigned && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] gap-1 text-red-600"
                    onClick={handleUnassign}
                    disabled={isAssigning}
                >
                    <UserMinus className="w-3 h-3" /> Unassign
                </Button>
            )}
        </div>
    );
}

export default LeadAssignment;

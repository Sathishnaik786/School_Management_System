import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Plus } from 'lucide-react';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { WorkflowList } from '../components/WorkflowList';
import { WorkflowCreateDialog } from '../dialogs/WorkflowCreateDialog';

export function AssessmentSettings() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null);

    const handleEditWorkflow = (workflow: any) => {
        setEditingWorkflow(workflow);
        setDialogOpen(true);
    };

    const handleCreateWorkflow = () => {
        setEditingWorkflow(null);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Assessment Platform Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure global telemetries caching, and multi-step reviews approval chains.</p>
                </div>
                <Button
                    onClick={handleCreateWorkflow}
                    className="bg-primary text-white flex items-center gap-1.5 rounded-xl text-xs font-black px-4"
                >
                    <Plus className="w-4 h-4" /> Build Workflow
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* CONFIGURATIONS PANEL */}
                <ConfigurationPanel />

                {/* WORKFLOWS LIST */}
                <WorkflowList onEdit={handleEditWorkflow} />
            </div>

            {/* DYNAMIC FORM DIALOG */}
            <WorkflowCreateDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                editingWorkflow={editingWorkflow}
            />
        </div>
    );
}

export default AssessmentSettings;

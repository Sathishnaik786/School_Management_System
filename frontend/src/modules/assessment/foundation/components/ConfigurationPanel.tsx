import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { AssessmentConfigForm } from '../forms/AssessmentConfigForm';
import { useAssessmentConfig } from '../hooks/useAssessmentConfig';
import { useToast } from '../../../../components/ui/use-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function ConfigurationPanel() {
    const { config, isLoading, updateConfig, isUpdating } = useAssessmentConfig();
    const { toast } = useToast();

    const handleSave = async (data: any) => {
        try {
            await updateConfig(data);
            toast({
                title: 'Success',
                description: 'Assessment configuration updated successfully.'
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.error || error.message || 'Failed to save configuration.'
            });
        }
    };

    if (isLoading) {
        return (
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="ml-2 text-sm text-gray-500 font-bold">Loading configuration settings...</span>
                </CardContent>
            </Card>
        );
    }

    if (!config) {
        return (
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="p-8 text-center">
                    <p className="text-sm text-gray-500 font-bold">Configuration settings could not be retrieved.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Active Platform Configurations
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                    Define maximum file upload constraints, autosave frequencies, and server telemetries checkups.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <AssessmentConfigForm
                    initialData={config}
                    onSubmit={handleSave}
                    isSaving={isUpdating}
                />
            </CardContent>
        </Card>
    );
}
export default ConfigurationPanel;

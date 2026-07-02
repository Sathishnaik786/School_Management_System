import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No Data Available',
    message = 'There are no active records in this reporting range.'
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl min-h-[250px] animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-gray-200">
                <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-gray-900 mb-1.5 uppercase tracking-wide">{title}</h3>
            <p className="text-xs text-muted-foreground max-w-sm font-medium leading-relaxed">{message}</p>
        </div>
    );
};

export default EmptyState;

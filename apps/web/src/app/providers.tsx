import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';
import { WorkspaceProvider } from '../modules/common/workspace/WorkspaceProvider';
import { MasterDataProvider } from '../modules/admission/context/MasterDataContext';

// Initialize a shared, global QueryClient with default caching policies
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes cache stale duration
            refetchOnWindowFocus: false, // Prevents aggressive background refreshes
            retry: 1, // Auto retry once before failing
        },
    },
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <WorkspaceProvider>
                    <MasterDataProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </MasterDataProvider>
                </WorkspaceProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

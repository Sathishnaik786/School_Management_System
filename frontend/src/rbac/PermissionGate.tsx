import React from 'react';

interface PermissionGateProps {
    children: React.ReactNode;
    permission: string;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ children, permission }) => {
    // TODO: Check permissions
    const hasPermission = true; // Placeholder

    if (!hasPermission) {
        return null;
    }

    return <>{children}</>;
};

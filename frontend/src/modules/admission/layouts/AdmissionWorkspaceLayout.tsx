import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdmissionMasterDataProvider } from '../context/AdmissionMasterDataContext';

export function AdmissionWorkspaceLayout() {
    return (
        <AdmissionMasterDataProvider>
            <Outlet />
        </AdmissionMasterDataProvider>
    );
}

export default AdmissionWorkspaceLayout;

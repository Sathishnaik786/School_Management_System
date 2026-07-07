import { useAuth } from '../../../context/AuthContext';

export function useFinanceAccess() {
    const { user, isAuthenticated, hasPermission, hasRole } = useAuth();

    const role = user?.roles?.[0] || null;
    const permissions = user?.permissions || [];

    const canViewStructures = isAuthenticated && (
        hasPermission('fees.structure.view') ||
        hasRole('FINANCE_OFFICER') ||
        hasRole('ACCOUNTANT') ||
        hasRole('ADMIN')
    );

    const canManageStructures = isAuthenticated && (
        hasPermission('fees.structure.manage') ||
        hasRole('FINANCE_OFFICER') ||
        hasRole('ACCOUNTANT') ||
        hasRole('ADMIN')
    );

    const canViewLedger = isAuthenticated && (
        hasPermission('fees.view') ||
        hasPermission('fees.demand.view') ||
        hasRole('FINANCE_OFFICER') ||
        hasRole('ACCOUNTANT') ||
        hasRole('ADMIN')
    );

    const canCollectPayment = isAuthenticated && (
        hasPermission('fees.payment.collect') ||
        hasRole('FINANCE_OFFICER') ||
        hasRole('ACCOUNTANT') ||
        hasRole('ADMIN')
    );

    const canGenerateReceipt = isAuthenticated && (
        hasPermission('fees.receipt.generate') ||
        hasRole('FINANCE_OFFICER') ||
        hasRole('ACCOUNTANT') ||
        hasRole('ADMIN')
    );

    const canRefund = isAuthenticated && (
        hasPermission('fees.refund.process') ||
        hasRole('FINANCE_OFFICER') ||
        hasRole('ACCOUNTANT') ||
        hasRole('ADMIN')
    );

    return {
        role,
        permissions,
        canViewStructures,
        canManageStructures,
        canViewLedger,
        canCollectPayment,
        canGenerateReceipt,
        canRefund,
    };
}

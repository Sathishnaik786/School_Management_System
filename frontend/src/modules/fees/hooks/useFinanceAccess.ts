import { useAuth } from '../../../context/AuthContext';

export function useFinanceAccess() {
    const { user, isAuthenticated, hasPermission } = useAuth();

    const role = user?.roles?.[0] || null;
    const permissions = user?.permissions || [];

    const canViewStructures = isAuthenticated && (
        hasPermission('fees.structure.view') ||
        hasPermission('fees.structure.manage')
    );

    const canManageStructures = isAuthenticated && (
        hasPermission('fees.structure.manage')
    );

    const canViewLedger = isAuthenticated && (
        hasPermission('fees.view') ||
        hasPermission('fees.demand.view')
    );

    const canCollectPayment = isAuthenticated && (
        hasPermission('fees.payment.collect')
    );

    const canGenerateReceipt = isAuthenticated && (
        hasPermission('fees.receipt.generate')
    );

    const canRefund = isAuthenticated && (
        hasPermission('fees.refund.process')
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

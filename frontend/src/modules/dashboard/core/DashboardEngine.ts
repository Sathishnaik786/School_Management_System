import { RoleResolver } from './RoleResolver';
import { DashboardRegistry } from './DashboardRegistry';
import { DashboardLayout, DashboardWidget } from '../types/dashboard.types';

export class DashboardEngine {
    public static resolveDashboard(roles: string | string[]): {
        role: string;
        layout: DashboardLayout | undefined;
        widgets: DashboardWidget[];
    } {
        const resolvedRole = RoleResolver.resolve(roles);
        const layout = DashboardRegistry.getLayout(resolvedRole);
        const widgets = DashboardRegistry.getWidgetsForRole(resolvedRole);

        return {
            role: resolvedRole,
            layout,
            widgets
        };
    }
}

export default DashboardEngine;

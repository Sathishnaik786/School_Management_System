import { apiClient } from '../../../lib/api-client';
import { DashboardCard, DashboardFilter } from '../types/dashboard.types';
import { DashboardMapper } from '../utils/dashboard.mapper';

export class AdminDashboardService {
    public static async getKPIs(filters: DashboardFilter): Promise<DashboardCard[]> {
        const response = await apiClient.get('/dashboard/admin/overview', {
            params: filters
        });
        const data = response.data;
        
        return [
            {
                id: 'admin.kpi.students',
                label: 'Total Students',
                value: DashboardMapper.safeNumber(data?.totalStudents ?? data?.students),
                format: 'number',
                subtext: 'Currently enrolled'
            },
            {
                id: 'admin.kpi.staff',
                label: 'Total Staff',
                value: DashboardMapper.safeNumber(data?.totalStaff ?? data?.staff),
                format: 'number',
                subtext: 'Active faculty roster'
            },
            {
                id: 'admin.kpi.admissions',
                label: 'New Admissions',
                value: DashboardMapper.safeNumber(data?.totalAdmissions ?? data?.pendingAdmissions),
                format: 'number',
                subtext: 'Academic year registrations'
            },
            {
                id: 'admin.kpi.exams',
                label: 'Exams Scheduled',
                value: DashboardMapper.safeNumber(data?.exams),
                format: 'number',
                subtext: 'Upcoming tests'
            },
            {
                id: 'admin.kpi.outstanding_fees',
                label: 'Outstanding Fees',
                value: DashboardMapper.safeNumber(data?.feeCollection),
                format: 'currency',
                subtext: 'Reconciled term collections'
            }
        ];
    }
}

export default AdminDashboardService;

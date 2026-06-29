import { supabase } from '../supabase';
import { notify } from '../../components/feedback/Notifications';

export const errorResponseInterceptor = async (error: any) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally
    if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const isLoginPage = window.location.pathname.includes('/login');

        if (!isLoginPage) {
            console.warn('[API] Session expired. Redirecting to login...');
            await supabase.auth.signOut();
            window.location.href = '/login?reason=expired';
        }
    }

    // Handle 403 Forbidden (RBAC violation)
    if (status === 403) {
        console.error('[API] Forbidden: Insufficient permissions');
        notify.error('Access Denied: Insufficient Permissions');
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
        console.error('[API] Internal Server Exception');
        notify.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
};
export default errorResponseInterceptor;

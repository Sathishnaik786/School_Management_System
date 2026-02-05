import axios from 'axios';
import { supabase } from './supabase';

/**
 * Production-grade API Client using Axios.
 * Automatically handles Supabase JWT injection and global error handling.
 */
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30s timeout for production reliability
});

let currentToken: string | null = null;

// Initialize token synchronously if possible (for reloads) usually async, but we set up listener immediately
supabase.auth.getSession().then(({ data }) => {
    if (data.session) currentToken = data.session.access_token;
});

// Keep token fresh
supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
        currentToken = session.access_token;
    } else {
        currentToken = null;
    }
});

/**
 * Request Interceptor
 * Dynamically gets the latest session from Supabase SDK.
 * This handles token refreshing automatically via the Supabase client.
 */
apiClient.interceptors.request.use(async (config) => {
    // 1. Use cached token if available (Fastest)
    if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
        return config;
    }

    // 2. Fallback: Try to fetch session if cache is empty (e.g. first load race condition)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            currentToken = session.access_token; // Cache it
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch (error) {
        console.error('[API] Request Interceptor Error:', error);
    }
    return config;
}, (error) => Promise.reject(error));

/**
 * Response Interceptor
 * Handles specific downstream errors centrally.
 * 401: Unauthorized/Session Expired -> Clear session and redirect.
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;

        // Handle 401 Unauthorized globally
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if we are already on the login page to avoid redirect loops
            const isLoginPage = window.location.pathname.includes('/login');

            if (!isLoginPage) {
                console.warn('[API] Session expired. Redirecting to login...');

                // Clear Supabase session locally
                await supabase.auth.signOut();

                // Use a clean redirect
                window.location.href = '/login?reason=expired';
            }
        }

        // Handle 403 Forbidden (RBAC violation)
        if (status === 403) {
            console.error('[API] Forbidden: Insufficient Permissions');
            // We don't redirect here, just log and let the component handle it or show a toast
        }

        return Promise.reject(error);
    }
);

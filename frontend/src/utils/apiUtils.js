/**
 * Auth Token & Header Utilities
 * Provides unified, cross-device JWT token management and request header generation.
 */

const TOKEN_KEY = 'reviewpedia_auth_token';

/**
 * Get JWT token from localStorage (with backward compatibility check)
 */
export const getAuthToken = () => {
    try {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token') || null;
    } catch {
        return null;
    }
};

/**
 * Save JWT token to localStorage
 */
export const setAuthToken = (token) => {
    try {
        if (typeof window === 'undefined' || !token) return;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem('token', token); // Keep legacy key in sync
    } catch (e) {
        console.warn('Could not save auth token to localStorage:', e);
    }
};

/**
 * Remove JWT token from localStorage
 */
export const removeAuthToken = () => {
    try {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('token');
    } catch (e) {
        console.warn('Could not remove auth token from localStorage:', e);
    }
};

/**
 * Returns Authorization header object if token exists
 * Example: { 'Authorization': 'Bearer <token>' }
 */
export const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Returns combined JSON Content-Type + Authorization headers
 */
export const getJsonAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
    };
};

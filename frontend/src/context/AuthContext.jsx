import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthHeaders, setAuthToken, removeAuthToken } from '../utils/apiUtils';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        // Fetch current user on mount using cookies + Authorization header fallback
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, { 
                    headers: { ...getAuthHeaders() },
                    credentials: 'include' 
                });
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                    removeAuthToken();
                }
            } catch (err) {
                console.log('Not authenticated');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [API_URL]);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            if (data.token) {
                setAuthToken(data.token);
            }
            setUser(data.user);
            return true;
        }
        throw new Error(data.error || 'Login failed');
    };

    const register = async (username, email, password) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            if (data.token) {
                setAuthToken(data.token);
            }
            setUser(data.user);
            return true;
        }
        throw new Error(data.error || 'Registration failed');
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, { 
                method: 'POST', 
                headers: { ...getAuthHeaders() },
                credentials: 'include' 
            });
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            removeAuthToken();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

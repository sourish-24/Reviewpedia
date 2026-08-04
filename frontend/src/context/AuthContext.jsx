import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        // Fetch current user on mount
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'omit' }); // Note: for full deployment, this should be 'include'
                // Let's use include directly since we set up credentials: true in cors
                const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.log('Not authenticated');
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
            // Auto login after register
            await login(email, password);
            return true;
        }
        throw new Error(data.error || 'Registration failed');
    };

    const logout = async () => {
        await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

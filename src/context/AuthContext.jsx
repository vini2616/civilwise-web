import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check for stored token on load
        const storedUser = localStorage.getItem('vini_user');
        const storedToken = localStorage.getItem('vini_token');

        if (storedUser && storedToken) {
            setCurrentUser(JSON.parse(storedUser));

            // Verify and refresh user data (background)
            api.verifyToken(storedToken).then(data => {
                if (data._id) {
                    const updatedUser = {
                        uid: data._id,
                        id: data._id,
                        email: data.email,
                        username: data.username,
                        name: data.name,
                        role: data.role || 'Owner',
                        permission: data.permission || 'view_edit',
                        modulePermissions: data.modulePermissions || {},
                        token: storedToken // Keep existing token
                    };
                    setCurrentUser(updatedUser);
                    localStorage.setItem('vini_user', JSON.stringify(updatedUser));
                } else {
                    // Token invalid or expired
                    logout();
                }
            }).catch(err => {
                console.error("Session verification failed:", err);
                // If it's a 401/403, maybe logout? For now keep local state if net error
            });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        setError('');
        try {
            const data = await api.login(username, password);
            if (data.token) {
                const user = {
                    uid: data._id, // Map _id to uid for compatibility
                    id: data._id,
                    email: data.email,
                    username: data.username, // Add username to stored user
                    name: data.name,
                    role: data.role || 'Owner', // Use role from backend
                    permission: data.permission || 'view_edit', // Use permission from backend
                    modulePermissions: data.modulePermissions || {}, // Include module permissions
                    token: data.token
                };
                setCurrentUser(user);
                localStorage.setItem('vini_user', JSON.stringify(user));
                localStorage.setItem('vini_token', data.token);
                return true;
            } else {
                setError(data.message || 'Login failed');
                return false;
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message);
            return false;
        }
    };

    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem('vini_user');
        localStorage.removeItem('vini_token');
        return true;
    };

    const signup = async (email, password) => {
        setError('');
        try {
            // Default name to "User" for now
            const data = await api.register('User', email, password);
            if (data.token) {
                const user = {
                    uid: data._id,
                    id: data._id,
                    email: data.email,
                    name: data.name,
                    role: 'Owner',
                    permission: 'full_control',
                    token: data.token
                };
                setCurrentUser(user);
                localStorage.setItem('vini_user', JSON.stringify(user));
                localStorage.setItem('vini_token', data.token);
                return true;
            } else {
                setError(data.message || 'Signup failed');
                return false;
            }
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const value = {
        currentUser,
        login,
        logout,
        signup,
        error,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

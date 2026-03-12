import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { getToken, setToken, removeToken, getCurrentUser, setCurrentUser, clearAuth } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getCurrentUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token) {
                try {
                    const response = await authAPI.getCurrentUser();
                    setUser(response.data.user);
                    setCurrentUser(response.data.user);
                } catch (error) {
                    console.error("Auth init error:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token, userData) => {
        setToken(token);
        setUser(userData);
        setCurrentUser(userData);
    };

    const logout = () => {
        removeToken();
        clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

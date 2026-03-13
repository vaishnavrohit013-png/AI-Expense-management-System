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
            const cachedUser = getCurrentUser();

            // If we have a cached user, trust it immediately and verify in background
            if (cachedUser) {
                setLoading(false);
            }

            if (token) {
                try {
                    const response = await authAPI.getCurrentUser();
                    const fetchedUser = response.data?.user || response.data?.data;
                    if (fetchedUser) {
                        setUser(fetchedUser);
                        setCurrentUser(fetchedUser);
                    }
                } catch (error) {
                    // Only force logout on 401 Unauthorized (invalid/expired token)
                    if (error.response?.status === 401) {
                        console.error("Token expired, logging out");
                        logout();
                    } else {
                        console.warn("Auth check failed (non-auth error), keeping session:", error.message);
                    }
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

import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await verifyToken();
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider 
            value={{ 
                isAuthenticated, 
                isLoading, 
                user, 
                loginUser, 
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

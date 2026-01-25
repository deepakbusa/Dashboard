import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

let healthCheckInterval = null;
let isBackendHealthy = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const healthCheckCallbacks = [];

export const onHealthStatusChange = (callback) => {
    healthCheckCallbacks.push(callback);
    return () => {
        const index = healthCheckCallbacks.indexOf(callback);
        if (index > -1) {
            healthCheckCallbacks.splice(index, 1);
        }
    };
};

const notifyHealthStatusChange = (status) => {
    isBackendHealthy = status;
    healthCheckCallbacks.forEach(callback => callback(status));
};

export const checkBackendHealth = async () => {
    try {
        const response = await axios.get(`${API_URL.replace('/api', '')}/health`, {
            timeout: 5000
        });
        
        if (response.status === 200) {
            if (!isBackendHealthy) {
                console.log('✅ Backend connection restored');
                reconnectAttempts = 0;
            }
            notifyHealthStatusChange(true);
            return true;
        }
    } catch (error) {
        if (isBackendHealthy) {
            console.error('❌ Backend health check failed:', error.message);
        }
        
        reconnectAttempts++;
        notifyHealthStatusChange(false);
        
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error(`❌ Backend unreachable after ${MAX_RECONNECT_ATTEMPTS} attempts`);
        }
        
        return false;
    }
};

export const startHealthCheck = (intervalMs = 30000) => {
    if (healthCheckInterval) {
        stopHealthCheck();
    }
    
    // Initial check
    checkBackendHealth();
    
    // Periodic checks
    healthCheckInterval = setInterval(checkBackendHealth, intervalMs);
    console.log('🏥 Backend health monitoring started');
};

export const stopHealthCheck = () => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
        console.log('🏥 Backend health monitoring stopped');
    }
};

export const isBackendConnected = () => isBackendHealthy;

export const getReconnectAttempts = () => reconnectAttempts;

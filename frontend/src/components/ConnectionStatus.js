import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { onHealthStatusChange, checkBackendHealth, getReconnectAttempts } from '../utils/healthCheck';

const ConnectionStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        // Check connection immediately
        checkBackendHealth().then(setIsConnected);

        // Subscribe to health status changes
        const unsubscribe = onHealthStatusChange((status) => {
            setIsConnected(status);
            
            // Show status indicator when connection changes
            if (!status) {
                setShowStatus(true);
            } else {
                // Hide after 3 seconds when reconnected
                setTimeout(() => setShowStatus(false), 3000);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!showStatus && isConnected) {
        return null;
    }

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
            isConnected 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white animate-pulse'
        }`}>
            {isConnected ? (
                <>
                    <Wifi className="h-5 w-5" />
                    <span className="text-sm font-medium">Connected</span>
                </>
            ) : (
                <>
                    <WifiOff className="h-5 w-5" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Connection Lost</span>
                        <span className="text-xs opacity-90">
                            Attempting to reconnect... ({getReconnectAttempts()}/5)
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default ConnectionStatus;

import React, { useState, useEffect } from 'react';
import { Activity, X, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import { getSessions, endSession, cleanupExpiredSessions } from '../services/api';

const SessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, [currentPage, statusFilter]);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            console.log('🔍 Fetching sessions...', { currentPage, statusFilter });
            const response = await getSessions(currentPage, 10, statusFilter);
            console.log('📦 Raw sessions response:', response);
            const data = response.data || response;
            console.log('📊 Parsed sessions data:', data);
            setSessions(data.sessions || []);
            setTotalPages(data.totalPages || 1);
            console.log('✅ Sessions loaded:', data.sessions?.length);
        } catch (error) {
            console.error('❌ Failed to fetch sessions:', error);
            console.error('Error response:', error.response);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to end this session?')) return;
        
        try {
            await endSession(sessionId);
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to end session');
        }
    };

    const handleCleanup = async () => {
        if (!window.confirm('Clean up all expired sessions?')) return;
        
        try {
            await cleanupExpiredSessions();
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cleanup sessions');
        }
    };

    const getStatusBadge = (session) => {
        return session.isActive ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
        ) : (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Ended</span>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Session Management</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor and control user sessions</p>
                </div>
                <button
                    onClick={handleCleanup}
                    className="flex items-center px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm sm:text-base whitespace-nowrap"
                >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Cleanup Expired
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex gap-3 sm:gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-w-[140px] flex-1 sm:flex-initial"
                    >
                        <option value="">All Sessions</option>
                        <option value="active">Active Only</option>
                        <option value="ended">Ended Only</option>
                    </select>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Session ID</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">User</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">Started</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden lg:table-cell">Last Activity</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : sessions.length > 0 ? (
                                sessions.map((session) => (
                                    <tr key={session._id} className="hover:bg-gray-50">
                                        <td className="px-3 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-900 font-mono">
                                            <span className="hidden sm:inline">{session.sessionId.slice(0, 12)}...</span>
                                            <span className="sm:hidden">{session.sessionId.slice(0, 8)}...</span>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                                            {session.username || session.userId || 'Unknown'}
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4">
                                            {getStatusBadge(session)}
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                            {session.loginAt ? new Date(session.loginAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                                            {session.lastActivityAt ? new Date(session.lastActivityAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {session.isActive && (
                                                <button
                                                    onClick={() => handleEndSession(session.sessionId)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                                    title="End Session"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No sessions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionsPage;

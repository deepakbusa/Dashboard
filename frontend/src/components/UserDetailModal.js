import React, { useState, useEffect } from 'react';
import { X, Clock, Activity, Zap, Calendar } from 'lucide-react';
import { getUserDetails } from '../services/api';

const UserDetailModal = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await getUserDetails(userId);
            const data = response.data || response;
            setUserDetails(data);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            alert('Failed to load user details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (ms) => {
        if (!ms) return '0m';
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    if (!userDetails) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">User Details</h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">{userDetails.user.userId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0 ml-2"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">User Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-xs sm:text-sm text-gray-600">Email</label>
                            <p className="text-sm font-medium break-all">{userDetails.user.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm text-gray-600">Full Name</label>
                            <p className="text-sm font-medium">{userDetails.user.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm text-gray-600">Plan</label>
                            <p className="text-sm font-medium">{userDetails.user.plan || 'Free'}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm text-gray-600">Status</label>
                            <p className="text-sm font-medium">
                                {userDetails.user.isBlocked ? 'Blocked' : userDetails.user.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm text-gray-600">Joined</label>
                            <p className="text-sm font-medium">
                                {new Date(userDetails.user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm text-gray-600">Last Login</label>
                            <p className="text-sm font-medium break-all">
                                {userDetails.user.lastLoginAt 
                                    ? new Date(userDetails.user.lastLoginAt).toLocaleString()
                                    : 'Never'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Activity Statistics</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-2">
                                {userDetails.stats.totalRequests}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-600">Total AI Requests</p>
                        </div>
                        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-green-900 mt-2">
                                {userDetails.stats.totalSessions}
                            </p>
                            <p className="text-xs sm:text-sm text-green-600">Login Count</p>
                        </div>
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-purple-900 mt-2">
                                {userDetails.stats.activeSessions}
                            </p>
                            <p className="text-xs sm:text-sm text-purple-600">Active Sessions</p>
                        </div>
                        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-yellow-900 mt-2">
                                {formatDuration(userDetails.stats.totalTimeSpent)}
                            </p>
                            <p className="text-xs sm:text-sm text-yellow-600">Total Time Spent</p>
                        </div>
                        <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-indigo-900 mt-2">
                                {userDetails.stats.gptRequests || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-indigo-600">GPT Requests</p>
                        </div>
                        <div className="bg-pink-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-pink-900 mt-2">
                                {userDetails.stats.speechRequests || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-pink-600">Speech Requests</p>
                        </div>
                    </div>
                </div>

                {/* Session History */}
                <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Session History</h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Login Time
                                        </th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Logout Time
                                        </th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Duration
                                        </th>
                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {userDetails.sessions.length > 0 ? (
                                        userDetails.sessions.map((session) => {
                                            const duration = session.logoutAt
                                                ? new Date(session.logoutAt) - new Date(session.loginAt)
                                                : Date.now() - new Date(session.loginAt);
                                            return (
                                                <tr key={session.sessionId}>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                                                        {new Date(session.loginAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                                                        {session.logoutAt
                                                            ? new Date(session.logoutAt).toLocaleString()
                                                            : 'Active'}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                                                        {formatDuration(duration)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        {session.isActive ? (
                                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                                Ended
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-3 sm:px-4 py-6 sm:py-8 text-center text-sm text-gray-500">
                                                No session history available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition text-sm sm:text-base font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;

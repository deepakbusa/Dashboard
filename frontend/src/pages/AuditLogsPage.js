import React, { useState, useEffect } from 'react';
import { Filter, FileText } from 'lucide-react';
import Pagination from '../components/Pagination';
import { getAuditLogs } from '../services/api';

const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        username: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [currentPage, filters]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await getAuditLogs(currentPage, 20, filters);
            const data = response.data || response;
            setLogs(data.logs || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setCurrentPage(1);
    };

    const getActionBadge = (action) => {
        const styles = {
            'user_login': 'bg-green-100 text-green-800',
            'user_logout': 'bg-gray-100 text-gray-800',
            'user_blocked': 'bg-red-100 text-red-800',
            'user_unblocked': 'bg-green-100 text-green-800',
            'user_created': 'bg-blue-100 text-blue-800',
            'user_deleted': 'bg-red-100 text-red-800',
            'session_ended': 'bg-yellow-100 text-yellow-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[action] || 'bg-gray-100 text-gray-800'}`}>
                {action.replace(/_/g, ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Complete audit trail of system activities</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            <Filter className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            Filter by Action
                        </label>
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Actions</option>
                            <option value="user_login">User Login</option>
                            <option value="user_logout">User Logout</option>
                            <option value="user_blocked">User Blocked</option>
                            <option value="user_unblocked">User Unblocked</option>
                            <option value="user_created">User Created</option>
                            <option value="user_deleted">User Deleted</option>
                            <option value="session_ended">Session Ended</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Search by Username
                        </label>
                        <input
                            type="text"
                            value={filters.username}
                            onChange={(e) => handleFilterChange('username', e.target.value)}
                            placeholder="Enter username..."
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilters({ action: '', username: '' });
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {log.username || 'System'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.details || 'No details available'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {log.ipAddress || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No audit logs found
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

export default AuditLogsPage;

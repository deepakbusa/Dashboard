import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle, X, Info } from 'lucide-react';
import Pagination from '../components/Pagination';
import UserDetailModal from '../components/UserDetailModal';
import { getUsers, deleteUser, blockUser, unblockUser } from '../services/api';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ userId: '', email: '', fullName: '', password: '', plan: 'free' });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, filterStatus]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            console.log('🔍 Fetching users...', { currentPage, searchTerm, filterStatus });
            const response = await getUsers(currentPage, 10, searchTerm, filterStatus);
            console.log('📦 Raw response:', response);
            const data = response.data || response;
            console.log('📊 Parsed data:', data);
            console.log('👥 Users array:', data.users);
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            console.log('✅ Users loaded:', data.users?.length);
        } catch (error) {
            console.error('❌ Failed to fetch users:', error);
            console.error('Error response:', error.response);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilter = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await deleteUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleBlock = async (userId) => {
        try {
            await blockUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to block user');
        }
    };

    const handleUnblock = async (userId) => {
        try {
            await unblockUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to unblock user');
        }
    };

    const handleAddUser = async () => {
        if (!newUser.userId || !newUser.email || !newUser.password) {
            alert('User ID, Email, and Password are required');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newUser)
            });
            if (!response.ok) throw new Error('Failed to add user');
            setShowAddUserModal(false);
            setNewUser({ userId: '', email: '', fullName: '', password: '', plan: 'free' });
            fetchUsers();
        } catch (error) {
            alert(error.message || 'Failed to add user');
        }
    };

    const getUserStatus = (user) => {
        if (user.isBlocked === true) return 'frozen';
        if (user.isActive === true) return 'active';
        return 'inactive';
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            frozen: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Manage user accounts and permissions</p>
                </div>
                <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition text-sm sm:text-base whitespace-nowrap"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={handleFilter}
                        className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[140px]"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="frozen">Frozen</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Plan</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Sessions</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Created</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
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
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-3 sm:px-4 lg:px-6 py-4">
                                            <div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{user.userId || user.username || 'N/A'}</div>
                                                <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">{user.email || 'No email'}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                                                {user.plan || 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4">
                                            {getStatusBadge(getUserStatus(user))}
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                                            {user.activeSessions || 0}
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 sm:px-4 lg:px-3 sm:px-4 lg:px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                                                <button
                                                    onClick={() => setSelectedUserId(user.userId)}
                                                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="More Info"
                                                >
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                {user.isBlocked === true ? (
                                                    <button
                                                        onClick={() => handleUnblock(user.userId)}
                                                        className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                        title="Unblock User"
                                                    >
                                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlock(user.userId)}
                                                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Block User"
                                                    >
                                                        <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user.userId)}
                                                    className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* User Detail Modal */}
            {selectedUserId && (
                <UserDetailModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                                <input
                                    type="text"
                                    value={newUser.userId}
                                    onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="user123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter password for new user"
                                    required
                                    autoComplete="new-password"
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                <select
                                    value={newUser.plan}
                                    onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="free">Free</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

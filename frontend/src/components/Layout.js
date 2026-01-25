import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Activity,
    BarChart3,
    FileText,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/sessions', icon: Activity, label: 'Sessions' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/audit', icon: FileText, label: 'Audit Logs' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } w-64 lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-primary-600">Pulse Admin</h1>
                        <p className="text-xs text-gray-500 mt-1">Control Panel</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            end={item.path === '/'}
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                                                    isActive
                                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`
                                            }
                                        >
                                            <Icon className="w-5 h-5 mr-3" />
                                            {item.label}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                {/* Top Navbar */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isSidebarOpen ? (
                                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            ) : (
                                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            )}
                        </button>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs sm:text-sm font-medium text-gray-900">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="text-right sm:hidden">
                                <p className="text-xs font-medium text-gray-900">
                                    {new Date().toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;

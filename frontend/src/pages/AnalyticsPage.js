import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDetailedAnalytics, getUserStats } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, userStatsRes] = await Promise.all([
                getDetailedAnalytics(),
                getUserStats()
            ]);
            setAnalytics(analyticsRes.data || analyticsRes);
            setUserStats(userStatsRes.data || userStatsRes);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#1d1a1aff', '#ec4899'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Detailed insights into application usage and user behavior</p>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <StatCard
                    title="Free Plan Users"
                    value={userStats?.byPlan?.find(p => p._id === 'free')?.count || 0}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Premium Users"
                    value={userStats?.byPlan?.find(p => p._id === 'premium')?.count || 0}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title="Active Status"
                    value={userStats?.byStatus?.find(s => s._id === 'active')?.count || 0}
                    icon={Activity}
                    color="green"
                />
                <StatCard
                    title="Total Requests"
                    value={analytics?.requestsByService?.reduce((sum, s) => sum + s.count, 0) || 0}
                    icon={BarChart3}
                    color="yellow"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requests by Service */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Requests by Service</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.requestsByService || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="service" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0ea5e9" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Requests by Model */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Requests by Model</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics?.requestsByModel || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ model, percent }) => `${model} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="model"
                            >
                                {(analytics?.requestsByModel || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Hourly Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Hourly Request Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.hourlyDistribution || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Growth */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userStats?.growth || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="newUsers" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Active Users */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Top Active Users</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Requests</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {analytics?.topUsers?.map((user, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.totalRequests}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

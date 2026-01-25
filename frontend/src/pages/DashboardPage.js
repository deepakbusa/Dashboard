import React, { useState, useEffect } from 'react';
import { Users, Activity, UserX, MessageSquare, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardOverview, getRecentActivity, getTopServices, getUsageTrends } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DashboardPage = () => {
    const [overview, setOverview] = useState(null);
    const [activity, setActivity] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [trends, setTrends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            console.log('🔍 Fetching dashboard data...');
            const [overviewRes, activityRes, servicesRes, trendsRes] = await Promise.all([
                getDashboardOverview(),
                getRecentActivity(10),
                getTopServices(5),
                getUsageTrends(7)
            ]);

            console.log('📊 API Responses:', {
                overview: overviewRes.data || overviewRes,
                activity: activityRes.data || activityRes,
                services: servicesRes.data || servicesRes,
                trends: trendsRes.data || trendsRes
            });

            setOverview(overviewRes.data || overviewRes);
            setActivity(activityRes.data || activityRes);
            setTopServices(servicesRes.data || servicesRes);
            setTrends(trendsRes.data || trendsRes);
            
            console.log('✓ Dashboard data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to fetch dashboard data:', error);
            console.error('Error details:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor your application's performance and user activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <StatCard
                    title="Total Users"
                    value={overview?.totalUsers || 0}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Active Users"
                    value={overview?.activeUsers || 0}
                    icon={Activity}
                    color="green"
                />
                <StatCard
                    title="Blocked Users"
                    value={overview?.blockedUsers || 0}
                    icon={UserX}
                    color="red"
                />
                <StatCard
                    title="Active Sessions"
                    value={overview?.activeSessions || 0}
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            {/* Model Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 sm:p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm sm:text-base font-semibold text-blue-900">OpenAI GPT Requests</h3>
                        <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{overview?.gptRequests || 0}</p>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">Total GPT model requests</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-4 sm:p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm sm:text-base font-semibold text-purple-900">Azure Speech Requests</h3>
                        <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">{overview?.speechRequests || 0}</p>
                    <p className="text-xs sm:text-sm text-purple-700 mt-1">Total speech transcriptions</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Usage Trends */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Usage Trends (7 Days)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="requests" stroke="#0ea5e9" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Models */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Usage</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topServices}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="service" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0ea5e9" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {activity.length > 0 ? (
                        activity.map((item, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            User: {item.username || item.userId || 'Unknown'} • {item.details || 'No details'}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No recent activity
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

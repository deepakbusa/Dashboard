import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;


import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;

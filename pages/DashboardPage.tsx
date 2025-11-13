
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import UserManagementView from '../components/UserManagementView';
import ReportsPage from './ReportsPage';

type Tab = 'users' | 'reports';

const DashboardPage: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('users');

    const navItems = [
        { id: 'users', label: t('users') },
        { id: 'reports', label: t('reports') },
        // Add more tabs here as needed
        // { id: 'applications', label: t('applications') },
        // { id: 'administration', label: t('administration') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`${
                                        activeTab === item.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    
                    {/* Content for the active tab */}
                    <div>
                        {activeTab === 'users' && <UserManagementView />}
                        {activeTab === 'reports' && <ReportsPage />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;

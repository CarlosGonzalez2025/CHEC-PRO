import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface PaginationProps {
    currentPage: number;
    totalUsers: number;
    usersPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalUsers, usersPerPage, onPageChange }) => {
    const { t } = useLanguage();
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const startUser = (currentPage - 1) * usersPerPage + 1;
    const endUser = Math.min(currentPage * usersPerPage, totalUsers);

    return (
        <div className="px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-400">
                {t('showing')} <span className="font-medium">{startUser}</span> {t('to')} <span className="font-medium">{endUser}</span> {t('of')} <span className="font-medium">{totalUsers}</span> {t('results')}
            </div>
            <div className="flex-1 flex justify-end">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                    {t('previous')}
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                    {t('next')}
                </button>
            </div>
        </div>
    );
};

export default Pagination;

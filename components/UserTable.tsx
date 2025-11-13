import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Profile } from '../types';
// Fix: Import translations to be used in type casting for role translation keys.
import { translations } from '../lib/translations';

interface UserTableProps {
    users: Profile[];
    loading: boolean;
    onEdit: (user: Profile) => void;
    onDelete: (user: Profile) => void;
    isAdmin: boolean;
}

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
        <td className="p-4 hidden md:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
        <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
        <td className="p-4 hidden md:table-cell"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
        <td className="p-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
    </tr>
)

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit, onDelete, isAdmin }) => {
    const { t } = useLanguage();

    const formatDate = (dateString?: string) => {
        if (!dateString) return t('never');
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {/* ... table head ... */}
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                    </tbody>
                </table>
            </div>
        )
    }

    if (users.length === 0) {
        return <p className="p-6 text-center text-gray-500 dark:text-gray-400">{t('noUsersFound')}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('userName')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('userRole')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">{t('userCompany')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('lastLogin')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                        {isAdmin && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">{t(user.role as keyof typeof translations.es)}</td>
                            <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-500 dark:text-gray-400">{user.company}</td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">{formatDate(user.last_sign_in_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_active ? t('active') : t('inactive')}
                                </span>
                            </td>
                            {isAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">{t('edit')}</button>
                                        <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">{t('delete')}</button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StatCard from './StatCard';
import UserModal from './UserModal';
import ConfirmationModal from './ConfirmationModal';
import { fetchUsers, updateUser, deleteUser, logToActionScript, adminCreateUser } from '../services/api';
import { Profile, Role, CreateUserData, UpdateUserData, TranslationKey } from '../types';
import { showToast } from './Toast';
import UserTable from './UserTable';
import Pagination from './Pagination';
import { APP_CONFIG } from '../constants';
// Fix: Import translations to use its type for correct casting in `t` function calls.
import { translations } from '../lib/translations';

const USERS_PER_PAGE = APP_CONFIG.USERS_PER_PAGE;

// Iconos como componentes
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const UserManagementView: React.FC = () => {
    const { isAdmin, user: currentUser } = useAuth();
    const { t } = useLanguage();
    
    // Estados principales
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados de modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<Profile | null>(null);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Cargar usuarios
    const loadUsers = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        
        try {
            const userList = await fetchUsers();
            setUsers(userList);
            if (isRefresh) {
                showToast(t('dataRefreshed'), 'success');
            }
        } catch (error: any) {
            console.error("Error fetching users:", error.message);
            const knownKeys: TranslationKey[] = ['databaseFunctionError', 'permissionDenied', 'supabaseAmbiguousIdError'];
            const message = knownKeys.includes(error.message as TranslationKey) 
                ? t(error.message as TranslationKey)
                : `${t('fetchUsersError')}: ${error.message}`;
                
            showToast(message, 'error');
            setUsers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);
    
    // Manejar guardado de usuario
    const handleSaveUser = async (userData: CreateUserData | UpdateUserData) => {
        if (!currentUser?.email) return;

        try {
            if (editingUser) {
                const updatedUser = await updateUser(editingUser.id, userData as UpdateUserData);
                await logToActionScript('UPDATE_USER', currentUser.email, { userId: updatedUser.id, updates: Object.keys(userData) });
                showToast(t('userUpdated'), 'success');
            } else {
                const newUser = await adminCreateUser(userData as CreateUserData);
                await logToActionScript('CREATE_USER', currentUser.email, { userId: newUser.id, email: newUser.email });
                showToast(t('userCreated'), 'success');
            }
            setIsModalOpen(false);
            setEditingUser(null);
            loadUsers();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };
    
    // Manejar eliminación de usuario
    const confirmDeleteUser = async () => {
        if (userToDelete && currentUser?.email) {
            try {
                await deleteUser(userToDelete.id);
                await logToActionScript('DELETE_USER', currentUser.email, { userId: userToDelete.id, email: userToDelete.email });
                showToast(t('userDeleted'), 'success');
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                loadUsers();
            } catch (error: any) {
                showToast(`${t('userDeleteError')}: ${error.message}`, 'error');
            }
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: Profile) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (user: Profile) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };
    
    // Empresas y filtros
    const uniqueCompanies = useMemo(() => ['all', ...Array.from(new Set(users.map(u => u.company).filter(Boolean)))], [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (roleFilter === 'all' || user.role === roleFilter) &&
            (companyFilter === 'all' || user.company === companyFilter) &&
            (statusFilter === 'all' || (statusFilter === 'active' ? user.is_active : !user.is_active))
        );
    }, [users, searchTerm, roleFilter, companyFilter, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, companyFilter, statusFilter]);
    
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const statistics = useMemo(() => {
        const roleDist = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<Role, number>);
        
        const topRoles = Object.entries(roleDist).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([role, count]) => `${t(role as keyof typeof translations.es)}: ${count}`).join(', ');

        return {
            total: users.length,
            active: users.filter(u => u.is_active).length,
            roleDistribution: topRoles || t('noDataFound')
        };
    }, [users, t]);

    const availableRoles: Role[] = ['admin', 'coordinator', 'sst_specialist', 'nurse', 'employee'];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<UsersIcon />} title={t('totalUsers')} value={statistics.total.toString()} />
                <StatCard icon={<UsersIcon />} title={t('activeUsers')} value={statistics.active.toString()} />
                <StatCard icon={<ChartBarIcon />} title={t('roleDistribution')} value={statistics.roleDistribution} />
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <h2 className="text-2xl font-bold">{t('users')}</h2>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                            <input
                                type="text"
                                placeholder={t('searchUsers')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                            />
                             <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | 'all')} className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                                <option value="all">{t('allRoles')}</option>
                                {availableRoles.map(role => <option key={role} value={role}>{t(role as keyof typeof translations.es)}</option>)}
                            </select>
                            <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                                {uniqueCompanies.map(company => <option key={company} value={company}>{company === 'all' ? t('allCompanies') : company}</option>)}
                            </select>
                            <button onClick={() => loadUsers(true)} disabled={refreshing} className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"><RefreshIcon /></button>
                            {isAdmin && (
                                <button onClick={handleAddUser} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                                    {t('addUser')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <UserTable 
                    users={paginatedUsers} 
                    loading={loading} 
                    onEdit={handleEditUser} 
                    onDelete={handleDeleteUser} 
                    isAdmin={isAdmin} 
                />
                
                <Pagination 
                    currentPage={currentPage}
                    totalUsers={filteredUsers.length}
                    usersPerPage={USERS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
            
            {isModalOpen && (
                <UserModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} onSave={handleSaveUser} user={editingUser} />
            )}
            
            {isDeleteModalOpen && userToDelete && (
                <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteUser} title={t('confirmDelete')} message={t('confirmDeleteMessage', { userName: userToDelete.name })} />
            )}
        </>
    );
};

export default UserManagementView;
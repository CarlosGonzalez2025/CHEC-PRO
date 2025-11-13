import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Profile, Role } from '../types';
// Fix: Import translations to be used in type casting for role translation keys.
import { translations } from '../lib/translations';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    user: Profile | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee' as Role,
        company: '',
        department: '',
        phone: '',
    });
    
    const [errors, setErrors] = useState<any>({});
    
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                role: user.role || 'employee',
                company: user.company || '',
                department: user.department || '',
                phone: user.phone || '',
            });
        } else {
             setFormData({
                name: '',
                email: '',
                password: '',
                role: 'employee' as Role,
                company: '',
                department: '',
                phone: '',
            });
        }
        setErrors({});
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const validate = () => {
        const newErrors: any = {};
        if (!formData.name) newErrors.name = t('required');
        if (!formData.email) newErrors.email = t('required');
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('invalidEmail');
        
        if (!user && !formData.password) newErrors.password = t('required');
        if (!user && formData.password && formData.password.length < 6) newErrors.password = t('passwordMinLength');
        if (user && formData.password && formData.password.length > 0 && formData.password.length < 6) newErrors.password = t('passwordMinLength');
        
        if (!formData.company) newErrors.company = t('required');
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const dataToSave = { ...formData };
            if (user) { // If editing, don't send email or empty password
                delete (dataToSave as any).email;
                if (!dataToSave.password) {
                   delete (dataToSave as any).password;
                }
            }
            onSave(dataToSave);
        }
    };
    
    const roles: Role[] = ['admin', 'coordinator', 'sst_specialist', 'nurse', 'employee'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {user ? t('editUser') : t('addUser')}
                    </h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('userName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${errors.name ? 'border-red-500' : ''}`} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('userEmail')}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!user} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-600 ${errors.email ? 'border-red-500' : ''}`} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={user ? "Leave blank to keep same" : ""} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${errors.password ? 'border-red-500' : ''}`} />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('userRole')}</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                                {roles.map(r => <option key={r} value={r}>{t(r as keyof typeof translations.es)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('userCompany')}</label>
                            <input type="text" name="company" value={formData.company} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${errors.company ? 'border-red-500' : ''}`} />
                            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('userDepartment')}</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('userPhone')}</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
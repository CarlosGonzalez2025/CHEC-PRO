import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { logToActionScript } from '../services/api';
import { showToast } from '../components/Toast';

const LoginPage: React.FC = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }
            
            // Fix: Use correct translation key 'loginSuccessful'
            showToast(t('loginSuccessful'), 'success');
            await logToActionScript('LOGIN', email, { sessionInfo: { userAgent: navigator.userAgent } });

        } catch (err: any) {
            setError(err.error_description || err.message);
            // Fix: Use correct translation key 'loginError'
            showToast(t('loginError'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=5')"}}>
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-8 md:p-12 text-white">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">UM</h1>
                        <LanguageSelector />
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-2">{t('login')}</h2>
                    <p className="text-gray-300 mb-6">Welcome back to the system.</p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">{t('password')}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                            ) : (
                                t('login')
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

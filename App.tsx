import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { ToastContainer } from './components/Toast';

const AppContent: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return session ? <DashboardPage /> : <LoginPage />;
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
          <ToastContainer />
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;

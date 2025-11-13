import React, { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastProps extends Toast {
    onDismiss: (id: number) => void;
}

const toastColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
};

const ToastMessage: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    return (
        <div className={`flex items-center justify-between p-4 mb-4 text-white rounded-lg shadow-lg ${toastColors[type]} animate-fade-in-down`}>
            <span>{message}</span>
            <button onClick={() => onDismiss(id)} className="ml-4 text-xl font-bold">&times;</button>
        </div>
    );
};

let toastCount = 0;
let toasts: Toast[] = [];
let listeners: React.Dispatch<React.SetStateAction<Toast[]>>[] = [];

const ToastContainer: React.FC = () => {
    const [localToasts, setLocalToasts] = useState(toasts);

    useEffect(() => {
        listeners.push(setLocalToasts);
        return () => {
            listeners = listeners.filter(l => l !== setLocalToasts);
        };
    }, []);

    const handleDismiss = useCallback((id: number) => {
        toasts = toasts.filter(t => t.id !== id);
        listeners.forEach(l => l(toasts));
    }, []);

    return (
        <div className="fixed top-5 right-5 z-50 w-full max-w-xs">
            {localToasts.map(toast => (
                <ToastMessage key={toast.id} {...toast} onDismiss={handleDismiss} />
            ))}
        </div>
    );
};

const showToast = (message: string, type: ToastType = 'info') => {
    const newToast = { id: toastCount++, message, type };
    toasts = [newToast, ...toasts];
    listeners.forEach(l => l(toasts));
};

export { ToastContainer, showToast };

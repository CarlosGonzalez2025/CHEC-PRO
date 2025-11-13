import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchReports, logToActionScript } from '../services/api';
import { Report, TranslationKey } from '../types';
import { showToast } from '../components/Toast';
// Fix: Import StatCard component to be used for displaying statistics.
import StatCard from '../components/StatCard';

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
        <td className="p-4 hidden md:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
        <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div></td>
        <td className="p-4 hidden md:table-cell"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
        <td className="p-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
        <td className="p-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
    </tr>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <tr>
        <td colSpan={6} className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{message}</p>
            </div>
        </td>
    </tr>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const ReportsPage: React.FC = () => {
    const { t, language } = useLanguage();
    const { user: currentUser } = useAuth();
    
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [resultFilter, setResultFilter] = useState<'all' | 'acceptable' | 'not_acceptable'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'closed' | 'pending'>('all');
    const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');

    const loadReports = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const data = await fetchReports();
            setReports(data);
            if (isRefresh) showToast(t('reportsRefreshed'), 'success');
            if (currentUser?.email) {
                 await logToActionScript('VIEW_REPORTS', currentUser.email, { reportCount: data.length });
            }
        } catch (err: any) {
            const errorMessage = err.message === 'appsScriptCorsError'
                ? t('appsScriptCorsError')
                : `${t('fetchReportsError')}: ${err.message}`;
            
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setReports([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t, currentUser]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                report['Centro de trabajo 地点']?.toLowerCase().includes(searchLower) ||
                report['Proceso/tarea verificada 流程/任务已验证']?.toLowerCase().includes(searchLower);

            const isAcceptable = report['Resultado Final 底線'] === 'ACEPTABLE 可接受';
            const matchesResult = resultFilter === 'all' ||
                (resultFilter === 'acceptable' && isAcceptable) ||
                (resultFilter === 'not_acceptable' && !isAcceptable);

            const isClosed = report['Estado del cierre'] === 'CERRADO';
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'closed' && isClosed) ||
                (statusFilter === 'pending' && !isClosed);

            let matchesDate = true;
            if (dateRange !== 'all') {
                const reportDateStr = report['Fecha de verificación 验证日期'].split(' ')[0];
                const [day, month, year] = reportDateStr.split('/');
                const reportDate = new Date(`${year}-${month}-${day}`);
                const now = new Date();
                
                let startDate = new Date();
                if (dateRange === 'week') startDate.setDate(now.getDate() - 7);
                if (dateRange === 'month') startDate.setMonth(now.getMonth() - 1);
                if (dateRange === 'quarter') startDate.setMonth(now.getMonth() - 3);
                
                matchesDate = reportDate >= startDate;
            }

            return matchesSearch && matchesResult && matchesStatus && matchesDate;
        });
    }, [reports, searchTerm, resultFilter, statusFilter, dateRange]);

    const statistics = useMemo(() => {
        const total = filteredReports.length;
        const acceptable = filteredReports.filter(r => r['Resultado Final 底線'] === 'ACEPTABLE 可接受').length;
        const closed = filteredReports.filter(r => r['Estado del cierre'] === 'CERRADO').length;
        return {
            total,
            acceptable,
            notAcceptable: total - acceptable,
            closed,
            pending: total - closed,
            acceptablePercentage: total > 0 ? Math.round((acceptable / total) * 100) : 0,
            closedPercentage: total > 0 ? Math.round((closed / total) * 100) : 0
        };
    }, [filteredReports]);

    const renderBadge = (text: string, type: 'success' | 'danger' | 'info' | 'warning') => {
        const colors = {
            success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[type]}`}>{text}</span>;
    };
    
    const formatDate = (dateString: string) => {
        try {
            const [datePart] = dateString.split(' ');
            const [day, month, year] = datePart.split('/');
            return new Date(`${year}-${month}-${day}`).toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return dateString; }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<div className="text-xl">📊</div>} title={t('totalReports')} value={statistics.total.toString()} />
                <StatCard icon={<div className="text-xl">👍</div>} title={t('acceptableReports')} value={`${statistics.acceptable} (${statistics.acceptablePercentage}%)`} />
                <StatCard icon={<div className="text-xl">👎</div>} title={t('notAcceptableReports')} value={`${statistics.notAcceptable} (${100-statistics.acceptablePercentage}%)`} />
                <StatCard icon={<div className="text-xl">✅</div>} title={t('closedReports')} value={`${statistics.closed} (${statistics.closedPercentage}%)`} />
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <h2 className="text-2xl font-bold">{t('reportsTitle')}</h2>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                            <input type="text" placeholder={t('searchReports')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"/>
                            <select value={resultFilter} onChange={e => setResultFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 w-full sm:w-auto">
                                <option value="all">{t('allResults')}</option>
                                <option value="acceptable">{t('acceptable')}</option>
                                <option value="not_acceptable">{t('notAcceptable')}</option>
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 w-full sm:w-auto">
                                <option value="all">{t('allStatuses')}</option>
                                <option value="closed">{t('closed')}</option>
                                <option value="pending">{t('pending')}</option>
                            </select>
                            <select value={dateRange} onChange={e => setDateRange(e.target.value as any)} className="px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 w-full sm:w-auto">
                                <option value="all">{t('allDates')}</option>
                                <option value="week">{t('lastWeek')}</option>
                                <option value="month">{t('lastMonth')}</option>
                                <option value="quarter">{t('lastQuarter')}</option>
                            </select>
                            <button onClick={() => loadReports(true)} disabled={refreshing} className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"><RefreshIcon /></button>
                        </div>
                    </div>
                    {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error} <button onClick={() => loadReports()} className="underline">{t('retryLoad')}</button></div>}
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('verificationDate')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase hidden md:table-cell">{t('workCenter')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase hidden lg:table-cell">{t('taskVerified')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('finalResult')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('closureStatus')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <tr key={report.ID}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(report['Fecha de verificación 验证日期'])}</td>
                                        <td className="px-6 py-4 hidden md:table-cell text-sm max-w-xs truncate">{report['Centro de trabajo 地点']}</td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm max-w-xs truncate">{report['Proceso/tarea verificada 流程/任务已验证']}</td>
                                        <td className="px-6 py-4">{renderBadge(report['Resultado Final 底線'] === 'ACEPTABLE 可接受' ? t('acceptable') : t('notAcceptable'), report['Resultado Final 底線'] === 'ACEPTABLE 可接受' ? 'success' : 'danger')}</td>
                                        <td className="px-6 py-4">{renderBadge(report['Estado del cierre'] === 'CERRADO' ? t('closed') : t('pending'), report['Estado del cierre'] === 'CERRADO' ? 'info' : 'warning')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={report['Link_PDF 連結_PDF']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('viewPdf')}</a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <EmptyState message={error ? t('errorLoadingReports') : t('noReportsFound')} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ReportsPage;
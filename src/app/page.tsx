'use client';

import { useState, useEffect } from 'react';
import { ProtectedPage } from '../components/ProtectedPage';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import useSWR from 'swr';
import { Api } from '../lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('Dashboard: user=', user, 'token=', token ? 'present' : 'missing');
  }, [user, token]);

  const { data: dashboardResponse, error } = useSWR(
    token ? ['taskStats', token, startDate, endDate] : null,
    ([_, t, start, end]) => {
      console.log('Fetching task stats with token:', t ? 'present' : 'missing');
      return Api.getTaskStats(t, start, end);
    }
  );

  // Debug logging for API response
  useEffect(() => {
    if (dashboardResponse) {
      console.log('Dashboard response:', dashboardResponse);
      console.log('byStatus:', dashboardResponse.byStatus);
      console.log('totals:', dashboardResponse.totals);
    }
    if (error) {
      console.error('Dashboard error:', error);
    }
  }, [dashboardResponse, error]);

  // Convert the new API response format to the expected format
  // Backend returns: { byStatus: [{status, count, totalHours}, ...], totals: {total, completed, overdue, completionRate} }
  const byStatus = dashboardResponse?.byStatus || [];
  const totals = dashboardResponse?.totals || { total: 0, completed: 0, overdue: 0, completionRate: 0 };
  
  // Convert byStatus array to globalStats object
  const globalStats = {
    total: totals.total || 0,
    pending: byStatus.find(s => s.status === 'pending')?.count || 0,
    processing: byStatus.find(s => s.status === 'processing')?.count || 0,
    qa: byStatus.find(s => s.status === 'qa')?.count || 0,
    completed: totals.completed || 0, // Use totals.completed instead of byStatus
    canceled: byStatus.find(s => s.status === 'canceled')?.count || 0,
  };
  
  console.log('Processed globalStats:', globalStats);

  const statItems = [
    { label: 'Total Tasks', value: globalStats.total, color: 'text-blue-400' },
    { label: 'Pending', value: globalStats.pending, color: 'text-yellow-400' },
    { label: 'In Progress', value: globalStats.processing, color: 'text-purple-400' },
    { label: 'QA', value: globalStats.qa, color: 'text-teal-400' },
    { label: 'Completed', value: globalStats.completed, color: 'text-green-400' },
    { label: 'Canceled', value: globalStats.canceled, color: 'text-red-400' },
  ];

  return (
    <ProtectedPage>
      <DashboardLayout>
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

        {/* Date Range Filter */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <label className="text-sm text-slate-300 flex items-center gap-2">
            Start Date:
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </label>
          <label className="text-sm text-slate-300 flex items-center gap-2">
            End Date:
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </label>
        </div>

        {/* Overall Task Summary */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 mb-6">
          <p className="text-xl font-semibold text-white mb-4">Overall Task Summary</p>
          
          {error ? (
            <div className="text-rose-400 text-center py-8">
              Failed to load task statistics: {error.message}
            </div>
          ) : !dashboardResponse ? (
            <div className="text-slate-400 text-center py-8">
              {token ? 'Loading overall task statistics...' : 'Please log in to see task statistics'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statItems.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/5 bg-slate-900/40 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{item.label}</p>
                  <p className={`text-2xl font-semibold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Per-User Task Stats - Temporarily disabled as new API doesn't return user stats */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 mb-6">
          <p className="text-xl font-semibold text-white mb-4">Team Member Task Breakdown</p>
          <div className="text-slate-500 text-center py-8 italic">
            User task breakdown is not available in the current API version. 
            <br />
            <span className="text-sm">The new API returns task statistics by status only.</span>
          </div>
        </section>
        
        <div className="text-sm text-slate-400 text-center py-4">
          <p>Need to review your details? Head to your profile page.</p>
          <Link href="/profile" className="text-rose-300 hover:text-rose-200 mt-1 block">
            Go to profile →
          </Link>
        </div>

      </DashboardLayout>
    </ProtectedPage>
  );
}

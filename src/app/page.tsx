'use client';

import Link from 'next/link';
import { ProtectedPage } from '../components/ProtectedPage';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import useSWR from 'swr';
import { Api } from '../lib/api';

export default function DashboardPage() {
  const { user, token } = useAuth();

  const { data: taskStats, error } = useSWR(
    token ? ['taskStats', token] : null,
    ([_, t]) => Api.getTaskStats(t)
  );

  const statItems = [
    { label: 'Total Tasks', value: taskStats?.total || 0, color: 'text-blue-400' },
    { label: 'Pending', value: taskStats?.pending || 0, color: 'text-yellow-400' },
    { label: 'In Progress', value: taskStats?.processing || 0, color: 'text-purple-400' },
    { label: 'QA', value: taskStats?.qa || 0, color: 'text-teal-400' },
    { label: 'Completed', value: taskStats?.completed || 0, color: 'text-green-400' },
    { label: 'Canceled', value: taskStats?.canceled || 0, color: 'text-red-400' },
  ];

  return (
    <ProtectedPage>
      <DashboardLayout>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 mb-6">
          <p className="text-xl font-semibold text-white mb-4">Welcome, {user?.fullName}</p>
          
          {error ? (
            <div className="text-rose-400 text-center py-8">Failed to load task statistics.</div>
          ) : !taskStats ? (
            <div className="text-slate-400 text-center py-8">Loading task statistics...</div>
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

          <div className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center">
            <p className="text-sm text-slate-400">Your personalized task dashboard will evolve here.</p>
          </div>
        </section>
        
        <div className="mt-8 text-sm text-slate-400">
          <p>Need to review your details? Head to your profile page.</p>
          <Link href="/profile" className="text-rose-300 hover:text-rose-200">
            Go to profile →
          </Link>
        </div>
      </DashboardLayout>
    </ProtectedPage>
  );
}

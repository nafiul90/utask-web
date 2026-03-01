'use client';

import Link from 'next/link';
import { ProtectedPage } from '../components/ProtectedPage';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedPage>
      <DashboardLayout>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <p className="text-xl font-semibold text-white">Welcome, {user?.fullName}</p>
          <p className="mt-2 text-slate-400">Your personalized task dashboard will appear here soon.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-3xl font-semibold text-rose-300">In progress</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
              <p className="text-3xl font-semibold text-rose-300">{user?.role}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center">
            <p className="text-sm text-slate-400">No widgets yet. Task analytics and activity will live here.</p>
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

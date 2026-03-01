'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-rose-400">
            uTask
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-rose-300">
              Dashboard
            </Link>
            <Link href="/tasks" className="hover:text-rose-300">
              Tasks
            </Link>
            <Link href="/profile" className="hover:text-rose-300">
              Profile
            </Link>
            <Avatar src={user?.profilePicture} alt={user?.fullName} size={32} />
            <button onClick={logout} className="rounded-full border border-white/10 px-3 py-1 text-xs hover:text-rose-300">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
};

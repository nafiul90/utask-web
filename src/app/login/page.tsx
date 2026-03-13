"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await Api.login(form);
      login(data);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-primary-500/10 backdrop-blur">
        <div className="space-y-2 text-center mb-6">
          <p className="text-sm uppercase tracking-[0.4em] text-primary-300">
            uTask
          </p>
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">
            Sign in to access your dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm mb-4 block">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
            />
          </label>
          <label className="space-y-2 text-sm mb-4 block">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
            />
          </label>
          {error && <p className="text-sm text-primary-300 mb-4">{error}</p>}
          <div className="form-actions pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary-500 px-4 py-2 font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

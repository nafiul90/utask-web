'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { ProtectedPage } from '../../components/ProtectedPage';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../lib/api';
import { Avatar } from '../../components/Avatar';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    jobTitle: user?.jobTitle || '',
    department: user?.department || '',
    profilePicture: user?.profilePicture || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const openModal = () => {
    setForm({
      fullName: user.fullName,
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      profilePicture: user.profilePicture || ''
    });
    setError(null);
    setIsEditing(true);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await Api.uploadProfileImage(token, file);
      setForm((prev) => ({ ...prev, profilePicture: result.path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    try {
      setSaving(true);
      const updated = await Api.updateUser(token, user.id, form);
      updateUser(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedPage>
      <DashboardLayout>
        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar src={form.profilePicture || user.profilePicture} alt={user.fullName} size={80} />
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-rose-300">Profile</p>
                <h1 className="text-3xl font-semibold text-white">{user.fullName}</h1>
                <p className="text-slate-400">{user.jobTitle || 'No title yet'}</p>
              </div>
            </div>
            <button
              onClick={openModal}
              className="self-start rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-rose-400 hover:text-rose-200"
            >
              Edit profile
            </button>
          </div>
          <dl className="space-y-4 text-sm text-slate-300">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-slate-400">Email</dt>
              <dd className="font-medium text-white">{user.email}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-slate-400">Role</dt>
              <dd className="font-medium text-white">{user.role}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-slate-400">Department</dt>
              <dd className="font-medium text-white">{user.department || '—'}</dd>
            </div>
          </dl>
        </div>

        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Update profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-400">Profile picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded-xl border border-dashed border-white/15 bg-transparent px-4 py-3 text-sm text-white"
                  />
                  {uploading && <p className="text-xs text-slate-400">Uploading…</p>}
                  <Avatar src={form.profilePicture || user.profilePicture} alt="Preview" size={96} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-400">Full name</span>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-400">Job title</span>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-400">Department</span>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                  />
                </label>
                {error && <p className="text-sm text-rose-300">{error}</p>}
                <div className="form-actions flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-rose-500/30 hover:bg-rose-400 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedPage>
  );
}

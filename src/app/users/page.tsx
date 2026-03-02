'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ProtectedPage } from '../../components/ProtectedPage';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../lib/api';
import { Avatar } from '../../components/Avatar';
import { Trash2, Edit3, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const { data: users, error, mutate } = useSWR(token ? ['users', token] : null, ([_, t]) => Api.listUsers(t));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'employee' });
  const [loading, setLoading] = useState(false);

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (!isAdminOrManager) {
    return (
      <ProtectedPage>
        <DashboardLayout>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
            <p className="text-slate-400 mt-2">You do not have permission to view this page.</p>
          </div>
        </DashboardLayout>
      </ProtectedPage>
    );
  }

  const handleOpenModal = (userToEdit: any = null) => {
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setFormData({ 
        fullName: userToEdit.fullName, 
        email: userToEdit.email, 
        password: '', 
        role: userToEdit.role 
      });
    } else {
      setSelectedUser(null);
      setFormData({ fullName: '', email: '', password: '', role: 'employee' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await Api.request(`/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      mutate();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedUser) {
        // Update
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;
        await Api.updateUser(token!, selectedUser.id, payload);
      } else {
        // Create
        await Api.signup(formData);
      }
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-sm text-slate-400">Manage team members and roles</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-rose-500/20"
            >
              <UserPlus size={18} />
              Add User
            </button>
          </div>

          {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">Failed to load users</div>}
          
          <div className="grid gap-4 md:grid-cols-2">
            {users?.map((u: any) => (
              <div key={u.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group transition hover:border-white/10">
                <div className="flex items-center gap-4">
                  <Avatar src={u.profilePicture} alt={u.fullName} size={48} />
                  <div>
                    <h3 className="font-semibold text-white">{u.fullName}</h3>
                    <p className="text-xs text-slate-500">{u.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : 
                      u.role === 'manager' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <Edit3 size={18} />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold mb-6">{selectedUser ? 'Edit User' : 'Create New User'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
                  <input 
                    required
                    type="text" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password {selectedUser && '(leave blank to keep current)'}</span>
                  <input 
                    required={!selectedUser}
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</span>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save User'}
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

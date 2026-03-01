'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { Api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../Avatar';

type User = { id: string; fullName: string; role: string };
type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  assignee?: { _id: string; fullName: string; profilePicture?: string };
  dueDate: string;
  startDate: string;
  createdBy: { fullName: string };
};

interface TaskDetailsModalProps {
  token: string;
  taskId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskDetailsModal = ({ token, taskId, onClose, onSuccess }: TaskDetailsModalProps) => {
  const { user: currentUser } = useAuth();
  const { data: task, error, mutate } = useSWR(['task', taskId, token], ([_, id, t]) => Api.getTask(t, id));
  const { data: users } = useSWR(['users', token], ([_, t]) => Api.listUsers(t));
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Reset form when task data loads
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        assignee: task.assignee?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task, reset]);

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const onSubmit = async (data: any) => {
    if (!canEdit) return;
    try {
      setSaving(true);
      await Api.updateTask(token, taskId, {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        startDate: new Date(data.startDate).toISOString(),
      });
      onSuccess(); // Refresh parent list
      mutate(); // Refresh local data
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (!task && !error) return null; // Or loading spinner

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Task' : 'Task Details'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm text-slate-400">Title</label>
            {isEditing ? (
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
              />
            ) : (
              <p className="text-lg font-medium text-white">{task.title}</p>
            )}
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Assignee */}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Assignee</label>
              {isEditing ? (
                <select
                  {...register('assignee')}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users?.map((u: User) => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar src={task.assignee?.profilePicture} alt={task.assignee?.fullName} size={24} />
                  <span className="text-white">{task.assignee?.fullName || 'Unassigned'}</span>
                </div>
              )}
            </div>

            {/* Created By (Read Only) */}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Created By</label>
              <span className="text-white">{task.createdBy?.fullName || 'Unknown'}</span>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Start Date</label>
              {isEditing ? (
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                />
              ) : (
                <span className="text-white">{task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}</span>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  {...register('dueDate', { required: 'Due date is required' })}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                />
              ) : (
                <span className={`text-white ${new Date(task.dueDate) < new Date() ? 'text-rose-400' : ''}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm text-slate-400">Description</label>
            {isEditing ? (
              <textarea
                {...register('description')}
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
              />
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300 bg-white/5 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions flex justify-end gap-3 pt-4 border-t border-white/10">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); reset(); }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-rose-500/30 hover:bg-rose-400 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/30"
                >
                  Close
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-rose-500/30 hover:bg-rose-400"
                  >
                    Edit Task
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

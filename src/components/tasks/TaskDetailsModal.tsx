'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { Api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../Avatar';
import { FileUploader } from './FileUploader';
import { FileList } from './FileList';

type User = { id: string; fullName: string; role: string };

// Helper to format dates safely
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface TaskDetailsModalProps {
  token: string;
  taskId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskDetailsModal = ({ token, taskId, onClose, onSuccess }: TaskDetailsModalProps) => {
  const { user: currentUser } = useAuth();
  
  const { data: task, error, mutate } = useSWR(
    ['task', taskId, token], 
    ([_, id, t]) => Api.getTask(t, id),
    { revalidateOnFocus: false } 
  );
  
  const { data: users } = useSWR(['users', token], ([_, t]) => Api.listUsers(t));
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        assignee: task.assignee?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      });
      setAttachments(task.attachments || []);
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
        attachments
      });
      onSuccess();
      mutate();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setPostingComment(true);
      await Api.addComment(token, taskId, commentText);
      setCommentText('');
      mutate(); // Refresh task to show new comment
    } catch (error) {
      console.error(error);
      alert('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!task && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
      <div className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
          <h2 className="text-xl font-semibold text-white">
            {canEdit ? 'Edit Task' : 'Task Details'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">✕</button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* LEFT COLUMN: Task Details */}
          <div className="flex-1 overflow-y-auto p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            {canEdit ? (
              <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Title</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Assignee</label>
                    <select
                      {...register('assignee')}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {users?.map((u: User) => (
                        <option key={u.id} value={u.id}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Created By</label>
                    <span className="text-white block py-2">{task.createdBy?.fullName || 'Unknown'}</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Start Date</label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Due Date</label>
                    <input
                      type="date"
                      {...register('dueDate', { required: 'Due date is required' })}
                      className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">Description</label>
                  <textarea
                    {...register('description')}
                    rows={5}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Attachments</label>
                  <FileUploader token={token} onUpload={(file) => setAttachments(prev => [...prev, file])} />
                  <FileList files={attachments} onRemove={handleRemoveFile} />
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Title</label>
                  <p className="text-lg font-medium text-white">{task.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Assignee</label>
                    <div className="flex items-center gap-2">
                      <Avatar src={task.assignee?.profilePicture} alt={task.assignee?.fullName} size={24} />
                      <span className="text-white">{task.assignee?.fullName || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Created By</label>
                    <span className="text-white">{task.createdBy?.fullName || 'Unknown'}</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Start Date</label>
                    <span className="text-white">{task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Due Date</label>
                    <span className={`text-white ${new Date(task.dueDate) < new Date() ? 'text-rose-400' : ''}`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">Description</label>
                  <div className="prose prose-invert max-w-none text-slate-300 bg-white/5 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">Attachments</label>
                  {task.attachments?.length > 0 ? (
                    <FileList files={task.attachments} readOnly />
                  ) : (
                    <p className="text-sm text-slate-500">No attachments.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Comments */}
          <div className="w-full lg:w-[400px] flex flex-col bg-slate-900/30">
            <div className="p-4 border-b border-white/10 bg-slate-900/50">
              <h3 className="font-semibold text-slate-300">Comments</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {task.comments?.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">No comments yet.</p>
              )}
              
              {task.comments?.map((comment: any) => (
                <div key={comment._id} className="group flex gap-3">
                  <Avatar src={comment.author?.profilePicture} alt={comment.author?.fullName} size={32} />
                  <div className="flex-1">
                    <div className="rounded-2xl rounded-tl-none bg-white/5 p-3">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-medium text-white">{comment.author?.fullName}</span>
                        <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50">
              <form onSubmit={handlePostComment} className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-sm text-white focus:border-rose-400 focus:outline-none resize-none"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || postingComment}
                  className="absolute right-2 bottom-2 rounded-lg bg-rose-500 p-1.5 text-white shadow-lg transition hover:bg-rose-400 disabled:opacity-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Actions (Only for Edit Mode) */}
        {canEdit && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-900/50">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/30"
            >
              Cancel
            </button>
            <button
              form="task-form"
              type="submit"
              disabled={saving}
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-rose-500/30 hover:bg-rose-400 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

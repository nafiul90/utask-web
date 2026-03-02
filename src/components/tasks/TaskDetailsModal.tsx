'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { Api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../Avatar';
import { FileUploader } from './FileUploader';
import { FileList } from './FileList';
import { CommentItem } from './CommentItem';
import { LinkInput } from './LinkInput';
import { LinkList } from './LinkList';

type User = { id: string; fullName: string; role: string };

interface TaskDetailsModalProps {
  token: string;
  taskId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskDetailsModal = ({ token, taskId, onClose, onSuccess }: TaskDetailsModalProps) => {
  const { user: currentUser } = useAuth();
  
  const { data: task, error, isLoading, mutate } = useSWR(
    ['task', taskId, token], 
    ([_, id, t]) => Api.getTask(t, id),
    { revalidateOnFocus: false } 
  );
  
  const { data: users } = useSWR(['users', token], ([_, t]) => Api.listUsers(t));
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false); // State to control LinkInput form visibility
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
      setLinks(task.links || []); // Initialize links state
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
        attachments,
        links // Include links in the update payload
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
      mutate();
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

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading || error || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl max-h-[90vh] overflow-hidden flex items-center justify-center text-slate-400">
          {isLoading ? 'Loading task...' : error ? 'Failed to load task.' : 'Task not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
      <div className="w-full max-w-6xl flex flex-col rounded-2xl border border-white/10 bg-slate-950 shadow-2xl max-h-[90vh] overflow-hidden">
        
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50 shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {canEdit ? 'Edit Task' : 'Task Details'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">✕</button>
        </div>

        {/* Single Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            
            {/* Task Section */}
            <div className="flex-1 p-6 lg:border-r border-white/10 h-fit lg:min-h-full">
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
                    <FileUploader token={token} onUpload={(file) => setAttachments(prev => [...prev, file])} disabled={saving} />
                    <FileList files={attachments} onRemove={handleRemoveFile} readOnly={saving} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Links</label>
                    <LinkInput 
                      onAdd={(link) => setLinks(prev => [...prev, link])} 
                      showAddForm={showAddLinkForm}
                      onToggleAddForm={setShowAddLinkForm}
                      disabled={saving} // Disable when parent form is saving
                    />
                    <LinkList links={links} onRemove={handleRemoveLink} readOnly={saving} />
                  </div>
                </form>
              ) : (
                <div className="space-y-6 h-fit">
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

                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Links</label>
                    {task.links?.length > 0 ? (
                      <LinkList links={task.links} readOnly />
                    ) : (
                      <p className="text-sm text-slate-500">No links.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Comment Section (Right/Bottom) */}
            <div className="w-full lg:w-[400px] flex flex-col bg-slate-900/30 border-t lg:border-t-0 border-white/10">
              <div className="p-6">
                <h3 className="font-semibold text-slate-300 mb-4 uppercase tracking-wider text-xs">Comments</h3>
                
                {/* Comment Input at top of section */}
                <form onSubmit={handlePostComment} className="relative mb-6">
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

                <div className="space-y-4">
                  {task.comments?.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-4 italic">No comments yet.</p>
                  )}
                  
                  {task.comments?.slice().reverse().map((comment: any) => (
                    <CommentItem 
                      key={comment._id}
                      token={token} 
                      taskId={taskId} 
                      comment={comment} 
                      onRefresh={() => mutate()}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {canEdit && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-900/50 shrink-0">
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

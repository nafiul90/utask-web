'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ProtectedPage } from '../../components/ProtectedPage';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../lib/api';
import { TaskBoard } from '../../components/tasks/TaskBoard';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';

export default function TasksPage() {
  const { token } = useAuth();
  const { data: tasks, error, mutate } = useSWR(token ? ['tasks', token] : null, ([_, t]) => Api.listTasks(t));
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!token) return;
    
    // Optimistic update
    mutate((currentTasks: any) => {
      return currentTasks?.map((t: any) => 
        t._id === taskId ? { ...t, status: newStatus } : t
      );
    }, false);

    try {
      await Api.updateTaskStatus(token, taskId, newStatus);
      mutate(); // Revalidate to ensure server sync
    } catch (error) {
      console.error('Failed to move task', error);
      mutate(); // Revert on error
    }
  };

  return (
    <ProtectedPage>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-140px)]">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400"
            >
              New Task
            </button>
          </div>
          
          {error ? (
            <div className="text-rose-400">Failed to load tasks</div>
          ) : !tasks ? (
            <div className="text-slate-400">Loading board...</div>
          ) : (
            <TaskBoard 
              tasks={tasks} 
              onTaskClick={(task) => console.log('Open task', task)} 
              onStatusChange={handleStatusChange}
            />
          )}

          {isCreateOpen && token && (
            <TaskFormModal
              token={token}
              onClose={() => setIsCreateOpen(false)}
              onSuccess={() => mutate()}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedPage>
  );
}

'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { ProtectedPage } from '../../components/ProtectedPage';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../lib/api';
import { TaskBoard } from '../../components/tasks/TaskBoard';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { TaskDetailsModal } from '../../components/tasks/TaskDetailsModal';
import { Search, Filter, X } from 'lucide-react';

export default function TasksPage() {
  const { token, user } = useAuth();
  const { data: tasks, error, mutate } = useSWR(token ? ['tasks', token] : null, ([_, t]) => Api.listTasks(t));
  const { data: users } = useSWR(token ? ['users', token] : null, ([_, t]) => Api.listUsers(t));
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter((task: any) => {
      // Keyword search (Title or Description)
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Assignee search
      const matchesAssignee = !selectedAssignee || task.assignee?._id === selectedAssignee;

      // Date Range Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const taskDate = new Date(task.dueDate).getTime();
        if (startDate) {
          matchesDate = matchesDate && taskDate >= new Date(startDate).getTime();
        }
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && taskDate <= endDateTime.getTime();
        }
      }

      return matchesSearch && matchesAssignee && matchesDate;
    });
  }, [tasks, searchQuery, selectedAssignee, startDate, endDate]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!token) return;
    
    mutate((currentTasks: any) => {
      return currentTasks?.map((t: any) => 
        t._id === taskId ? { ...t, status: newStatus } : t
      );
    }, false);

    try {
      await Api.updateTaskStatus(token, taskId, newStatus);
      mutate();
    } catch (error) {
      console.error('Failed to move task', error);
      mutate();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('');
    setStartDate('');
    setEndDate('');
  };

  const activeFilterCount = [selectedAssignee, startDate, endDate].filter(Boolean).length;

  return (
    <ProtectedPage>
      <DashboardLayout>
        <div className="flex flex-col h-full gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Tasks</h1>
              <p className="text-sm text-slate-400">Manage and track your team workload</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
                  showFilters || activeFilterCount > 0 
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Filter size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {canCreate && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-rose-500/20"
                >
                  New Task
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search by task title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 transition shadow-inner"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-white/5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Assigned To</label>
                  <select 
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">All Members</option>
                    {users?.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Due From</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Due To</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={clearFilters}
                    className="w-full h-[38px] flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5"
                  >
                    <X size={14} />
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {error ? (
            <div className="p-10 text-center text-rose-400 bg-rose-500/5 rounded-3xl border border-rose-500/10 italic">
              Failed to load tasks. Please try again.
            </div>
          ) : !tasks ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic">
              Loading Kanban board...
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <TaskBoard 
                tasks={filteredTasks} 
                onTaskClick={(task) => setSelectedTaskId(task._id)} 
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {isCreateOpen && token && (
            <TaskFormModal
              token={token}
              onClose={() => setIsCreateOpen(false)}
              onSuccess={() => mutate()}
            />
          )}

          {selectedTaskId && token && (
            <TaskDetailsModal
              token={token}
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
              onSuccess={() => mutate()}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedPage>
  );
}

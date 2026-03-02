'use client';

import { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DraggableTaskCard } from './DraggableTaskCard';
import { DroppableColumn } from './DroppableColumn';
import { TaskCard } from './TaskCard';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../lib/api';

type Task = {
  _id: string;
  title: string;
  status: string;
  assignee?: { fullName: string; profilePicture?: string };
  dueDate: string;
  position: number; 
};

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const COLUMNS = [
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'qa', label: 'QA' },
  { id: 'completed', label: 'Completed' },
  { id: 'canceled', label: 'Canceled' }
];

export const TaskBoard = ({ tasks: initialTasks, onTaskClick, onStatusChange }: TaskBoardProps) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Synchronize local state with prop only when prop changes
  useEffect(() => {
    if (JSON.stringify(tasks) !== JSON.stringify(initialTasks)) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    COLUMNS.forEach(col => groups[col.id] = []);
    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        groups.pending.push(task); 
      }
    });
    Object.values(groups).forEach(group => {
      group.sort((a, b) => a.position - b.position);
    });
    return groups;
  }, [tasks]);

  const findColumn = (id: string) => {
    if (COLUMNS.some(col => col.id === id)) {
      return id; 
    }
    const task = tasks.find(item => item._id === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const task = tasks.find(t => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over?.id as string;

    if (!overId || activeId === overId) return;

    const activeColumnId = findColumn(activeId);
    const overColumnId = findColumn(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return; 
    }

    // Optimistic update for status change during dragOver
    setTasks(prevTasks => {
        const taskToMove = prevTasks.find(t => t._id === activeId);
        if (!taskToMove) return prevTasks;

        if (taskToMove.status !== overColumnId) {
            return prevTasks.map(t => 
                t._id === activeId ? { ...t, status: overColumnId, position: 99999 } : t // Temporarily put at end
            );
        }
        return prevTasks;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = findColumn(over.id as string);
    const initialTask = initialTasks.find(t => t._id === activeTaskId); // The task state BEFORE any dragOver changes

    if (!initialTask || !overColumnId) return;

    const oldStatus = initialTask.status;
    const newStatus = overColumnId;

    if (oldStatus !== newStatus) {
      // Case 1: Status changed (moved to a different column)
      onStatusChange(activeTaskId, newStatus); // This handles backend update and re-fetches data via SWR mutate in parent
    } else {
      // Case 2: Order changed within the same column
      const tasksInColumn = grouped[newStatus];
      const sortedUpdates = tasksInColumn.map((task, index) => ({
        taskId: task._id,
        position: index,
        status: newStatus,
      }));

      if (token && sortedUpdates.length > 0) {
        try {
          await Api.reorderTasks(token, sortedUpdates);
          // No need to call mutate() here, the parent will revalidate implicitly or manually.
        } catch (error) {
          console.error('Failed to reorder tasks in backend', error);
          setTasks(initialTasks); // Revert to initial state on error
          alert('Failed to save task order. Please try again.');
        }
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners}
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] w-80 shrink-0">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-semibold text-slate-300">{col.label}</h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                {grouped[col.id]?.length || 0}
              </span>
            </div>
            <DroppableColumn id={col.id} items={grouped[col.id].map(task => task._id)}>
              {grouped[col.id]?.map((task) => (
                <DraggableTaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
              ))}
              {(!grouped[col.id] || grouped[col.id].length === 0) && (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/5 text-sm text-slate-600">
                  Empty
                </div>
              )}
            </DroppableColumn>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-2 w-80">
             <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

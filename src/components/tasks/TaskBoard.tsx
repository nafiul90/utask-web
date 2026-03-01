'use client';

import { useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { DraggableTaskCard } from './DraggableTaskCard';
import { DroppableColumn } from './DroppableColumn';
import { useState } from 'react';
import { TaskCard } from './TaskCard';

type Task = {
  _id: string;
  title: string;
  status: string;
  assignee?: { fullName: string; profilePicture?: string };
  dueDate: string;
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

export const TaskBoard = ({ tasks, onTaskClick, onStatusChange }: TaskBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {
      pending: [],
      processing: [],
      qa: [],
      completed: [],
      canceled: []
    };
    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });
    return groups;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t._id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find(t => t._id === taskId);

    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] w-80 shrink-0">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="font-semibold text-slate-300">{col.label}</h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                {grouped[col.id]?.length || 0}
              </span>
            </div>
            <DroppableColumn id={col.id}>
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
          <div className="opacity-90 rotate-2">
             <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

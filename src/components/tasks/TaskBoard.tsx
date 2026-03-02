'use client';

import { useState, useMemo, useEffect } from 'react'; // Added useEffect here
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DraggableTaskCard } from './DraggableTaskCard';
import { DroppableColumn } from './DroppableColumn';
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

export const TaskBoard = ({ tasks: initialTasks, onTaskClick, onStatusChange }: TaskBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
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
    COLUMNS.forEach(col => groups[col.id] = []); // Initialize all columns
    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        // Fallback for tasks with unknown status (e.g., new status not in COLUMNS)
        groups.pending.push(task); // Or handle as an error/unassigned status
      }
    });
    return groups;
  }, [tasks]);

  const findColumn = (id: string) => {
    if (COLUMNS.some(col => col.id === id)) {
      return id; // It's a column ID
    }
    // Otherwise, it's a task ID, find its parent column
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

    if (!overId) return;

    const activeColumnId = findColumn(activeId);
    const overColumnId = findColumn(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return; // Not moving between different columns, or invalid columns
    }

    // Handle moving between different columns (just append for now)
    setTasks(prevTasks => {
      const activeTaskIndex = prevTasks.findIndex(task => task._id === activeId);
      if (activeTaskIndex === -1) return prevTasks;

      const updatedTasks = [...prevTasks];
      const [taskToMove] = updatedTasks.splice(activeTaskIndex, 1);
      
      if (taskToMove) {
        // Only if the status is actually changing
        if (taskToMove.status !== overColumnId) {
          taskToMove.status = overColumnId;
          updatedTasks.push(taskToMove);
          onStatusChange(activeId, overColumnId);
        }
      }
      return updatedTasks;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const activeColumnId = findColumn(active.id as string);
    const overColumnId = findColumn(over.id as string);

    if (!activeColumnId || !overColumnId) return;

    const activeItems = grouped[activeColumnId].map(task => task._id);
    const overItems = grouped[overColumnId].map(task => task._id);

    const activeIndex = activeItems.indexOf(active.id as string);
    const overIndex = overItems.indexOf(over.id as string);

    // Same column sorting
    if (activeColumnId === overColumnId) {
      if (activeIndex !== -1 && overIndex !== -1) {
        setTasks(prevTasks => {
          const updatedColumnTasks = arrayMove(grouped[activeColumnId], activeIndex, overIndex);
          // Create a new full tasks array, replacing the old column with the sorted one
          return prevTasks.map(task => 
            activeColumnId === task.status ? 
              updatedColumnTasks.find(uc => uc._id === task._id) || task : 
              task
          ).filter(Boolean) as Task[];
        });
      }
    } else { // Moving to a different column (already handled in dragOver if status changed)
        // If status wasn't changed in dragOver (e.g. dropped on empty column, or new task to move)
        const taskToMove = tasks.find(t => t._id === active.id);
        if (taskToMove && taskToMove.status !== overColumnId) {
            onStatusChange(active.id as string, overColumnId);
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

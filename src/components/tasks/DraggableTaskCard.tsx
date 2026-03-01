'use client';

import { useDraggable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';

type Task = {
  _id: string;
  title: string;
  status: string;
  assignee?: { fullName: string; profilePicture?: string };
  dueDate: string;
};

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

export const DraggableTaskCard = ({ task, onClick }: DraggableTaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: { status: task.status }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: 0.8,
    zIndex: 999,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
};

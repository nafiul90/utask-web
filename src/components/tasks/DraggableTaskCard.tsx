'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : 0,
    // Ensure the card takes its full width in the column
    width: '100%',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
};

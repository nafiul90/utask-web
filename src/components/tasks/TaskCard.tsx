'use client';

import { Avatar } from '../Avatar';

type Task = {
  _id: string;
  title: string;
  status: string;
  assignee?: { fullName: string; profilePicture?: string };
  dueDate: string;
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-rose-500/50 hover:bg-white/10"
    >
      <h4 className="font-medium text-white">{task.title}</h4>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <Avatar src={task.assignee.profilePicture} alt={task.assignee.fullName} size={24} />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-600 bg-transparent">
              ?
            </div>
          )}
          <span>{task.assignee?.fullName || 'Unassigned'}</span>
        </div>
        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

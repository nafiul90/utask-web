'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
  id: string;
  items: string[]; // Array of draggable item IDs
  children: React.ReactNode;
}

export const DroppableColumn = ({ id, items, children }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div 
        ref={setNodeRef} 
        className={`flex flex-col gap-3 rounded-2xl border min-h-[150px] p-2 transition-colors ${
          isOver ? 'bg-white/10 border-rose-500/30' : 'bg-slate-900/40 border-white/5'
        }`}
      >
        {children}
      </div>
    </SortableContext>
  );
};

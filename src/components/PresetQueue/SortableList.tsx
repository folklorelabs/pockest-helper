import React from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import './index.css';

type SortableListProps = {
  items: SortableItem[];
  ItemComponent: React.ComponentType<{ item: SortableItem; }>;
}
function SortableList({
  items,
  ItemComponent,
}: SortableListProps) { 
  return (
    <DndContext>
      <SortableContext items={items}>
        {items.map(item => <SortableItem key={item.id} item={item} ItemComponent={ItemComponent} />)}
      </SortableContext>
    </DndContext>
  );
}

export default SortableList;

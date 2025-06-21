import React from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import './index.css';

type SortableListProps = {
  items: SortableItem[];
  ItemComponent: React.ComponentType<{ item: SortableItem; }>;
  onDragEnd: (event: DragEndEvent) => void,
}
function SortableList({
  items,
  ItemComponent,
  onDragEnd,
}: SortableListProps) { 
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map(item => <SortableItem key={item.id} item={item} ItemComponent={ItemComponent} />)}
      </SortableContext>
    </DndContext>
  );
}

export default SortableList;

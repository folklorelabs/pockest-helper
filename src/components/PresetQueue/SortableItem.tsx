import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

export type SortableItem = {
  id: string;
  [key: string]: unknown;
};
type SortableItemProps = {
  item: SortableItem;
  ItemComponent: React.ComponentType<{ item: SortableItem; }>;
}
export function SortableItem({
  item,
  ItemComponent,
}: SortableItemProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemComponent item={item} />
    </div>
  );
}
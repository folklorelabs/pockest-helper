import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

export type SortableItemComponent = React.FC<{
  item: SortableItem;
  dragAttributes: ReturnType<typeof useSortable>['attributes'];
  dragListeners: ReturnType<typeof useSortable>['listeners'];
}>;
export type SortableItem = {
  id: string;
  [key: string]: unknown;
};
type SortableItemProps = {
  item: SortableItem;
  ItemComponent: SortableItemComponent;
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
    <div ref={setNodeRef} style={style}>
      <ItemComponent
        item={item}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}
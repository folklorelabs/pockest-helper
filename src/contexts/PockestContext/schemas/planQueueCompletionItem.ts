import { z } from 'zod';
import planQueueItem from './planQueueItemSchema';

const planQueueCompletionItem = z.object({
  id: planQueueItem.shape.id,
  status: z.enum(['success', 'fail'])
});

export default planQueueCompletionItem;
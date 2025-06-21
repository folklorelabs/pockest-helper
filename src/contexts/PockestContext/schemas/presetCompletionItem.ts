import { z } from 'zod';
import presetQueue from './presetQueueItem';

const presetCompletionItem = z.object({
  id: presetQueue.shape.id,
  status: z.enum(['success', 'fail'])
});

export default presetCompletionItem;
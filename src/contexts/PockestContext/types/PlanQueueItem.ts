import { z } from 'zod';

import planQueueItemSchema from '../schemas/planQueueItemSchema';

type PlanQueueItem = z.infer<typeof planQueueItemSchema>;

export default PlanQueueItem;
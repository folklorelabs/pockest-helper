import { z } from 'zod';
import planIdSchema from '../../../schemas/planIdSchema';
import statPlanIdSchema from '../../../schemas/statPlanIdSchema';

const presetQueueItem = z.object({
  id: z.string().uuid(),
  monsterId: z.number().nullable().optional(),
  planId: planIdSchema,
  statPlanId: statPlanIdSchema,
  planAge: z.number().max(6).min(1),
  onFail: z.enum(['retry', 'skip']).default('retry'),
  onSuccess: z.enum(['continue', 'pause']).default('continue'),
});

export default presetQueueItem;
import { z } from 'zod';
import planIdSchema from '../../../schemas/planIdSchema';
import statPlanIdSchema from '../../../schemas/statPlanIdSchema';

const planQueueItemSchema = z.object({
  id: z.string().uuid(),
  monsterId: z.number().nullable().optional(),
  planId: planIdSchema,
  statPlanId: statPlanIdSchema,
  planAge: z.number().max(6).min(1),
});

export default planQueueItemSchema;
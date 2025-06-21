import { z } from 'zod';
import planIdSchema from '../../../schemas/planIdSchema';
import statPlanIdSchema from '../../../schemas/statPlanIdSchema';
import PlanQueueFailBehavior from '../types/PlanQueueFailBehavior';
import PlanQueueSuccessBehavior from '../types/PlanQueueSuccessBehavior';

const planQueueItemSchema = z.object({
  id: z.string().uuid(),
  monsterId: z.number().nullable().optional(),
  planId: planIdSchema,
  statPlanId: statPlanIdSchema,
  planAge: z.number().max(6).min(1),
  onFail: z.nativeEnum(PlanQueueFailBehavior).default(PlanQueueFailBehavior.Retry),
  onSuccess: z.nativeEnum(PlanQueueSuccessBehavior).default(PlanQueueSuccessBehavior.Continue),
});

export default planQueueItemSchema;
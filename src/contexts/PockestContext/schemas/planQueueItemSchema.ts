import { z } from 'zod';
import planIdSchema from '../../../schemas/planIdSchema';
import statPlanIdSchema from '../../../schemas/statPlanIdSchema';
import PlanQueueItemFailBehavior from '../types/PlanQueueItemFailBehavior';
import PlanQueueItemSuccessBehavior from '../types/PlanQueueItemSuccessBehavior';
import PlanQueueItemStatus from '../types/PlanQueueItemStatus';

const planQueueItemSchema = z.object({
  id: z.string().uuid(),
  monsterId: z.number().nullable().optional(),
  planId: planIdSchema,
  statPlanId: statPlanIdSchema,
  planAge: z.number().max(6).min(1),
  status: z.nativeEnum(PlanQueueItemStatus).default(PlanQueueItemStatus.Idle),
  onFail: z.nativeEnum(PlanQueueItemFailBehavior).default(PlanQueueItemFailBehavior.Retry),
  onSuccess: z.nativeEnum(PlanQueueItemSuccessBehavior).default(PlanQueueItemSuccessBehavior.Continue),
});

export default planQueueItemSchema;
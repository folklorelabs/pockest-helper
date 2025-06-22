import { z } from 'zod';
import planIdSchema from '../../../schemas/planIdSchema';
import statPlanIdSchema from '../../../schemas/statPlanIdSchema';
import PresetQueueItemFailBehavior from '../types/PresetQueueItemFailBehavior';
import PresetQueueItemSuccessBehavior from '../types/PresetQueueItemSuccessBehavior';
import PresetQueueItemStatus from '../types/PresetQueueItemStatus';

const presetQueueItemSchema = z.object({
  id: z.string().uuid(),
  monsterId: z.number().nullable().optional(),
  planId: planIdSchema,
  statPlanId: statPlanIdSchema,
  planAge: z.number().max(6).min(1),
  status: z.nativeEnum(PresetQueueItemStatus).default(PresetQueueItemStatus.Idle),
  onFail: z.nativeEnum(PresetQueueItemFailBehavior).default(PresetQueueItemFailBehavior.Retry),
  onSuccess: z.nativeEnum(PresetQueueItemSuccessBehavior).default(PresetQueueItemSuccessBehavior.Continue),
});

export default presetQueueItemSchema;
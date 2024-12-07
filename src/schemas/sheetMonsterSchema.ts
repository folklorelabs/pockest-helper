import { z } from 'zod';
import planIdSchema from './planIdSchema';
import statPlanIdSchema from './statPlanIdSchema';

const sheetMonsterSchema = z.object({
  monster_id: z.number().optional(),
  name_en: z.string().optional(),
  planId: planIdSchema.optional(),
  statPlan: statPlanIdSchema.optional(),
  requiredMemento: z.number().optional(),
  matchFever: z.array(z.number()).optional(),
  matchSusFever: z.array(z.number()).optional(),
  matchSusNormal: z.array(z.number()).optional(),
  matchUnknown: z.array(z.number()).optional(),
  confirmed: z.number().optional(),
});

export default sheetMonsterSchema;
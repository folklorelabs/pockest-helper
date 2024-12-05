import { z } from 'zod';
import planIdSchema from './planIdSchema';

const sheetMonsterSchema = z.object({
  monster_id: z.number(),
  name_en: z.string(),
  planId: planIdSchema,
  requiredMemento: z.number(),
  matchFever: z.array(z.number()),
  matchSusFever: z.array(z.number()),
  matchSusNormal: z.array(z.number()),
});

export default sheetMonsterSchema;
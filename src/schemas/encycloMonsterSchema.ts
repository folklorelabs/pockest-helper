import { z } from 'zod';
import flagSchema from './flagSchema';

const encycloMonsterSchema = z.object({
  monster_id: z.number(),
  name: z.string(),
  name_en: z.string(),
  age: z.number().gte(1).lte(5),
  description: z.string(),
  description_en: z.string(),
  from: z.array(z.number()),
  hash: z.string(),
  memento_description: z.string(),
  memento_description_en: z.string(),
  memento_flg: flagSchema,
  memento_hash: z.string(),
  memento_name: z.string(),
  memento_name_en: z.string(),
  new: flagSchema,
  unlock: z.boolean(),
  eggId: z.number().optional(),
});

export default encycloMonsterSchema;
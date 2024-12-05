import { z } from 'zod';

const eggSchema = z.object({
  buckler_point: z.number(),
  complete: z.boolean(),
  hash: z.string(),
  id: z.number(),
  max_monster_count: z.number(),
  monster_count: z.number(),
  name: z.string(),
  name_en: z.string(),
  new: z.boolean(),
  unlock: z.boolean(),
});

export default eggSchema;

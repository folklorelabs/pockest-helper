import { z } from 'zod';
import flagSchema from './flagSchema';
import timestampSchema from './timestampSchema';

const bucklerDataMonsterSchema = z.object({
  age: z.number().int().positive().lte(5),
  exchange_time: timestampSchema,
  exchange_time_par: timestampSchema.nonnegative(),
  garbage: z.number().int().gte(0).lte(12),
  hash: z.string(),
  live_time: timestampSchema,
  live_time_d: timestampSchema,
  max_memento_point: z.number(),
  memento_flg: flagSchema,
  memento_hash: z.string(),
  memento_name: z.string(),
  memento_name_en: z.string(),
  memento_point: z.number(),
  name: z.string(),
  name_en: z.string(),
  power: z.number().nonnegative(),
  speed: z.number().nonnegative(),
  status: z.number(),
  stomach: z.number().gte(0).lte(6),
  technic: z.number().nonnegative(),
  training_is_fever: z.boolean(),
  training_time: timestampSchema,
  training_time_par: timestampSchema.nonnegative(),
});

export default bucklerDataMonsterSchema;

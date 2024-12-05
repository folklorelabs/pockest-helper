import { number, z } from 'zod';
import eggSchema from './eggSchema';

const eggListSchema = z.object({
  eggs: eggSchema,
  user_buckler_point: number(),
});

export default eggListSchema;

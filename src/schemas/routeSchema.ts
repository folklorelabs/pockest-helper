import { z } from 'zod';
import timestampSchema from './timestampSchema';

const routeSchema = z.object({
  cleanFrequency: z.number().int(),
  feedFrequency: z.number().int(),
  cleanOffset: z.number().int(),
  feedOffset: z.number().int(),
  feedTarget: z.number().int(),
  ageStart: z.number().int().gte(0).lte(6),
  ageEnd: z.number().int().gte(0).lte(6),
  startTime: timestampSchema,
  endTime: timestampSchema,
})
  .refine((val) => val?.startTime <= val?.endTime, { message: 'startTime must be <= endTime' })
  .refine((val) => val?.ageStart <= val?.ageEnd, { message: 'ageStart must be <= ageEnd' });

export default routeSchema;
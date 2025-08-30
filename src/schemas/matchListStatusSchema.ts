import { z } from 'zod';
import potentialMatchSchema from './potentialMatchSchema';
import { baseStatusSchema } from './statusSchema';

const matchListStatusSchema = baseStatusSchema.extend({
  exchangeList: z.array(potentialMatchSchema),
  exchangable: z.boolean(),
  my_fighter_id: z.string(),
});

export default matchListStatusSchema;

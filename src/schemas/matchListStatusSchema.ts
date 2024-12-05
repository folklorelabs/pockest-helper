import { z } from 'zod';

import { baseStatusSchema } from './statusSchema';
import potentialMatchSchema from './potentialMatchSchema';

const matchListStatusSchema = baseStatusSchema.extend({
  exchangeList: z.array(potentialMatchSchema),
  exchangable: z.boolean(),
  my_fighter_id: z.string(),
});

export default matchListStatusSchema;
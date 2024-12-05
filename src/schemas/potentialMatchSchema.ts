import { z } from 'zod';

const potentialMatchSchema = z.object({
  fighters_id: z.string(),
  hash: z.string(),
  monster_id: z.number(),
  name: z.string(),
  name_en: z.string(),
  power: z.number(),
  short_id: z.number(),
  slot: z.number(),
  speed: z.number(),
  technic: z.number(),
});

export default potentialMatchSchema;

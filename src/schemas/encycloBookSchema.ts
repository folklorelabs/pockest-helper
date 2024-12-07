import { z } from 'zod';
import encycloMonsterSchema from './encycloMonsterSchema';

const encycloBookSchema = z.object({
  buckler_point: z.number(),
  complete: z.boolean(),
  egg_point_flg: z.boolean(),
  egg_point_per: z.number(),
  hash: z.string(),
  id: z.number(),
  max_monster_count: z.number(),
  monster: z.record(z.string(), z.array(encycloMonsterSchema)),
});

export default encycloBookSchema;
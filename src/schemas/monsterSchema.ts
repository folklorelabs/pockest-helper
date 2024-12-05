import sheetMonsterSchema from './sheetMonsterSchema';
import encycloMonsterSchema from './encycloMonsterSchema';
import { z } from 'zod';

const monsterSchema = encycloMonsterSchema.merge(sheetMonsterSchema).extend({
  eggIds: z.array(z.number()).optional(),
});

export default monsterSchema;
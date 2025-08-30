import { z } from 'zod';
import encycloMonsterSchema from './encycloMonsterSchema';
import sheetMonsterSchema from './sheetMonsterSchema';

const monsterSchema = encycloMonsterSchema.merge(sheetMonsterSchema).extend({
  eggIds: z.array(z.number()).optional(),
});

export default monsterSchema;

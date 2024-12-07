import { z } from 'zod';

import statusMonsterSchema from '../schemas/statusMonsterSchema';

type BucklerDataMonster = z.infer<typeof statusMonsterSchema>;

export default BucklerDataMonster;
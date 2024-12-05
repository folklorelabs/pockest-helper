import { z } from 'zod';

import statusSchema from '../schemas/statusSchema';

type BucklerDataMonster = z.infer<typeof statusSchema>;

export default BucklerDataMonster;
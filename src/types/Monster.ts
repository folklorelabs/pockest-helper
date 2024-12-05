import { z } from 'zod';

import monsterSchema from '../schemas/monsterSchema';

type Monster = z.infer<typeof monsterSchema>;

export default Monster;
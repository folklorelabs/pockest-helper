import { z } from 'zod';

import encycloMonsterSchema from '../schemas/encycloMonsterSchema';

type BucklerEncycloMonster = z.infer<typeof encycloMonsterSchema>;

export default BucklerEncycloMonster;
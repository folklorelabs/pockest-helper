import { z } from 'zod';

import eggSchema from '../schemas/eggSchema';

type BucklerEgg = z.infer<typeof eggSchema>;

export default BucklerEgg;
import { z } from 'zod';

import eggListSchema from '../schemas/eggListSchema';

type BucklerEggData = z.infer<typeof eggListSchema>;

export default BucklerEggData;
import { z } from 'zod';

import pockestStateSchema from '../schemas/pockestStateSchema';

type PockestState = z.infer<typeof pockestStateSchema>;

export default PockestState;
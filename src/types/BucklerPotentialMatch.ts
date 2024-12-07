import { z } from 'zod';

import potentialMatchSchema from '../schemas/potentialMatchSchema';

type BucklerPotentialMatch = z.infer<typeof potentialMatchSchema>;

export default BucklerPotentialMatch;
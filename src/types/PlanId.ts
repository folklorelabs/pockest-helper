import { z } from 'zod';

import planIdSchema from '../schemas/planIdSchema';

type PlanId = z.infer<typeof planIdSchema>;

export default PlanId;
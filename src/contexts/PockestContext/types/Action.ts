import { z } from 'zod';

import actionSchema from '../schemas/actionSchema';

type Action = z.infer<typeof actionSchema>;

export default Action;
import { z } from 'zod';

import statusSchema from '../schemas/statusSchema';

type BucklerStatusData = z.infer<typeof statusSchema>;

export default BucklerStatusData;
import { z } from 'zod';

import matchListStatusSchema from '../schemas/matchListStatusSchema';

type BucklerMatchListData = z.infer<typeof matchListStatusSchema>;

export default BucklerMatchListData;
import { z } from 'zod';

import { exchangeResultsSchema } from '../schemas/statusSchema';

type BucklerMatchResults = z.infer<typeof exchangeResultsSchema>;

export default BucklerMatchResults;
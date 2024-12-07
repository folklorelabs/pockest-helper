import { z } from 'zod';

import logEntrySchema from '../schemas/logEntrySchema';

type LogEntry = z.infer<typeof logEntrySchema>;

export default LogEntry;
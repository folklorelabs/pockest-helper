import { z } from 'zod';

import statusRefreshPayloadSchema from '../schemas/statusRefreshPayloadSchema';

type StatusRefreshPayload = z.infer<typeof statusRefreshPayloadSchema>;

export default StatusRefreshPayload;
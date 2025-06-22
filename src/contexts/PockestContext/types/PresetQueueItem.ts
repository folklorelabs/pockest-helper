import { z } from 'zod';

import presetQueueItemSchema from '../schemas/presetQueueItemSchema';

type PresetQueueItem = z.infer<typeof presetQueueItemSchema>;

export default PresetQueueItem;
import { z } from 'zod';

import settingsSchema from '../schemas/settingsSchema';

type Settings = z.infer<typeof settingsSchema>;

export default Settings;
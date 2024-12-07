import { z } from 'zod';

import sheetHashSchema from '../schemas/sheetHashSchema';

type SheetHash = z.infer<typeof sheetHashSchema>;

export default SheetHash;
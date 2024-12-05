import { z } from 'zod';

import sheetMonsterSchema from '../schemas/sheetMonsterSchema';

type SheetMonster = z.infer<typeof sheetMonsterSchema>;

export default SheetMonster;
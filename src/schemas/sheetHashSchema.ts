import { z } from 'zod';

const sheetHashSchema = z.object({
  id: z.string(),
  type: z.string(),
});

export default sheetHashSchema;
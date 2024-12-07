import { z } from 'zod';

const flagSchema = z.number().gte(0).lte(1);

export default flagSchema;
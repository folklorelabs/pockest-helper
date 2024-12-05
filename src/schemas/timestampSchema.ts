import { z } from 'zod';

const timestampSchema = z.number().int();

export default timestampSchema;
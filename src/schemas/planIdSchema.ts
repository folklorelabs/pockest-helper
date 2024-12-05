import { z } from 'zod';
import PLAN_REGEX from '../constants/PLAN_REGEX';

const planIdSchema = z.string().regex(PLAN_REGEX);

export default planIdSchema;
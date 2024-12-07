import { z } from 'zod';
import STAT_PLAN_REGEX from '../constants/STAT_PLAN_REGEX';

const statPlanIdSchema = z.string().regex(STAT_PLAN_REGEX);

export default statPlanIdSchema;
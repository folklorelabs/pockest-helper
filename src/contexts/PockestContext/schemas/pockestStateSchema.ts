import { z } from 'zod';
import statusSchema from '../../../schemas/statusSchema';
import monsterSchema from '../../../schemas/monsterSchema';
import sheetHashSchema from '../../../schemas/sheetHashSchema';
import planIdSchema from '../../../schemas/planIdSchema';
import statPlanIdSchema from '../../../schemas/statPlanIdSchema';
import logEntrySchema from './logEntrySchema';

const pockestStateSchema = z.object({
  data: statusSchema.nullable().optional(),
  allMonsters: z.array(monsterSchema),
  allHashes: z.array(sheetHashSchema),
  paused: z.boolean(),
  monsterId: z.number().nullable().optional(),
  eggTimestamp: z.number().nullable().optional(),
  eggId: z.number().nullable().optional(),
  evolutionFailed: z.boolean().optional(),
  planId: planIdSchema,
  statPlanId: statPlanIdSchema,
  statLog: z.array(z.union([z.literal('P'), z.literal('S'), z.literal('T')])),
  planAge: z.number().max(6).min(1),
  autoPlan: z.boolean(),
  autoFeed: z.boolean(),
  autoMatch: z.boolean(),
  cleanFrequency: z.number().min(0),
  cleanTimestamp: z.number().nullable().optional(),
  feedFrequency: z.number().min(0),
  feedTarget: z.number().min(0),
  autoClean: z.boolean(),
  autoTrain: z.boolean(),
  autoCure: z.boolean(),
  matchPriority: z.number().min(0).max(1),
  log: z.array(logEntrySchema),
  stat: z.number().max(3).min(1),
  loading: z.boolean(),
  error: z.string().nullable().optional(),
  initialized: z.boolean(),
  invalidSession: z.boolean(),
  simpleMode: z.boolean(),
});

export default pockestStateSchema;
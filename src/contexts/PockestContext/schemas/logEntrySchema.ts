import { z } from 'zod';
import planIdSchema from '../../../schemas/planIdSchema';

const logEntryBaseSchema = z.object({
  logType: z.string(),
  timestamp: z.number(),
  monsterId: z.number().optional(),
  monsterBirth: z.number().nullable().optional(),
});

const evolutionEntrySchema = z.object({
  hash: z.string(),
  id: z.number(),
  name: z.string(),
  name_en: z.string(),
});

const logEntrySchema = z.discriminatedUnion('logType', [
  logEntryBaseSchema.extend({
    logType: z.literal('error'),
    error: z.string(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('hatching'),
    eggType: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('cure'),
    result: z.number(),
    type: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('meal'),
    result: z.number(),
    stomach: z.number(),
    type: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('cleaning'),
    garbageBefore: z.number(),
    result: z.number(),
    type: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('training'),
    is_ferver: z.boolean(),
    type: z.number().min(1).max(3),
    up_status: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('exchange'),
    egg_hash: z.string(),
    egg_id: z.number(),
    egg_name: z.string(),
    egg_name_en: z.string(),
    is_spmatch: z.boolean(),
    memento_hash: z.string(),
    target_monster_hash: z.string(),
    target_monster_id: z.number(),
    target_monster_name_en: z.string(),
    target_monster_name: z.string(),
    get_memento_point: z.number(),
    get_egg_point: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('evolution'),
    evolutions: z.array(evolutionEntrySchema),
    power: z.number(),
    speed: z.number(),
    technic: z.number(),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('evolution_failure'),
    planId: planIdSchema,
    power: z.number(),
    speed: z.number(),
    technic: z.number(),
    mementosOwned: z.array(z.number()),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('death'),
    evolutions: z.array(evolutionEntrySchema),
  }),
  logEntryBaseSchema.extend({
    logType: z.literal('departure'),
    memento: z.object({
      hash: z.string(),
      id: z.number(),
      name: z.string(),
      name_en: z.string(),
    })
  }),
]);

export default logEntrySchema;
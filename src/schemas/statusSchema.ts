import { z } from 'zod';

import timestampSchema from './timestampSchema';
import flagSchema from './flagSchema';
import statusMonsterSchema from "./statusMonsterSchema";

export const baseStatusSchema = z.object({
  event: z.literal(''),
  timestamp: timestampSchema,
  monster: statusMonsterSchema,
  next_big_event_timer: timestampSchema,
  next_small_event_timer: timestampSchema,
  stamp: z.boolean().optional(),
  message: z.string().optional(),
});

export const trainingStatusSchema = baseStatusSchema.extend({
  event: z.literal('training'),
  training: z.object({
    is_fever: z.boolean(),
    type: z.number().gte(1).lte(3),
    up_status: z.number(),
  }),
});

export const exchangeResultsSchema = z.object({
  egg_get: z.boolean(),
  egg_hash: z.string(),
  egg_id: z.number(),
  egg_name: z.string(),
  egg_name_en: z.string(),
  egg_point_per_after: z.number(),
  egg_point_per_before: z.number(),
  get_egg_point: z.number(),
  get_memento_point: z.number(),
  is_spmatch: z.boolean(),
  memento_get: z.boolean(),
  memento_hash: z.string(),
  memento_point_per_after: z.number(),
  memento_point_per_before: z.number(),
  target_monster_hash: z.string(),
  target_monster_id: z.number(),
});

export const exchangeStatusSchema = baseStatusSchema.extend({
  event: z.literal('exchange'),
  exchangable: z.boolean().optional(),
  exchangeResult: exchangeResultsSchema,
});

export const hatchingStatusSchema = baseStatusSchema.extend({
  event: z.literal('hatching'),
});

export const cureStatusSchema = baseStatusSchema.extend({
  event: z.literal('cure'),
  cure: z.object({
    result: flagSchema,
    type: z.number(),
  }),
});

export const cleaningStatusSchema = baseStatusSchema.extend({
  event: z.literal('cleaning'),
  cleaning: z.object({
    result: flagSchema,
    type: z.number(),
  }),
});

export const mealStatusSchema = baseStatusSchema.extend({
  event: z.literal('meal'),
  serving: z.object({
    result: flagSchema,
    type: z.number(),
  }),
});

export const evolutionSchema = z.object({
  hash: z.string(),
  id: z.number(),
  name: z.string(),
  name_en: z.string(),
});

export const evolutionStatusSchema = baseStatusSchema.extend({
  event: z.literal('evolution'),
  evolutions: z.array(evolutionSchema),
});

export const deathStatusSchema = baseStatusSchema.extend({
  event: z.literal('death'),
  evolutions: z.array(evolutionSchema),
});

export const departureStatusSchema = baseStatusSchema.extend({
  event: z.literal('departure'),
  memento: z.object({
    hash: z.string(),
    id: z.number(),
    name: z.string(),
    name_en: z.string(),
  }),
});

export const notFoundStatusSchema = baseStatusSchema.extend({
  event: z.literal('monster_not_found'),
});

const statusSchema = z.discriminatedUnion('event', [
  baseStatusSchema,
  trainingStatusSchema,
  exchangeStatusSchema,
  hatchingStatusSchema,
  cureStatusSchema,
  cleaningStatusSchema,
  mealStatusSchema,
  evolutionStatusSchema,
  deathStatusSchema,
  departureStatusSchema,
  notFoundStatusSchema,
]);

export default statusSchema;
import { z } from "zod";
import ACTION_TYPES from "../constants/ACTION_TYPES";
import logEntrySchema from "./logEntrySchema";
import settingsSchema from "./settingsSchema";
import statusPayloadSchema from "./statusPayloadSchema";
import statusRefreshPayloadSchema from "./statusRefreshPayloadSchema";
import potentialMatchSchema from "../../../schemas/potentialMatchSchema";
import { cleaningStatusSchema, cureStatusSchema, deathStatusSchema, departureStatusSchema, evolutionStatusSchema, exchangeStatusSchema, hatchingStatusSchema, mealStatusSchema, notFoundStatusSchema, trainingStatusSchema } from "../../../schemas/statusSchema";


const actionSchema = z.union([
  z.tuple([z.literal(ACTION_TYPES.INVALIDATE_SESSION)]),
  z.tuple([z.literal(ACTION_TYPES.EVENT_HATCHING), statusPayloadSchema.extend({
    data: hatchingStatusSchema,
    args: z.object({ id: z.number() }),
  })]),
  z.tuple([z.literal(ACTION_TYPES.EVENT_CLEANING), statusPayloadSchema.extend({
    data: cleaningStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.EVENT_TRAINING), statusPayloadSchema.extend({
    data: trainingStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.EVENT_MEAL), statusPayloadSchema.extend({
    data: mealStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.EVENT_EXCHANGE), statusPayloadSchema.extend({
    data: exchangeStatusSchema,
    args: z.object({ match: potentialMatchSchema }),
  })]),
  z.tuple([z.literal(ACTION_TYPES.EVENT_CURE), statusPayloadSchema.extend({
    data: cureStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.REFRESH_STATUS), statusRefreshPayloadSchema]),
  z.tuple([z.literal(ACTION_TYPES.REFRESH_EVOLUTION_SUCCESS), statusRefreshPayloadSchema.extend({
    data: evolutionStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.REFRESH_EVOLUTION_FAILURE), statusRefreshPayloadSchema.extend({
    data: evolutionStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.REFRESH_DEATH), statusRefreshPayloadSchema.extend({
    data: deathStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.REFRESH_DEPARTURE), statusRefreshPayloadSchema.extend({
    data: departureStatusSchema,
  })]),
  z.tuple([z.literal(ACTION_TYPES.REFRESH_MONSTER_NOT_FOUND), statusRefreshPayloadSchema.extend({
    data: notFoundStatusSchema
  })]),
  z.tuple([z.literal(ACTION_TYPES.LOADING)]),
  z.tuple([z.literal(ACTION_TYPES.PAUSE), z.object({ paused: z.boolean() })]),
  z.tuple([z.literal(ACTION_TYPES.ERROR), z.string()]),
  z.tuple([z.literal(ACTION_TYPES.ERROR_HATCH_SYNC), z.string()]),
  z.tuple([z.literal(ACTION_TYPES.SETTINGS), settingsSchema]),
  z.tuple([z.literal(ACTION_TYPES.SET_LOG), z.array(logEntrySchema)]),
]);

export default actionSchema;
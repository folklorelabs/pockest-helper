import { z } from "zod";
import ACTION_TYPES from "../constants/ACTION_TYPES";

const actionTypeKeys = Object.keys(ACTION_TYPES) as [keyof typeof ACTION_TYPES];
const actionTypeSchema = z.enum(actionTypeKeys);

export default actionTypeSchema;
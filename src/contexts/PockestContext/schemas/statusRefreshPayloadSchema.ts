import { z } from "zod";
import monsterSchema from "../../../schemas/monsterSchema";
import sheetHashSchema from "../../../schemas/sheetHashSchema";
import statusPayloadSchema from "./statusPayloadSchema";

const statusRefreshPayloadSchema = statusPayloadSchema.extend({
  allMonsters: z.array(monsterSchema).optional(),
  allHashes: z.array(sheetHashSchema).optional(),
});

export default statusRefreshPayloadSchema;
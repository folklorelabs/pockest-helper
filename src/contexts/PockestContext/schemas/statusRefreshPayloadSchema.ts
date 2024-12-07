import { z } from "zod";
import monsterSchema from "../../../schemas/monsterSchema";
import sheetHashSchema from "../../../schemas/sheetHashSchema";
import statusPayloadSchema from "./statusPayloadSchema";
import eggSchema from "../../../schemas/eggSchema";

const statusRefreshPayloadSchema = statusPayloadSchema.extend({
  allMonsters: z.array(monsterSchema).optional(),
  allHashes: z.array(sheetHashSchema).optional(),
  allEggs: z.array(eggSchema).optional(),
  bucklerBalance: z.number().optional(),
});

export default statusRefreshPayloadSchema;
import { z } from "zod";
import statusSchema from "../../../schemas/statusSchema";

const statusPayloadSchema = z.object({
  data: statusSchema,
});

export default statusPayloadSchema;
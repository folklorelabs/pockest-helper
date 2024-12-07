import { z } from "zod";

const settingsSchema = z.object({
  monsterId: z.number().optional(),
  planId: z.string().optional(),
  statPlanId: z.string().optional(),
  planAge: z.number().optional(),
  autoPlan: z.boolean().optional(),
  autoQueue: z.boolean().optional(),
  autoFeed: z.boolean().optional(),
  autoClean: z.boolean().optional(),
  autoTrain: z.boolean().optional(),
  autoMatch: z.boolean().optional(),
  cleanFrequency: z.number().optional(),
  feedFrequency: z.number().optional(),
  feedTarget: z.number().optional(),
  stat: z.number().optional(),
  matchPriority: z.number().optional(),
  autoCure: z.boolean().optional(),
  simpleMode: z.boolean().optional(),
});

export default settingsSchema;
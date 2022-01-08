import { z } from "zod";

export const configSchema = z.object({
  DATABASE_URL: z.string(),
});

export type IConfig = z.infer<typeof configSchema>;

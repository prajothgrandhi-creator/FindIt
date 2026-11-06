import { z } from "zod";
import { PES_SRN_PATTERN } from "../registration/schema.ts";

export const loginSchema = z.object({
  srn: z.string().trim().min(1).max(20).transform((value) => value.toUpperCase()).pipe(
    z.string().regex(PES_SRN_PATTERN),
  ),
  password: z.string().min(1).max(72),
});

export type LoginPayload = z.infer<typeof loginSchema>;

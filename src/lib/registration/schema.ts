import { z } from "zod";

// Fixed during Phase 2; migrations use the same stable UUID for PES University.
export const PES_UNIVERSITY_ID = "7b1e4f5a-2c10-4e71-a85a-f87d4410c206";
export const SUPPORTED_UNIVERSITIES = [
  { id: PES_UNIVERSITY_ID, name: "PES University" },
] as const;

// This configurable project rule comes from AGENTS.md; it has not been verified as an official PES rule.
export const PES_SRN_PATTERN = /^PES[0-9]UG[0-9]{2}[A-Z]{2,3}[0-9]{3}$/;

const srnSchema = z
  .string()
  .trim()
  .min(1, { error: "Please enter your SRN." })
  .max(20, { error: "SRN must be 20 characters or fewer." })
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(PES_SRN_PATTERN, { error: "Enter your SRN using the configured PES format." }));

export const registrationSchema = z.object({
  universityId: z.string().superRefine((value, context) => {
    if (!value) {
      context.addIssue({ code: "custom", message: "Please select a university." });
      return;
    }
    if (!SUPPORTED_UNIVERSITIES.some((university) => university.id === value)) {
      context.addIssue({ code: "custom", message: "Please select a supported university." });
    }
  }),
  email: z
    .string()
    .trim()
    .min(1, { error: "Please enter your email address." })
    .max(254, { error: "Email address must be 254 characters or fewer." })
    .email({ error: "Enter a valid email address." })
    .transform((value) => value.toLowerCase()),
  srn: srnSchema,
  fullName: z
    .string()
    .trim()
    .min(1, { error: "Please enter your full name." })
    .max(100, { error: "Name must be 100 characters or fewer." }),
  password: z
    .string()
    .min(8, { error: "Use at least 8 characters." })
    .max(72, { error: "Password must be 72 characters or fewer." }),
});

export type RegistrationPayload = z.infer<typeof registrationSchema>;
export type RegistrationField = keyof RegistrationPayload;

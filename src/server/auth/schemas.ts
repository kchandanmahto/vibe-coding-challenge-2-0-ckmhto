import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;

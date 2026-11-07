
import { z } from "zod";

const emergencyContactSchema = z.object({
    name: z.string().trim().max(100).optional(),
    relationship: z.string().trim().max(50).optional(),
    phone: z.string().trim().max(20).optional(),
}).optional();

export const createPlayerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email().trim().toLowerCase().max(254),
    dateOfBirth: z.coerce.date().refine(
        (date) => date <= new Date(),
        "Date of birth cannot be in the future",
    ),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    sportId: z.string().regex(/^[a-f\d]{24}$/i),
    coachId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    phone: z.string().trim().max(20).optional(),
    address: z.string().trim().max(300).optional(),
    emergencyContact: emergencyContactSchema,
});

export const updatePlayerSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.email().trim().toLowerCase().max(254).optional(),
    dateOfBirth: z.coerce.date().refine(
        (date) => date <= new Date(),
        "Date of birth cannot be in the future",
    ).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    sportId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    coachId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
    phone: z.string().trim().max(20).nullable().optional(),
    address: z.string().trim().max(300).nullable().optional(),
    emergencyContact: emergencyContactSchema,
}).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
);

export const updatePlayerStatusSchema = z.object({
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export type CreatePlayerData = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerData = z.infer<typeof updatePlayerSchema>;

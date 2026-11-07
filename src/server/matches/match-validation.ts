
import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid ID.");

const dateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
    .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);

        return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value
        );
    }, "Invalid date.");

export const createMatchSchema = z.object({
    name: z.string().trim().min(2).max(120),
    sportId: objectIdSchema,
    date: dateSchema,
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    type: z.enum(["FRIENDLY", "TOURNAMENT", "LEAGUE"]),
    opponent: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    venue: z.string().trim().max(200).optional(),
    playerIds: z.array(objectIdSchema).min(1).max(100),
    sessionId: objectIdSchema,
});

export const updateMatchSchema = z
    .object({
        name: z.string().trim().min(2).max(120).optional(),
        sportId: objectIdSchema.optional(),
        date: dateSchema.optional(),
        time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
        type: z.enum(["FRIENDLY", "TOURNAMENT", "LEAGUE"]).optional(),
        opponent: z.string().trim().min(2).max(120).optional(),
        description: z.string().trim().max(1000).optional(),
        venue: z.string().trim().max(200).optional(),
        playerIds: z.array(objectIdSchema).min(1).max(100).optional(),
        sessionId: objectIdSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required.",
    });

export const updateMatchStatusSchema = z.object({
    status: z.enum(["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    teamScore: z.number().int().min(0).optional(),
    opponentScore: z.number().int().min(0).optional(),
});

export type CreateMatchData = z.infer<typeof createMatchSchema>;
export type UpdateMatchData = z.infer<typeof updateMatchSchema>;
export type UpdateMatchStatusData = z.infer<typeof updateMatchStatusSchema>;

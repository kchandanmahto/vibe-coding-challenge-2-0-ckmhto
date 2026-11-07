import { z } from "zod";

const timeSchema = z.string().regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Time must be in HH:mm format.",
);

const baseSessionSchema = z.object({
    title: z.string().trim().min(2).max(120),
    sportId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid sport."),
    coachId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    playerIds: z.array(
        z.string().regex(/^[a-f\d]{24}$/i, "Invalid player ID."),
    ).min(1).max(200),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: timeSchema,
    endTime: timeSchema,
    notes: z.string().trim().max(1000).optional(),
});

export const createSessionSchema = baseSessionSchema.refine(
    (data) => data.startTime < data.endTime,
    {
        message: "End time must be after start time.",
        path: ["endTime"],
    },
);

export const updateSessionSchema = baseSessionSchema.partial().refine(
    (data) =>
        !data.startTime ||
        !data.endTime ||
        data.startTime < data.endTime,
    {
        message: "End time must be after start time.",
        path: ["endTime"],
    },
);

export const sessionStatusSchema = z.object({
    status: z.enum(["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"]),
});

export type CreateSessionData = z.infer<typeof createSessionSchema>;
export type UpdateSessionData = z.infer<typeof updateSessionSchema>;
import { z } from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid ID.");

const performanceItemSchema = z
    .object({
        playerId: objectIdSchema,

        participationStatus: z.enum([
            "PARTICIPATED",
            "DID_NOT_PARTICIPATE",
        ]),

        score: z.number().min(0).optional(),

        remarks: z.string().trim().max(500).optional(),

        metrics: z.record(z.string(), z.unknown()).optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.participationStatus === "PARTICIPATED" &&
            data.score === undefined
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["score"],
                message: "Score is required for participating players.",
            });
        }

        if (data.participationStatus === "DID_NOT_PARTICIPATE") {
            if (data.score !== undefined) {
                ctx.addIssue({
                    code: "custom",
                    path: ["score"],
                    message: "Score is not allowed for non-participating players.",
                });
            }
        }
    });

export const saveMatchPerformanceSchema = z.object({
    performances: z
        .array(performanceItemSchema)
        .min(1, "At least one player performance is required.")
        .max(100),
}).superRefine((data, ctx) => {
    const playerIds = data.performances.map((item) => item.playerId);

    if (new Set(playerIds).size !== playerIds.length) {
        ctx.addIssue({
            code: "custom",
            path: ["performances"],
            message: "Duplicate player records are not allowed.",
        });
    }
});

export type SaveMatchPerformanceData = z.infer<
    typeof saveMatchPerformanceSchema
>;
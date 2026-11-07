
import { NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    updatePlayerStatusSchema,
} from "@/server/players/player-validation";

import {
    updatePlayerStatus,
    PlayerServiceError,
} from "@/server/players/player-service";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    try {
        const user = await requireRole(["HEAD_COACH", "COACH"]);

        const actor = user.role === "COACH"
            ? await requireCoachAccess()
            : user;

        const { id } = await context.params;

        const body = await request.json().catch(() => null);
        const parsed = updatePlayerStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid player status.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const result = await updatePlayerStatus(
            id,
            parsed.data.status,
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
        );

        return NextResponse.json({
            message: "Player status updated successfully.",
            playerId: id,
            status: parsed.data.status,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.code === "UNAUTHENTICATED" ? 401 : 403 },
            );
        }

        if (error instanceof PlayerServiceError) {
            const status =
                error.code === "NOT_FOUND" ? 404 :
                    error.code === "FORBIDDEN" ? 403 : 400;

            return NextResponse.json(
                { message: error.message },
                { status },
            );
        }

        console.error("Player status API error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}

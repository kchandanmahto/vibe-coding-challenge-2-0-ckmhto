
import { NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    updatePlayerSchema,
} from "@/server/players/player-validation";

import {
    getPlayerById,
    updatePlayer,
    PlayerServiceError,
} from "@/server/players/player-service";

async function getActor() {
    const user = await requireRole(["HEAD_COACH", "COACH"]);

    return user.role === "COACH"
        ? await requireCoachAccess()
        : user;
}

function handleError(error: unknown) {
    if (error instanceof AuthorizationError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.code === "UNAUTHENTICATED" ? 401 : 403 },
        );
    }

    if (error instanceof PlayerServiceError) {
        const status =
            error.code === "NOT_FOUND" ? 404 :
                error.code === "FORBIDDEN" ? 403 :
                    error.code === "EMAIL_EXISTS" ? 409 : 400;

        return NextResponse.json(
            { message: error.message },
            { status },
        );
    }

    console.error("Player details API error:", error);

    return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 },
    );
}

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: Request,
    context: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await context.params;

        const player = await getPlayerById(id, {
            id: actor.id,
            academyId: actor.academyId,
            role: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json({ player });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await context.params;

        const body = await request.json().catch(() => null);
        const parsed = updatePlayerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid player information.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const player = await updatePlayer(
            id,
            parsed.data,
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
        );

        return NextResponse.json({
            message: "Player updated successfully.",
            player,
        });
    } catch (error) {
        return handleError(error);
    }
}

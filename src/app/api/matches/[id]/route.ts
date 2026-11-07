
import { NextRequest, NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    getMatchById,
    updateMatch,
    MatchServiceError,
} from "@/server/matches/match-service";

import { updateMatchSchema } from "@/server/matches/match-validation";

type RouteContext = {
    params: Promise<{ id: string }>;
};

async function getActor() {
    const user = await requireRole(["HEAD_COACH", "COACH"]);

    if (user.role === "COACH") {
        return requireCoachAccess();
    }

    return user;
}

function handleError(error: unknown) {
    if (error instanceof AuthorizationError) {
        const status =
            error.code === "UNAUTHENTICATED" ? 401 : 403;

        return NextResponse.json(
            { success: false, message: error.message },
            { status },
        );
    }

    if (error instanceof MatchServiceError) {
        const status =
            error.code === "NOT_FOUND"
                ? 404
                : error.code === "FORBIDDEN"
                    ? 403
                    : 400;

        return NextResponse.json(
            { success: false, message: error.message },
            { status },
        );
    }

    console.error("Match detail API error:", error);

    return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status: 500 },
    );
}

export async function GET(
    _request: NextRequest,
    context: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await context.params;

        const match = await getMatchById(id, {
            id: actor.id,
            academyId: actor.academyId,
            role: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json({
            success: true,
            match,
        });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await context.params;

        const body = await request.json().catch(() => null);
        const parsed = updateMatchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const match = await updateMatch(id, parsed.data, {
            id: actor.id,
            academyId: actor.academyId,
            role: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json({
            success: true,
            message: "Match updated successfully.",
            match,
        });
    } catch (error) {
        return handleError(error);
    }
}

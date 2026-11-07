
import { NextRequest, NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    updateMatchStatus,
    MatchServiceError,
} from "@/server/matches/match-service";

import { updateMatchStatusSchema } from "@/server/matches/match-validation";

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

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await context.params;

        const body = await request.json().catch(() => null);
        const parsed = updateMatchStatusSchema.safeParse(body);

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

        const result = await updateMatchStatus(id, parsed.data, {
            id: actor.id,
            academyId: actor.academyId,
            role: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json({
            success: true,
            message: "Match status updated successfully.",
            ...result,
        });
    } catch (error) {
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

        console.error("Match status API error:", error);

        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 },
        );
    }
}

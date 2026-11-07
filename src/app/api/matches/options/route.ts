
import { connection, NextResponse, type NextRequest } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    getMatchOptions,
    MatchServiceError,
} from "@/server/matches/match-service";

async function getActor() {
    const user = await requireRole(["HEAD_COACH", "COACH"]);

    if (user.role === "COACH") {
        return requireCoachAccess();
    }

    return user;
}

export async function GET(request: NextRequest) {
    await connection();

    try {
        const user = await getActor();

        const options = await getMatchOptions(
            {
                id: user.id,
                academyId: user.academyId,
                role: user.role as "HEAD_COACH" | "COACH",
            },
            request.nextUrl.searchParams.get("sessionId") ?? undefined,
        );

        return NextResponse.json({
            success: true,
            ...options,
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

        console.error("Match options API error:", error);

        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 },
        );
    }
}

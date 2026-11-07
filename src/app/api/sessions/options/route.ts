import { connection, NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    getSessionOptions,
    SessionServiceError,
} from "@/server/sessions/session-service";

async function getActor() {
    const user = await requireRole(["HEAD_COACH", "COACH"]);

    return user.role === "COACH"
        ? await requireCoachAccess()
        : user;
}

export async function GET(request: Request) {
        await connection();

    try {
        const user = await getActor();

        const sportId = new URL(request.url).searchParams.get("sportId") ?? undefined;

        const result = await getSessionOptions(
            {
                id: user.id,
                academyId: user.academyId,
                role: user.role as "HEAD_COACH" | "COACH",
            },
            sportId,
        );

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.code === "UNAUTHENTICATED" ? 401 : 403 },
            );
        }

        if (error instanceof SessionServiceError) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 },
            );
        }

        console.error("Session options API error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    listMatches,
    createMatch,
    MatchServiceError,
} from "@/server/matches/match-service";

import { createMatchSchema } from "@/server/matches/match-validation";

async function getActor() {
    const user = await requireRole(["HEAD_COACH", "COACH"]);

    if (user.role === "COACH") {
        return requireCoachAccess();
    }

    return user;
}

function handleError(error: unknown) {
    if (error instanceof AuthorizationError) {
        const status = error.code === "UNAUTHENTICATED" ? 401 : 403;

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

    console.error("Matches API error:", error);

    return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status: 500 },
    );
}

export async function GET(request: NextRequest) {
    try {
        const actor = await getActor();
        const params = request.nextUrl.searchParams;

        const page = Math.max(1, Number(params.get("page")) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(params.get("limit")) || 10),
        );

        const result = await listMatches(
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
            {
                search: params.get("search") ?? undefined,
                sportId: params.get("sportId") ?? undefined,
                status: params.get("status") ?? undefined,
                date: params.get("date") ?? undefined,
                page,
                limit,
            },
        );

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const actor = await getActor();
        const body = await request.json().catch(() => null);

        const parsed = createMatchSchema.safeParse(body);

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

        const match = await createMatch(parsed.data, {
            id: actor.id,
            academyId: actor.academyId,
            role: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Match created successfully.",
                match,
            },
            { status: 201 },
        );
    } catch (error) {
        return handleError(error);
    }
}

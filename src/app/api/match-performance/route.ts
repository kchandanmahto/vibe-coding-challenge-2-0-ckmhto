
import { NextRequest, NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    getMatchPerformances,
    getPerformanceHistory,
    saveMatchPerformances,
    PerformanceServiceError,
    type PerformanceActor,
} from "@/server/match-performance/performance-service";

import { saveMatchPerformanceSchema } from "@/server/match-performance/performance-validation";

async function getActor(): Promise<PerformanceActor> {
    const user = await requireRole(["HEAD_COACH", "COACH"]);

    if (user.role === "COACH") {
        const coach = await requireCoachAccess();

        return {
            id: coach.id,
            academyId: coach.academyId,
            role: "COACH",
        };
    }

    return {
        id: user.id,
        academyId: user.academyId,
        role: "HEAD_COACH",
    };
}

function handleError(error: unknown) {
    if (error instanceof AuthorizationError) {
        const status = error.code === "UNAUTHENTICATED" ? 401 : 403;

        return NextResponse.json(
            { success: false, message: error.message },
            { status }
        );
    }

    if (error instanceof PerformanceServiceError) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: error.statusCode }
        );
    }

    console.error("Match Performance API error:", error);

    return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status: 500 }
    );
}

export async function GET(request: NextRequest) {
    try {
        const actor = await getActor();
        const params = request.nextUrl.searchParams;

        const matchId = params.get("matchId");

        if (matchId) {
            const result = await getMatchPerformances(actor, matchId);

            return NextResponse.json({
                success: true,
                ...result,
            });
        }

        const page = Math.max(1, Number(params.get("page")) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(params.get("limit")) || 20)
        );

        const result = await getPerformanceHistory(actor, page, limit);

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

        if (
            !body ||
            typeof body.matchId !== "string" ||
            !body.matchId.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid matchId is required.",
                },
                { status: 400 }
            );
        }

        const parsed = saveMatchPerformanceSchema.safeParse({
            performances: body.performances,
        });

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const result = await saveMatchPerformances(
            actor,
            body.matchId,
            parsed.data
        );

        return NextResponse.json({
            success: true,
            message: "Match performances saved successfully.",
            ...result,
        });
    } catch (error) {
        return handleError(error);
    }
}

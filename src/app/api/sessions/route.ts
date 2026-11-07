import { NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    createSession,
    listSessions,
    SessionServiceError,
} from "@/server/sessions/session-service";

import { createSessionSchema } from "@/server/sessions/session-validation";

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

    if (error instanceof SessionServiceError) {
        const status =
            error.code === "NOT_FOUND" ? 404 :
                error.code === "FORBIDDEN" ? 403 :
                    400;

        return NextResponse.json(
            { message: error.message },
            { status },
        );
    }

    console.error("Sessions API error:", error);

    return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 },
    );
}

export async function GET(request: Request) {
    try {
        const actor = await getActor();
        const params = new URL(request.url).searchParams;

        const page = Math.max(1, Number(params.get("page")) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 10));

        const result = await listSessions(
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

        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: Request) {
    try {
        const actor = await getActor();
        const body = await request.json().catch(() => null);
        const parsed = createSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid session information.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const session = await createSession(
            parsed.data,
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
        );

        return NextResponse.json(
            {
                message: "Session created successfully.",
                session,
            },
            { status: 201 },
        );
    } catch (error) {
        return handleError(error);
    }
}
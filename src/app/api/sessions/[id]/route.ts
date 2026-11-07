import { NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    getSessionById,
    updateSession,
    SessionServiceError,
} from "@/server/sessions/session-service";

import { updateSessionSchema } from "@/server/sessions/session-validation";

type RouteContext = {
    params: Promise<{ id: string }>;
};

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

    console.error("Session API error:", error);

    return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 },
    );
}

export async function GET(
    _request: Request,
    { params }: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await params;

        const session = await getSessionById(id, {
            id: actor.id,
            academyId: actor.academyId,
            role: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json({ session });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
    request: Request,
    { params }: RouteContext,
) {
    try {
        const actor = await getActor();
        const { id } = await params;

        const body = await request.json().catch(() => null);
        const parsed = updateSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid session information.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const session = await updateSession(
            id,
            parsed.data,
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
        );

        return NextResponse.json({
            message: "Session updated successfully.",
            session,
        });
    } catch (error) {
        return handleError(error);
    }
}
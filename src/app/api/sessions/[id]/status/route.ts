import { NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import {
    updateSessionStatus,
    SessionServiceError,
} from "@/server/sessions/session-service";

import { sessionStatusSchema } from "@/server/sessions/session-validation";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(
    request: Request,
    { params }: RouteContext,
) {
    try {
        const user = await requireRole(["HEAD_COACH", "COACH"]);

        const actor = user.role === "COACH"
            ? await requireCoachAccess()
            : user;

        const { id } = await params;

        const body = await request.json().catch(() => null);
        const parsed = sessionStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid session status.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const result = await updateSessionStatus(
            id,
            parsed.data.status,
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
        );

        return NextResponse.json({
            message: "Session status updated successfully.",
            ...result,
        });
    } catch (error) {
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

        console.error("Session status API error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
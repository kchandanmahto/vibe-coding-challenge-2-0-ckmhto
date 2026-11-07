
import { NextResponse } from "next/server";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

import { createPlayer } from "@/server/players/create-player";
import {
    createPlayerSchema,
} from "@/server/players/player-validation";
import {
    listPlayers,
    PlayerServiceError,
} from "@/server/players/player-service";

async function getActor() {
    const initialUser = await requireRole(["HEAD_COACH", "COACH"]);

    return initialUser.role === "COACH"
        ? await requireCoachAccess()
        : initialUser;
}

function handleError(error: unknown) {
    if (error instanceof AuthorizationError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.code === "UNAUTHENTICATED" ? 401 : 403 },
        );
    }

    if (
        error instanceof PlayerServiceError ||
        error instanceof Error && error.name === "PlayerCreationError"
    ) {
        const code = "code" in error ? error.code : undefined;

        const status =
            code === "NOT_FOUND" ? 404 :
                code === "FORBIDDEN" ? 403 :
                    code === "EMAIL_EXISTS" ? 409 :
                        code === "INVALID_SPORT" || code === "INVALID_COACH" ? 400 :
                            400;

        return NextResponse.json(
            { message: error.message },
            { status },
        );
    }

    console.error("Players API error:", error);

    return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 },
    );
}

export async function GET(request: Request) {
    try {
        const actor = await getActor();
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(searchParams.get("limit")) || 10),
        );

        const result = await listPlayers(
            {
                id: actor.id,
                academyId: actor.academyId,
                role: actor.role as "HEAD_COACH" | "COACH",
            },
            {
                search: searchParams.get("search") ?? undefined,
                sportId: searchParams.get("sportId") ?? undefined,
                coachId: searchParams.get("coachId") ?? undefined,
                status: searchParams.get("status") ?? undefined,
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
        const parsed = createPlayerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid player information.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const result = await createPlayer({
            ...parsed.data,
            academyId: actor.academyId,
            actorId: actor.id,
            actorRole: actor.role as "HEAD_COACH" | "COACH",
        });

        return NextResponse.json(
            {
                message: result.invitationSent
                    ? "Player created and invitation email sent."
                    : "Player created, but invitation email could not be sent.",
                ...result,
            },
            { status: 201 },
        );
    } catch (error) {
        return handleError(error);
    }
}

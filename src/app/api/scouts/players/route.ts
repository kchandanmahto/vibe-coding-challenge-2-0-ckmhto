
import { connection, NextResponse } from "next/server";

import {
    AuthorizationError,
    requireScoutAccess,
} from "@/server/auth/permissions";

import { getReadyScoutPlayers } from "@/server/scouts/scout-service";

export async function GET() {
        await connection();

    try {
        const user = await requireScoutAccess();

        const players = await getReadyScoutPlayers(user.academyId);

        return NextResponse.json({
            success: true,
            total: players.length,
            players,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            const status =
                error.code === "UNAUTHENTICATED" ? 401 : 403;

            return NextResponse.json(
                {
                    success: false,
                    message:
                        error.code === "UNAUTHENTICATED"
                            ? "Authentication required."
                            : "You do not have permission to access scout data.",
                },
                { status }
            );
        }

        console.error("Scout players API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch ready players.",
            },
            { status: 500 }
        );
    }
}

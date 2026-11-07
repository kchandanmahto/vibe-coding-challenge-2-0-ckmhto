
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Attendance from "@/models/Attendance";
import TrainingSession from "@/models/TrainingSession";

import { connectDB } from "@/server/database/mongodb";

import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

const VALID_STATUSES = [
    "PRESENT",
    "ABSENT",
    "LATE",
    "EXCUSED",
] as const;

type AttendanceStatus = (typeof VALID_STATUSES)[number];

async function getActor() {
    await requireRole(["COACH"]);
    return requireCoachAccess();
}

function getId(value: unknown): string {
    if (
        value &&
        typeof value === "object" &&
        "_id" in value
    ) {
        return String((value as { _id: unknown })._id);
    }

    return String(value);
}

function handleError(error: unknown) {
    if (error instanceof AuthorizationError) {
        return NextResponse.json(
            { message: error.message },
            {
                status:
                    error.code === "UNAUTHENTICATED" ? 401 : 403,
            },
        );
    }

    console.error("Attendance API error:", error);

    return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 },
    );
}

/**
 * GET /api/attendance?sessionId=MONGODB_ID
 *
 * Returns one session, its selected players and saved attendance.
 */
export async function GET(request: Request) {
    try {
        await connectDB();

        const actor = await getActor();

        const sessionId = new URL(request.url).searchParams.get(
            "sessionId",
        );

        if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
            return NextResponse.json(
                { message: "Valid session ID is required." },
                { status: 400 },
            );
        }

        const session = await TrainingSession.findOne({
            _id: sessionId,
            academyId: actor.academyId,
            coachId: actor.id,
        })
            .populate("sportId", "name")
            .populate("playerIds", "name playerCode")
            .lean();

        if (!session) {
            return NextResponse.json(
                { message: "Session not found or access denied." },
                { status: 404 },
            );
        }


        const players = (session.playerIds ?? []).map((player) => {
            const populatedPlayer =
                typeof player === "object" && player !== null
                    ? (player as {
                        _id?: unknown;
                        name?: unknown;
                        playerCode?: unknown;
                    })
                    : null;

            return {
                id: populatedPlayer?._id
                    ? String(populatedPlayer._id)
                    : getId(player),
                name:
                    typeof populatedPlayer?.name === "string"
                        ? populatedPlayer.name
                        : "Unknown player",
                playerCode:
                    typeof populatedPlayer?.playerCode === "string"
                        ? populatedPlayer.playerCode
                        : "",
            };
        });


        const attendanceRecords = await Attendance.find({
            academyId: actor.academyId,
            sessionId: session._id,
        })
            .sort({ markedAt: 1 })
            .lean();

        const records = attendanceRecords.map((record) => ({
            playerId: String(record.playerId),
            status: record.status,
            markedAt: record.markedAt
                ? record.markedAt.toISOString()
                : undefined,
            remarks: record.remarks ?? "",
        }));

        const counts = {
            present: records.filter(
                (record) => record.status === "PRESENT",
            ).length,
            absent: records.filter(
                (record) => record.status === "ABSENT",
            ).length,
            late: records.filter(
                (record) => record.status === "LATE",
            ).length,
            excused: records.filter(
                (record) => record.status === "EXCUSED",
            ).length,
        };

        return NextResponse.json({
            session: {
                id: String(session._id),
                sessionCode: session.sessionCode,
                title: session.title,
                date: new Date(session.date)
                    .toISOString()
                    .slice(0, 10),
                startTime: session.startTime,
                endTime: session.endTime,

                sport:
                    typeof session.sportId === "object" &&
                        session.sportId !== null &&
                        "name" in session.sportId &&
                        typeof session.sportId.name === "string"
                        ? session.sportId.name
                        : "Unknown",

                status: session.status,
                players,
                total: players.length,
                ...counts,
            },
            records,
        });
    } catch (error) {
        return handleError(error);
    }
}

/**
 * POST /api/attendance
 *
 * Saves or updates attendance for all players in a session.
 */
export async function POST(request: Request) {
    try {
        await connectDB();

        const actor = await getActor();

        const body = await request.json().catch(() => null);

        if (
            !body ||
            !mongoose.isValidObjectId(body.sessionId) ||
            !Array.isArray(body.records) ||
            body.records.length === 0
        ) {
            return NextResponse.json(
                { message: "Invalid attendance information." },
                { status: 400 },
            );
        }

        const session = await TrainingSession.findOne({
            _id: body.sessionId,
            academyId: actor.academyId,
            coachId: actor.id,
        });

        if (!session) {
            return NextResponse.json(
                { message: "Session not found or access denied." },
                { status: 404 },
            );
        }

        if (session.status !== "OPEN") {
            return NextResponse.json(
                {
                    message:
                        "Attendance can only be saved for open sessions. Start the session first.",
                },
                { status: 409 },
            );
        }

        const sessionPlayerIds = session.playerIds.map(String);
        const seenPlayers = new Set<string>();

        for (const record of body.records) {
            if (
                !record ||
                !mongoose.isValidObjectId(record.playerId) ||
                !VALID_STATUSES.includes(record.status as AttendanceStatus)
            ) {
                return NextResponse.json(
                    { message: "Invalid player or attendance status." },
                    { status: 400 },
                );
            }

            const playerId = String(record.playerId);

            if (
                !sessionPlayerIds.includes(playerId) ||
                seenPlayers.has(playerId)
            ) {
                return NextResponse.json(
                    {
                        message:
                            "Attendance contains an invalid or duplicate player.",
                    },
                    { status: 400 },
                );
            }

            seenPlayers.add(playerId);

            if (
                record.remarks !== undefined &&
                (
                    typeof record.remarks !== "string" ||
                    record.remarks.length > 500
                )
            ) {
                return NextResponse.json(
                    { message: "Remarks must be under 500 characters." },
                    { status: 400 },
                );
            }
        }

        // Every selected player must receive a status.
        if (seenPlayers.size !== sessionPlayerIds.length) {
            return NextResponse.json(
                {
                    message:
                        "Please mark attendance for every selected player.",
                },
                { status: 400 },
            );
        }

        const now = new Date();

        const operations = body.records.map(
            (record: {
                playerId: string;
                status: AttendanceStatus;
                remarks?: string;
            }) => ({
                updateOne: {
                    filter: {
                        sessionId: session._id,
                        playerId: new mongoose.Types.ObjectId(
                            record.playerId,
                        ),
                    },
                    update: {
                        $set: {
                            academyId: new mongoose.Types.ObjectId(
                                actor.academyId,
                            ),
                            status: record.status,
                            markedBy: new mongoose.Types.ObjectId(
                                actor.id,
                            ),
                            markedAt: now,
                            remarks: record.remarks?.trim() ?? "",
                        },
                    },
                    upsert: true,
                },
            }),
        );

        await Attendance.bulkWrite(operations);

        const savedRecords = await Attendance.find({
            academyId: actor.academyId,
            sessionId: session._id,
        }).lean();

        return NextResponse.json({
            message: "Attendance saved successfully.",
            records: savedRecords.map((record) => ({
                playerId: String(record.playerId),
                status: record.status,
                markedAt: record.markedAt?.toISOString(),
                remarks: record.remarks ?? "",
            })),
        });
    } catch (error) {
        return handleError(error);
    }
}


import "server-only";

import mongoose from "mongoose";

import Player from "@/models/Player";
import AttendanceModel from "@/models/Attendance";
import MatchModel from "@/models/Match";
import MatchPerformanceModel from "@/models/MatchPerformance";

import { connectDB } from "@/server/database/mongodb";

export interface ReadyPlayer {
    id: string;
    playerCode: string;
    name: string;
    initials: string;
    age: number | null;
    gender: string;
    sport: string;
    phone: string;
    email: string;
    address: string;
    attendance: number;
    totalSessions: number;
    presentSessions: number;
    completedMatches: number;
    status: string;
    readiness: {
        attendance: boolean;
        completedMatches: boolean;
        ready: boolean;
    };
}

function calculateAge(dateOfBirth?: Date | null): number | null {
    if (!dateOfBirth) return null;

    const birthDate = new Date(dateOfBirth);

    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 &&
            today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : null;
}

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export async function getReadyScoutPlayers(
    academyId: string
): Promise<ReadyPlayer[]> {
    await connectDB();

    if (!mongoose.isValidObjectId(academyId)) {
        throw new Error("Invalid academy ID.");
    }

    const academyObjectId = new mongoose.Types.ObjectId(academyId);

    const [players, attendanceStats, performanceStats] =
        await Promise.all([
            Player.find({
                academyId: academyObjectId,
                status: "ACTIVE",
            })
                .populate("sportId", "name")
                .sort({ name: 1 })
                .lean(),

            AttendanceModel.aggregate([
                {
                    $match: {
                        academyId: academyObjectId,
                    },
                },
                {
                    $group: {
                        _id: "$playerId",
                        totalSessions: { $sum: 1 },
                        presentSessions: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "PRESENT"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),

            MatchPerformanceModel.aggregate([
                {
                    $match: {
                        academyId: academyObjectId,
                        participationStatus: "PARTICIPATED",
                    },
                },
                {
                    $lookup: {
                        from: MatchModel.collection.name,
                        localField: "matchId",
                        foreignField: "_id",
                        as: "match",
                    },
                },
                {
                    $unwind: "$match",
                },
                {
                    $match: {
                        "match.academyId": academyObjectId,
                        "match.status": "COMPLETED",
                    },
                },
                {
                    $group: {
                        _id: "$playerId",
                        completedMatches: { $sum: 1 },
                    },
                },
            ]),
        ]);

    const attendanceMap = new Map<
        string,
        {
            totalSessions: number;
            presentSessions: number;
        }
    >();

    for (const record of attendanceStats) {
        attendanceMap.set(String(record._id), {
            totalSessions: record.totalSessions,
            presentSessions: record.presentSessions,
        });
    }

    const performanceMap = new Map<string, number>();

    for (const record of performanceStats) {
        performanceMap.set(
            String(record._id),
            record.completedMatches
        );
    }

    const readyPlayers: ReadyPlayer[] = [];

    for (const player of players) {
        const playerId = String(player._id);

        const attendanceData = attendanceMap.get(playerId) ?? {
            totalSessions: 0,
            presentSessions: 0,
        };

        const completedMatches =
            performanceMap.get(playerId) ?? 0;

        const attendance =
            attendanceData.totalSessions > 0
                ? Math.round(
                    (attendanceData.presentSessions /
                        attendanceData.totalSessions) *
                    100
                )
                : 0;

        const attendanceReady = attendance >= 75;
        const matchesReady = completedMatches >= 2;

        const isReady = attendanceReady && matchesReady;

        if (!isReady) continue;

        const sport = player.sportId as unknown as {
            name: string;
        } | null;

        readyPlayers.push({
            id: playerId,
            playerCode: player.playerCode,
            name: player.name,
            initials: getInitials(player.name),
            age: calculateAge(player.dateOfBirth),
            gender: player.gender ?? "",
            sport: sport?.name ?? "",
            phone: player.phone ?? "",
            email: player.email ?? "",
            address: player.address ?? "",
            attendance,
            totalSessions: attendanceData.totalSessions,
            presentSessions: attendanceData.presentSessions,
            completedMatches,
            status: player.status,
            readiness: {
                attendance: attendanceReady,
                completedMatches: matchesReady,
                ready: isReady,
            },
        });
    }

    return readyPlayers;
}

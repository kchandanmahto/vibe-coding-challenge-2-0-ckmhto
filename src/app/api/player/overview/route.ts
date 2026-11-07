
import { connection, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireRole, AuthorizationError } from "@/server/auth/permissions";

import Player from "@/models/Player";
import AttendanceModel from "@/models/Attendance";
import MatchModel from "@/models/Match";
import MatchPerformanceModel from "@/models/MatchPerformance";

export async function GET() {
        await connection();

    try {
        // 1. Authenticate player
        const user = await requireRole(["PLAYER"]);

        const academyId = new mongoose.Types.ObjectId(user.academyId);
        const userId = new mongoose.Types.ObjectId(user.id);

        // 2. Find the logged-in player's profile
        const player = await Player.findOne({
            userId,
            academyId,
            status: "ACTIVE",
        })
            .populate("sportId", "name")
            .lean();

        if (!player) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Player profile not found or inactive.",
                },
                { status: 404 }
            );
        }

        const playerId = player._id;

        // 3. Fetch attendance summary
        const attendanceSummary = await AttendanceModel.aggregate([
            {
                $match: {
                    academyId,
                    playerId,
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const attendanceCounts: Record<string, number> = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            EXCUSED: 0,
        };

        attendanceSummary.forEach((item) => {
            attendanceCounts[item._id] = item.count;
        });

        const presentSessions = attendanceCounts.PRESENT;
        const absentSessions = attendanceCounts.ABSENT;
        const lateSessions = attendanceCounts.LATE;
        const excusedSessions = attendanceCounts.EXCUSED;

        const totalSessions =
            presentSessions +
            absentSessions +
            lateSessions +
            excusedSessions;

        const attendancePercentage =
            totalSessions > 0
                ? Math.round(
                    ((presentSessions + lateSessions) / totalSessions) * 100
                )
                : 0;

        // 4. Fetch recent attendance records
        const attendanceHistory = await AttendanceModel.find({
            academyId,
            playerId,
        })
            .populate("sessionId", "title date sportId")
            .sort({ markedAt: -1 })
            .limit(8)
            .lean();

        const recentAttendance = attendanceHistory.map((record) => {
            const session = record.sessionId as unknown as {
                title?: string;
                date?: Date;
                sportId?: unknown;
            } | null;

            return {
                id: record._id.toString(),
                date: record.markedAt,
                sessionTitle: session?.title ?? "Training session",
                sport: player.sportId && typeof player.sportId === "object" &&
                    "name" in player.sportId
                    ? player.sportId.name
                    : "Unknown sport",
                status: record.status,
                remarks: record.remarks ?? "",
            };
        });

        // 5. Fetch matches assigned to this player
        const matches = await MatchModel.find({
            academyId,
            playerIds: playerId,
            status: { $in: ["UPCOMING", "IN_PROGRESS", "COMPLETED"] },
        })
            .populate("sportId", "name")
            .sort({ date: -1 })
            .lean();

        // 6. Fetch this player's performance records
        const performanceRecords = await MatchPerformanceModel.find({
            academyId,
            playerId,
        }).lean();

        const performanceMap = new Map(
            performanceRecords.map((record) => [
                record.matchId.toString(),
                record,
            ])
        );

        const formattedMatches = matches.map((match) => {
            const performance = performanceMap.get(match._id.toString());

            const sport = match.sportId as unknown as {
                name?: string;
            } | null;

            return {
                id: match._id.toString(),
                matchCode: match.matchCode,
                name: match.name,
                sport: sport?.name ?? "Unknown sport",
                date: match.date,
                time: match.time ?? "",
                opponent: match.opponent,
                venue: match.venue ?? "",
                status: match.status,
                teamScore: match.teamScore ?? null,
                opponentScore: match.opponentScore ?? null,
                result: match.result ?? null,
                score: performance?.score ?? null,
                participationStatus:
                    performance?.participationStatus ?? null,
            };
        });

        const upcomingMatches = formattedMatches.filter(
            (match) =>
                match.status === "UPCOMING" ||
                match.status === "IN_PROGRESS"
        );

        const completedMatches = formattedMatches.filter(
            (match) => match.status === "COMPLETED"
        );

        // 7. Calculate player age
        const calculateAge = (dateOfBirth?: Date) => {
            if (!dateOfBirth) return null;

            const today = new Date();
            let age = today.getFullYear() - dateOfBirth.getFullYear();

            const hasBirthdayPassed =
                today.getMonth() > dateOfBirth.getMonth() ||
                (today.getMonth() === dateOfBirth.getMonth() &&
                    today.getDate() >= dateOfBirth.getDate());

            if (!hasBirthdayPassed) age--;

            return age;
        };

        const sportName =
            player.sportId &&
                typeof player.sportId === "object" &&
                "name" in player.sportId
                ? String(player.sportId.name)
                : "Unknown sport";

        // 8. Readiness calculation
        const readinessConditions = {
            attendance: attendancePercentage >= 75,
            completedMatches: completedMatches.length >= 2,
        };

        const ready =
            readinessConditions.attendance &&
            readinessConditions.completedMatches;

        // 9. Return player dashboard data
        return NextResponse.json({
            success: true,
            player: {
                id: player._id.toString(),
                playerCode: player.playerCode,
                name: player.name,
                email: player.email ?? "",
                phone: player.phone ?? "",
                gender: player.gender ?? "",
                age: calculateAge(player.dateOfBirth),
                dateOfBirth: player.dateOfBirth ?? null,
                sport: sportName,
                status: player.status,
                address: player.address ?? "",
                emergencyContact: player.emergencyContact ?? "",
            },
            attendance: {
                percentage: attendancePercentage,
                totalSessions,
                presentSessions,
                absentSessions,
                lateSessions,
                excusedSessions,
                history: recentAttendance,
            },
            matches: {
                upcoming: upcomingMatches,
                completed: completedMatches,
                total: formattedMatches.length,
            },
            performance: {
                totalRecords: performanceRecords.length,
                records: performanceRecords.map((record) => ({
                    matchId: record.matchId.toString(),
                    score: record.score ?? null,
                    participationStatus: record.participationStatus,
                    remarks: record.remarks ?? "",
                    updatedAt: record.updatedAt,
                })),
            },
            readiness: {
                ready,
                conditions: readinessConditions,
            },
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            const status =
                error.code === "UNAUTHENTICATED" ? 401 : 403;

            return NextResponse.json(
                { success: false, message: error.message },
                { status }
            );
        }

        console.error("Player Overview API error:", error);

        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}

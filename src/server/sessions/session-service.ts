
import "server-only";

import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import TrainingSession from "@/models/TrainingSession";
import Sport from "@/models/Sport";
import Player from "@/models/Player";
import User from "@/models/User";
import CoachAssignment from "@/models/CoachAssignment";
import { connectDB } from "@/server/database/mongodb";

import Attendance from "@/models/Attendance";

import type {
    CreateSessionData,
    UpdateSessionData,
} from "./session-validation";

export interface SessionActor {
    id: string;
    academyId: string;
    role: "HEAD_COACH" | "COACH";
}

export class SessionServiceError extends Error {
    constructor(
        public readonly code:
            | "NOT_FOUND"
            | "FORBIDDEN"
            | "INVALID_SPORT"
            | "INVALID_COACH"
            | "INVALID_PLAYERS"
            | "INVALID_STATUS"
            | "INVALID_DATE",
        message: string,
    ) {
        super(message);
        this.name = "SessionServiceError";
    }
}

/**
 * Convert both populated MongoDB references and ObjectIds
 * into their actual string IDs.
 */
function getDocumentId(value: unknown): string {
    if (
        value &&
        typeof value === "object" &&
        "_id" in value
    ) {
        return String((value as { _id: unknown })._id);
    }

    return String(value);
}

/**
 * Get all sports assigned to a coach.
 */
async function getCoachSportIds(actor: SessionActor): Promise<string[] | null> {
    if (actor.role !== "COACH") return null;

    const ids = await CoachAssignment.find({
        academyId: actor.academyId,
        coachId: actor.id,
        isHeadCoach: false,
    }).distinct("sportId");

    return ids.map(String);
}

/**
 * Check whether the current user can access a session.
 * Handles both populated and unpopulated references.
 */
async function checkSessionAccess(
    session: {
        academyId: unknown;
        coachId: unknown;
        sportId: unknown;
    },
    actor: SessionActor,
) {
    const sessionAcademyId = getDocumentId(session.academyId);

    if (sessionAcademyId !== actor.academyId) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    if (actor.role === "COACH") {
        const sportIds = await getCoachSportIds(actor);

        const sessionSportId = getDocumentId(session.sportId);
        const sessionCoachId = getDocumentId(session.coachId);

        if (
            !sportIds?.includes(sessionSportId) ||
            sessionCoachId !== actor.id
        ) {
            throw new SessionServiceError(
                "FORBIDDEN",
                "Access denied.",
            );
        }
    }
}

/**
 * Validate that a sport is active and belongs to the academy.
 */
async function validateSport(
    sportId: string,
    actor: SessionActor,
) {
    if (!mongoose.isValidObjectId(sportId)) {
        throw new SessionServiceError(
            "INVALID_SPORT",
            "Invalid sport ID.",
        );
    }

    const sport = await Sport.exists({
        _id: sportId,
        academyId: actor.academyId,
        status: "ACTIVE",
    });

    if (!sport) {
        throw new SessionServiceError(
            "INVALID_SPORT",
            "Selected sport is not active in this academy.",
        );
    }

    if (actor.role === "COACH") {
        const assignment = await CoachAssignment.exists({
            academyId: actor.academyId,
            coachId: actor.id,
            sportId,
            isHeadCoach: false,
        });

        if (!assignment) {
            throw new SessionServiceError(
                "FORBIDDEN",
                "You are not assigned to this sport.",
            );
        }
    }
}

/**
 * Validate coach assignment for the selected sport.
 */
async function validateCoach(
    coachId: string,
    sportId: string,
    actor: SessionActor,
) {
    if (!mongoose.isValidObjectId(coachId)) {
        throw new SessionServiceError(
            "INVALID_COACH",
            "Invalid coach selected.",
        );
    }

    const assignment = await CoachAssignment.exists({
        academyId: actor.academyId,
        coachId,
        sportId,
        isHeadCoach: false,
    });

    if (!assignment) {
        throw new SessionServiceError(
            "INVALID_COACH",
            "Selected coach is not assigned to this sport.",
        );
    }

    const coach = await User.exists({
        _id: coachId,
        academyId: actor.academyId,
        role: "COACH",
        status: "ACTIVE",
    });

    if (!coach) {
        throw new SessionServiceError(
            "INVALID_COACH",
            "Selected coach is not active.",
        );
    }
}

/**
 * Validate players:
 * - All players must exist.
 * - All players must belong to the academy.
 * - All players must belong to the selected sport.
 * - All players must be active.
 * - Coaches cannot select another coach's players.
 */
async function validatePlayers(
    playerIds: string[],
    sportId: string,
    actor: SessionActor,
) {
    const uniqueIds = [...new Set(playerIds)];

    if (uniqueIds.length !== playerIds.length) {
        throw new SessionServiceError(
            "INVALID_PLAYERS",
            "Duplicate players are not allowed.",
        );
    }

    if (!uniqueIds.length) {
        throw new SessionServiceError(
            "INVALID_PLAYERS",
            "Select at least one player.",
        );
    }

    if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) {
        throw new SessionServiceError(
            "INVALID_PLAYERS",
            "One or more player IDs are invalid.",
        );
    }

    const players = await Player.find({
        _id: { $in: uniqueIds },
        academyId: actor.academyId,
        sportId,
        status: "ACTIVE",
    }).select("_id coachId");

    if (players.length !== uniqueIds.length) {
        throw new SessionServiceError(
            "INVALID_PLAYERS",
            "One or more players are invalid, inactive, or belong to another sport.",
        );
    }

    if (actor.role === "COACH") {
        const unauthorized = players.some(
            (player) =>
                player.coachId &&
                getDocumentId(player.coachId) !== actor.id,
        );

        if (unauthorized) {
            throw new SessionServiceError(
                "FORBIDDEN",
                "You can only select players assigned to you.",
            );
        }
    }
}

/**
 * Generate unique session code.
 */
function makeSessionCode() {
    return `SES-${randomBytes(5).toString("hex").toUpperCase()}`;
}

/**
 * Validate and parse YYYY-MM-DD date.
 */
function parseSessionDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new SessionServiceError(
            "INVALID_DATE",
            "Invalid session date.",
        );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        throw new SessionServiceError(
            "INVALID_DATE",
            "Invalid session date.",
        );
    }

    return date;
}

/**
 * Get sessions for the current academy.
 * Coaches only see their own assigned sessions.
 */
export async function listSessions(
    actor: SessionActor,
    filters: {
        search?: string;
        sportId?: string;
        status?: string;
        date?: string;
        page: number;
        limit: number;
    },
) {
    await connectDB();

    const query: Record<string, unknown> = {
        academyId: actor.academyId,
    };

    let coachSportIds: string[] | null = null;

    if (actor.role === "COACH") {
        query.coachId = actor.id;

        coachSportIds = await getCoachSportIds(actor);

        if (!coachSportIds?.length) {
            return {
                sessions: [],
                total: 0,
                page: filters.page,
                limit: filters.limit,
                totalPages: 0,
            };
        }

        query.sportId = { $in: coachSportIds };
    }

    if (filters.sportId) {
        if (!mongoose.isValidObjectId(filters.sportId)) {
            throw new SessionServiceError(
                "INVALID_SPORT",
                "Invalid sport ID.",
            );
        }

        // Do not allow a coach to override their assigned sports.
        if (
            actor.role === "COACH" &&
            !coachSportIds?.includes(filters.sportId)
        ) {
            throw new SessionServiceError(
                "FORBIDDEN",
                "You are not assigned to this sport.",
            );
        }

        query.sportId = filters.sportId;
    }

    const allowedStatuses = [
        "SCHEDULED",
        "OPEN",
        "CLOSED",
        "CANCELLED",
    ];

    if (filters.status) {
        if (!allowedStatuses.includes(filters.status)) {
            throw new SessionServiceError(
                "INVALID_STATUS",
                "Invalid session status.",
            );
        }

        query.status = filters.status;
    }

    if (filters.date) {
        query.date = parseSessionDate(filters.date);
    }

    if (filters.search?.trim()) {
        const escaped = filters.search
            .trim()
            .slice(0, 80)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.$or = [
            { title: { $regex: escaped, $options: "i" } },
            { sessionCode: { $regex: escaped, $options: "i" } },
        ];
    }

    const page = Math.max(1, filters.page);
    const limit = Math.min(100, Math.max(1, filters.limit));
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
        TrainingSession.find(query)
            .populate("sportId", "name")
            .populate("coachId", "name email")
            .populate("playerIds", "name playerCode status")
            .sort({ date: -1, startTime: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        TrainingSession.countDocuments(query),
    ]);

    // Fetch attendance counts for all sessions on this page.
    const sessionIds = sessions.map((session) => session._id);

    const attendanceCounts = await Attendance.aggregate([
        {
            $match: {
                academyId: new mongoose.Types.ObjectId(actor.academyId),
                sessionId: { $in: sessionIds },
            },
        },
        {
            $group: {
                _id: {
                    sessionId: "$sessionId",
                    status: "$status",
                },
                count: { $sum: 1 },
            },
        },
    ]);

    const attendanceMap = new Map<
        string,
        {
            present: number;
            absent: number;
            late: number;
            excused: number;
        }
    >();

    for (const session of sessions) {
        attendanceMap.set(String(session._id), {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
        });
    }

    for (const item of attendanceCounts) {
        const sessionId = String(item._id.sessionId);
        const counts = attendanceMap.get(sessionId);

        if (!counts) continue;

        switch (item._id.status) {
            case "PRESENT":
                counts.present = item.count;
                break;
            case "ABSENT":
                counts.absent = item.count;
                break;
            case "LATE":
                counts.late = item.count;
                break;
            case "EXCUSED":
                counts.excused = item.count;
                break;
        }
    }

    const sessionsWithAttendance = sessions.map((session) => {
        const attendance = attendanceMap.get(String(session._id))!;

        return {
            ...session,
            attendance: {
                ...attendance,
                total:
                    attendance.present +
                    attendance.absent +
                    attendance.late +
                    attendance.excused,
            },
        };
    });

    return {
        sessions: sessionsWithAttendance,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return {
        sessions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get a single session by MongoDB ID.
 */
export async function getSessionById(
    id: string,
    actor: SessionActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    const session = await TrainingSession.findOne({
        _id: id,
        academyId: actor.academyId,
    })
        .populate("sportId", "name")
        .populate("coachId", "name email")
        .populate("playerIds", "name playerCode status")
        .lean();

    if (!session) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    await checkSessionAccess(session, actor);

    return session;
}

/**
 * Create a training session.
 */
export async function createSession(
    data: CreateSessionData,
    actor: SessionActor,
) {
    await connectDB();

    const sportId = data.sportId;

    const coachId =
        actor.role === "COACH"
            ? actor.id
            : data.coachId;

    if (!coachId) {
        throw new SessionServiceError(
            "INVALID_COACH",
            "Please select an assigned coach.",
        );
    }

    await validateSport(sportId, actor);
    await validateCoach(coachId, sportId, actor);
    await validatePlayers(data.playerIds, sportId, actor);

    const date = parseSessionDate(data.date);

    const session = await TrainingSession.create({
        academyId: actor.academyId,
        sessionCode: makeSessionCode(),
        title: data.title,
        sportId,
        coachId,
        playerIds: data.playerIds,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: "SCHEDULED",
    });

    // Access check now correctly handles populated references.
    return getSessionById(String(session._id), actor);
}

/**
 * Update an existing scheduled session.
 */
export async function updateSession(
    id: string,
    data: UpdateSessionData,
    actor: SessionActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    const session = await TrainingSession.findOne({
        _id: id,
        academyId: actor.academyId,
    });

    if (!session) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    await checkSessionAccess(session, actor);

    if (session.status !== "SCHEDULED") {
        throw new SessionServiceError(
            "INVALID_STATUS",
            "Only scheduled sessions can be edited.",
        );
    }

    const sportId = data.sportId ?? getDocumentId(session.sportId);

    const coachId =
        actor.role === "COACH"
            ? actor.id
            : data.coachId ?? getDocumentId(session.coachId);

    await validateSport(sportId, actor);
    await validateCoach(coachId, sportId, actor);

    const playerIds =
        data.playerIds ?? session.playerIds.map(getDocumentId);

    await validatePlayers(playerIds, sportId, actor);

    if (data.title !== undefined) {
        session.title = data.title;
    }

    if (data.sportId !== undefined) {
        session.sportId = new mongoose.Types.ObjectId(sportId);
    }

    if (data.coachId !== undefined || actor.role === "COACH") {
        session.coachId = new mongoose.Types.ObjectId(coachId);
    }

    if (data.playerIds !== undefined) {
        session.playerIds = playerIds.map(
            (playerId) => new mongoose.Types.ObjectId(playerId),
        );
    }

    if (data.date !== undefined) {
        session.date = parseSessionDate(data.date);
    }

    if (data.startTime !== undefined) {
        session.startTime = data.startTime;
    }

    if (data.endTime !== undefined) {
        session.endTime = data.endTime;
    }

    if (data.notes !== undefined) {
        session.notes = data.notes;
    }

    await session.save();

    return getSessionById(id, actor);
}

/**
 * Update session status.
 *
 * Allowed transitions:
 * SCHEDULED -> OPEN
 * SCHEDULED -> CLOSED
 * SCHEDULED -> CANCELLED
 * OPEN -> CLOSED
 * OPEN -> CANCELLED
 *
 * Closed and cancelled sessions cannot be changed.
 */
export async function updateSessionStatus(
    id: string,
    status: "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED",
    actor: SessionActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    const session = await TrainingSession.findOne({
        _id: id,
        academyId: actor.academyId,
    });

    if (!session) {
        throw new SessionServiceError(
            "NOT_FOUND",
            "Session not found.",
        );
    }

    await checkSessionAccess(session, actor);

    if (
        session.status === "CANCELLED" ||
        session.status === "CLOSED"
    ) {
        throw new SessionServiceError(
            "INVALID_STATUS",
            "Closed or cancelled sessions cannot be changed.",
        );
    }

    if (
        status === "SCHEDULED" ||
        (session.status === "OPEN" && status === "OPEN")
    ) {
        throw new SessionServiceError(
            "INVALID_STATUS",
            "Invalid session status transition.",
        );
    }

    session.status = status;
    await session.save();

    return {
        sessionId: String(session._id),
        status: session.status,
    };
}

/**
 * Get active sports, coaches and players for session forms.
 */
export async function getSessionOptions(
    actor: SessionActor,
    sportId?: string,
) {
    await connectDB();

    const sportQuery: Record<string, unknown> = {
        academyId: actor.academyId,
        status: "ACTIVE",
    };

    if (actor.role === "COACH") {
        const sportIds = await getCoachSportIds(actor);

        sportQuery._id = {
            $in: sportIds ?? [],
        };
    }

    const sports = await Sport.find(sportQuery)
        .select("_id name")
        .sort({ name: 1 })
        .lean();

    const availableSportIds = sports.map(
        (sport) => String(sport._id),
    );

    let selectedSportId = sportId;

    if (!selectedSportId) {
        selectedSportId =
            actor.role === "COACH" && sports.length === 1
                ? String(sports[0]._id)
                : undefined;
    }

    let coaches: {
        id: string;
        name: string;
        email: string;
    }[] = [];

    let players: {
        id: string;
        name: string;
        playerCode: string;
    }[] = [];

    if (selectedSportId) {
        if (!mongoose.isValidObjectId(selectedSportId)) {
            throw new SessionServiceError(
                "INVALID_SPORT",
                "Invalid sport ID.",
            );
        }

        if (!availableSportIds.includes(selectedSportId)) {
            throw new SessionServiceError(
                "FORBIDDEN",
                "You do not have access to this sport.",
            );
        }

        const assignments = await CoachAssignment.find({
            academyId: actor.academyId,
            sportId: selectedSportId,
            isHeadCoach: false,
        }).distinct("coachId");

        if (actor.role === "COACH") {
            coaches = await User.find({
                _id: actor.id,
                academyId: actor.academyId,
                role: "COACH",
                status: "ACTIVE",
            })
                .select("name email")
                .lean()
                .then((rows) =>
                    rows.map((row) => ({
                        id: String(row._id),
                        name: row.name,
                        email: row.email,
                    })),
                );
        } else {
            coaches = await User.find({
                _id: { $in: assignments },
                academyId: actor.academyId,
                role: "COACH",
                status: "ACTIVE",
            })
                .select("name email")
                .lean()
                .then((rows) =>
                    rows.map((row) => ({
                        id: String(row._id),
                        name: row.name,
                        email: row.email,
                    })),
                );
        }

        const playerQuery: Record<string, unknown> = {
            academyId: actor.academyId,
            sportId: selectedSportId,
            status: "ACTIVE",
        };

        if (actor.role === "COACH") {
            playerQuery.$or = [
                { coachId: actor.id },
                { coachId: { $exists: false } },
                { coachId: null },
            ];
        }

        players = await Player.find(playerQuery)
            .select("name playerCode")
            .sort({ name: 1 })
            .lean()
            .then((rows) =>
                rows.map((row) => ({
                    id: String(row._id),
                    name: row.name,
                    playerCode: row.playerCode,
                })),
            );
    }

    return {
        sports: sports.map((sport) => ({
            id: String(sport._id),
            name: sport.name,
        })),
        coaches,
        players,
    };
}

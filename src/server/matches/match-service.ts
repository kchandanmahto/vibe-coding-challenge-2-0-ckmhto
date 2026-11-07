
import "server-only";

import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import MatchModel from "@/models/Match";
import TrainingSession from "@/models/TrainingSession";
import Sport from "@/models/Sport";
import Player from "@/models/Player";
import CoachAssignment from "@/models/CoachAssignment";
import Attendance from "@/models/Attendance";

import { connectDB } from "@/server/database/mongodb";

import type {
    CreateMatchData,
    UpdateMatchData,
    UpdateMatchStatusData,
} from "./match-validation";

export interface MatchActor {
    id: string;
    academyId: string;
    role: "HEAD_COACH" | "COACH";
}

export class MatchServiceError extends Error {
    constructor(
        public readonly code:
            | "NOT_FOUND"
            | "FORBIDDEN"
            | "INVALID_SPORT"
            | "INVALID_SESSION"
            | "INVALID_PLAYERS"
            | "INVALID_STATUS"
            | "INVALID_DATE",
        message: string,
    ) {
        super(message);
        this.name = "MatchServiceError";
    }
}

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

function makeMatchCode() {
    return `MAT-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function parseMatchDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new MatchServiceError(
            "INVALID_DATE",
            "Invalid match date.",
        );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        throw new MatchServiceError(
            "INVALID_DATE",
            "Invalid match date.",
        );
    }

    return date;
}

async function getCoachSportIds(actor: MatchActor) {
    if (actor.role !== "COACH") return null;

    const ids = await CoachAssignment.find({
        academyId: actor.academyId,
        coachId: actor.id,
        isHeadCoach: false,
    }).distinct("sportId");

    return ids.map(String);
}

async function getCoachSessionIds(actor: MatchActor) {
    if (actor.role !== "COACH") return null;

    const sessions = await TrainingSession.find({
        academyId: actor.academyId,
        coachId: actor.id,
    }).select("_id");

    return sessions.map((session) => String(session._id));
}

async function validateSport(
    sportId: string,
    actor: MatchActor,
) {
    if (!mongoose.isValidObjectId(sportId)) {
        throw new MatchServiceError(
            "INVALID_SPORT",
            "Invalid sport selected.",
        );
    }

    const sport = await Sport.exists({
        _id: sportId,
        academyId: actor.academyId,
        status: "ACTIVE",
    });

    if (!sport) {
        throw new MatchServiceError(
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
            throw new MatchServiceError(
                "FORBIDDEN",
                "You are not assigned to this sport.",
            );
        }
    }
}

async function validateSession(
    sessionId: string,
    sportId: string,
    actor: MatchActor,
) {
    if (!mongoose.isValidObjectId(sessionId)) {
        throw new MatchServiceError(
            "INVALID_SESSION",
            "Invalid training session.",
        );
    }

    const session = await TrainingSession.findOne({
        _id: sessionId,
        academyId: actor.academyId,
    });

    if (!session) {
        throw new MatchServiceError(
            "INVALID_SESSION",
            "Training session not found.",
        );
    }

    if (String(session.sportId) !== sportId) {
        throw new MatchServiceError(
            "INVALID_SESSION",
            "The selected session belongs to another sport.",
        );
    }

    if (session.status !== "CLOSED") {
        throw new MatchServiceError(
            "INVALID_SESSION",
            "Only closed training sessions can be linked to a match.",
        );
    }

    if (actor.role === "COACH") {
        if (String(session.coachId) !== actor.id) {
            throw new MatchServiceError(
                "FORBIDDEN",
                "You can only use your own training sessions.",
            );
        }
    }

    return session;
}

async function validateMatchPlayers(
    playerIds: string[],
    sessionId: string,
    sportId: string,
    actor: MatchActor,
) {
    const uniqueIds = [...new Set(playerIds)];

    if (!uniqueIds.length || uniqueIds.length !== playerIds.length) {
        throw new MatchServiceError(
            "INVALID_PLAYERS",
            "Select at least one unique player.",
        );
    }

    if (uniqueIds.some((id) => !mongoose.isValidObjectId(id))) {
        throw new MatchServiceError(
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
        throw new MatchServiceError(
            "INVALID_PLAYERS",
            "One or more players are invalid, inactive, or belong to another sport.",
        );
    }

    const session = await TrainingSession.findOne({
        _id: sessionId,
        academyId: actor.academyId,
    }).select("playerIds");

    if (!session) {
        throw new MatchServiceError(
            "INVALID_SESSION",
            "Training session not found.",
        );
    }

    const sessionPlayerIds = new Set(
        session.playerIds.map((id) => String(id)),
    );

    if (uniqueIds.some((id) => !sessionPlayerIds.has(id))) {
        throw new MatchServiceError(
            "INVALID_PLAYERS",
            "Players must belong to the selected training session.",
        );
    }

    const attendanceRecords = await Attendance.find({
        academyId: actor.academyId,
        sessionId,
        playerId: { $in: uniqueIds },
        status: { $in: ["PRESENT", "LATE"] },
    }).select("playerId");

    const eligibleIds = new Set(
        attendanceRecords.map((record) => String(record.playerId)),
    );

    if (uniqueIds.some((id) => !eligibleIds.has(id))) {
        throw new MatchServiceError(
            "INVALID_PLAYERS",
            "Only players marked PRESENT or LATE in the selected session can participate.",
        );
    }

    if (actor.role === "COACH") {
        const unauthorized = players.some(
            (player) =>
                player.coachId &&
                getDocumentId(player.coachId) !== actor.id,
        );

        if (unauthorized) {
            throw new MatchServiceError(
                "FORBIDDEN",
                "You can only select players assigned to you.",
            );
        }
    }
}

async function checkMatchAccess(
    match: {
        academyId: unknown;
        sportId: unknown;
        sessionId?: unknown;
    },
    actor: MatchActor,
) {
    if (getDocumentId(match.academyId) !== actor.academyId) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    if (actor.role === "COACH") {
        const sportIds = await getCoachSportIds(actor);
        const sessionIds = await getCoachSessionIds(actor);

        const sportId = getDocumentId(match.sportId);
        const sessionId = match.sessionId
            ? getDocumentId(match.sessionId)
            : "";

        if (
            !sportIds?.includes(sportId) ||
            !sessionIds?.includes(sessionId)
        ) {
            throw new MatchServiceError(
                "FORBIDDEN",
                "Access denied.",
            );
        }
    }
}

export async function listMatches(
    actor: MatchActor,
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

    if (actor.role === "COACH") {
        const [sportIds, sessionIds] = await Promise.all([
            getCoachSportIds(actor),
            getCoachSessionIds(actor),
        ]);

        if (!sportIds?.length || !sessionIds?.length) {
            return {
                matches: [],
                total: 0,
                page: filters.page,
                limit: filters.limit,
                totalPages: 0,
            };
        }

        query.sportId = { $in: sportIds };
        query.sessionId = { $in: sessionIds };
    }

    if (filters.sportId) {
        if (!mongoose.isValidObjectId(filters.sportId)) {
            throw new MatchServiceError(
                "INVALID_SPORT",
                "Invalid sport ID.",
            );
        }

        if (
            actor.role === "COACH" &&
            !(query.sportId as { $in: string[] }).$in.includes(
                filters.sportId,
            )
        ) {
            throw new MatchServiceError(
                "FORBIDDEN",
                "You are not assigned to this sport.",
            );
        }

        query.sportId = filters.sportId;
    }

    const allowedStatuses = [
        "UPCOMING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
    ];

    if (filters.status) {
        if (!allowedStatuses.includes(filters.status)) {
            throw new MatchServiceError(
                "INVALID_STATUS",
                "Invalid match status.",
            );
        }

        query.status = filters.status;
    }

    if (filters.date) {
        query.date = parseMatchDate(filters.date);
    }

    if (filters.search?.trim()) {
        const escaped = filters.search
            .trim()
            .slice(0, 80)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.$or = [
            { name: { $regex: escaped, $options: "i" } },
            { opponent: { $regex: escaped, $options: "i" } },
            { matchCode: { $regex: escaped, $options: "i" } },
        ];
    }

    const page = Math.max(1, filters.page);
    const limit = Math.min(100, Math.max(1, filters.limit));
    const skip = (page - 1) * limit;

    const [matches, total] = await Promise.all([
        MatchModel.find(query)
            .populate("sportId", "name")
            .populate("sessionId", "sessionCode title date")
            .populate("playerIds", "name playerCode status")
            .populate("createdBy", "name email")
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        MatchModel.countDocuments(query),
    ]);

    return {
        matches,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getMatchById(
    id: string,
    actor: MatchActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    const match = await MatchModel.findOne({
        _id: id,
        academyId: actor.academyId,
    })
        .populate("sportId", "name")
        .populate("sessionId", "sessionCode title date")
        .populate("playerIds", "name playerCode status")
        .populate("createdBy", "name email");

    if (!match) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    await checkMatchAccess(match, actor);

    return match;
}

export async function createMatch(
    data: CreateMatchData,
    actor: MatchActor,
) {
    await connectDB();

    await validateSport(data.sportId, actor);

    await validateSession(
        data.sessionId,
        data.sportId,
        actor,
    );

    await validateMatchPlayers(
        data.playerIds,
        data.sessionId,
        data.sportId,
        actor,
    );

    const match = await MatchModel.create({
        academyId: actor.academyId,
        matchCode: makeMatchCode(),
        name: data.name,
        sportId: data.sportId,
        date: parseMatchDate(data.date),
        time: data.time,
        type: data.type,
        opponent: data.opponent,
        description: data.description,
        venue: data.venue,
        playerIds: data.playerIds,
        sessionId: data.sessionId,
        status: "UPCOMING",
        createdBy: actor.id,
    });

    return getMatchById(String(match._id), actor);
}

export async function updateMatch(
    id: string,
    data: UpdateMatchData,
    actor: MatchActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    const match = await MatchModel.findOne({
        _id: id,
        academyId: actor.academyId,
    });

    if (!match) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    await checkMatchAccess(match, actor);

    if (match.status !== "UPCOMING") {
        throw new MatchServiceError(
            "INVALID_STATUS",
            "Only upcoming matches can be edited.",
        );
    }

    const sportId = data.sportId ?? String(match.sportId);
    const sessionId = data.sessionId ?? String(match.sessionId);

    const playerIds =
        data.playerIds ?? match.playerIds.map(String);

    await validateSport(sportId, actor);
    await validateSession(sessionId, sportId, actor);

    await validateMatchPlayers(
        playerIds,
        sessionId,
        sportId,
        actor,
    );

    if (data.name !== undefined) match.name = data.name;
    if (data.sportId !== undefined) {
        match.sportId = new mongoose.Types.ObjectId(sportId);
    }
    if (data.date !== undefined) {
        match.date = parseMatchDate(data.date);
    }
    if (data.time !== undefined) match.time = data.time;
    if (data.type !== undefined) match.type = data.type;
    if (data.opponent !== undefined) match.opponent = data.opponent;
    if (data.description !== undefined) {
        match.description = data.description;
    }
    if (data.venue !== undefined) match.venue = data.venue;
    if (data.playerIds !== undefined) {
        match.playerIds = playerIds.map(
            (playerId) => new mongoose.Types.ObjectId(playerId),
        );
    }
    if (data.sessionId !== undefined) {
        match.sessionId = new mongoose.Types.ObjectId(sessionId);
    }

    await match.save();

    return getMatchById(id, actor);
}

export async function updateMatchStatus(
    id: string,
    data: UpdateMatchStatusData,
    actor: MatchActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    const match = await MatchModel.findOne({
        _id: id,
        academyId: actor.academyId,
    });

    if (!match) {
        throw new MatchServiceError(
            "NOT_FOUND",
            "Match not found.",
        );
    }

    await checkMatchAccess(match, actor);

    if (
        match.status === "COMPLETED" ||
        match.status === "CANCELLED"
    ) {
        throw new MatchServiceError(
            "INVALID_STATUS",
            "Completed or cancelled matches cannot be changed.",
        );
    }

    if (data.status === "UPCOMING") {
        throw new MatchServiceError(
            "INVALID_STATUS",
            "A match cannot be moved back to upcoming.",
        );
    }

    if (data.status === "COMPLETED") {
        if (
            data.teamScore === undefined ||
            data.opponentScore === undefined
        ) {
            throw new MatchServiceError(
                "INVALID_STATUS",
                "Both team and opponent scores are required to complete a match.",
            );
        }

        match.teamScore = data.teamScore;
        match.opponentScore = data.opponentScore;

        match.result =
            data.teamScore > data.opponentScore
                ? "WIN"
                : data.teamScore < data.opponentScore
                    ? "LOSS"
                    : "DRAW";
    }

    if (data.status === "IN_PROGRESS") {
        if (match.status !== "UPCOMING") {
            throw new MatchServiceError(
                "INVALID_STATUS",
                "Invalid match status transition.",
            );
        }
    }

    if (data.status === "CANCELLED") {
        match.result = "NO_RESULT";
    }

    match.status = data.status;

    await match.save();

    return {
        matchId: String(match._id),
        status: match.status,
        teamScore: match.teamScore,
        opponentScore: match.opponentScore,
        result: match.result,
    };
}

export async function getMatchOptions(
    actor: MatchActor,
    sessionId?: string,
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

    const sessionQuery: Record<string, unknown> = {
        academyId: actor.academyId,
        status: "CLOSED",
    };

    if (actor.role === "COACH") {
        sessionQuery.coachId = actor.id;
    }

    const sessions = await TrainingSession.find(sessionQuery)
        .populate("sportId", "name")
        .select("_id sessionCode title sportId date")
        .sort({ date: -1 })
        .limit(100)
        .lean();

    let eligiblePlayers: {
        id: string;
        name: string;
        playerCode: string;
    }[] = [];

    if (sessionId) {
        if (!mongoose.isValidObjectId(sessionId)) {
            throw new MatchServiceError(
                "INVALID_SESSION",
                "Invalid session ID.",
            );
        }

        const session = await TrainingSession.findOne({
            _id: sessionId,
            academyId: actor.academyId,
            status: "CLOSED",
        }).lean();

        if (!session) {
            throw new MatchServiceError(
                "INVALID_SESSION",
                "Closed training session not found.",
            );
        }

        if (
            actor.role === "COACH" &&
            String(session.coachId) !== actor.id
        ) {
            throw new MatchServiceError(
                "FORBIDDEN",
                "You can only select your own sessions.",
            );
        }

        const attendance = await Attendance.find({
            academyId: actor.academyId,
            sessionId,
            status: { $in: ["PRESENT", "LATE"] },
        }).select("playerId");

        const playerIds = attendance.map(
            (record) => record.playerId,
        );

        const playerQuery: Record<string, unknown> = {
            _id: { $in: playerIds },
            academyId: actor.academyId,
            sportId: session.sportId,
            status: "ACTIVE",
        };

        if (actor.role === "COACH") {
            playerQuery.$or = [
                { coachId: actor.id },
                { coachId: { $exists: false } },
                { coachId: null },
            ];
        }

        const players = await Player.find(playerQuery)
            .select("_id name playerCode")
            .sort({ name: 1 })
            .lean();

        eligiblePlayers = players.map((player) => ({
            id: String(player._id),
            name: player.name,
            playerCode: player.playerCode,
        }));
    }

    return {
        sports: sports.map((sport) => ({
            id: String(sport._id),
            name: sport.name,
        })),
        sessions: sessions.map((session) => ({
            id: String(session._id),
            sessionCode: session.sessionCode,
            title: session.title,
            sportId: getDocumentId(session.sportId),
            sportName:
                session.sportId &&
                    typeof session.sportId === "object" &&
                    "name" in session.sportId
                    ? String(session.sportId.name)
                    : "",
            date: session.date,
        })),
        players: eligiblePlayers,
    };
}

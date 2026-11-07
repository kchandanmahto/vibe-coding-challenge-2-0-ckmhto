
import "server-only";

import mongoose from "mongoose";
import MatchModel from "@/models/Match";
import MatchPerformanceModel from "@/models/MatchPerformance";
import TrainingSessionModel from "@/models/TrainingSession";
import CoachAssignmentModel from "@/models/CoachAssignment";
import type { SaveMatchPerformanceData } from "./performance-validation";

export interface PerformanceActor {
    id: string;
    academyId: string;
    role: "HEAD_COACH" | "COACH";
}

export class PerformanceServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = "PerformanceServiceError";
        this.statusCode = statusCode;
    }
}

function toObjectId(value: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new PerformanceServiceError("Invalid ID.", 400);
    }

    return new mongoose.Types.ObjectId(value);
}

function getDocumentId(value: unknown): string {
    if (!value) return "";

    if (typeof value === "string") return value;

    if (value instanceof mongoose.Types.ObjectId) {
        return value.toString();
    }

    if (typeof value === "object" && "toString" in value) {
        return String(value);
    }

    return "";
}

async function validateActorMatchAccess(
    actor: PerformanceActor,
    matchId: string
) {
    const academyId = toObjectId(actor.academyId);
    const matchObjectId = toObjectId(matchId);
    const actorId = toObjectId(actor.id);

    const match = await MatchModel.findOne({
        _id: matchObjectId,
        academyId,
    }).lean();

    if (!match) {
        throw new PerformanceServiceError("Match not found.", 404);
    }

    if (actor.role === "COACH") {
        const assignments = await CoachAssignmentModel.find({
            academyId,
            coachId: actorId,
            isHeadCoach: false,
            sportId: match.sportId,
        }).lean();

        if (assignments.length === 0) {
            throw new PerformanceServiceError(
                "You do not have access to this match.",
                403
            );
        }

        if (!match.sessionId) {
            throw new PerformanceServiceError(
                "This match is not linked to a training session.",
                403
            );
        }

        const session = await TrainingSessionModel.findOne({
            _id: match.sessionId,
            academyId,
            coachId: actorId,
            sportId: match.sportId,
            status: "CLOSED",
        }).lean();

        if (!session) {
            throw new PerformanceServiceError(
                "You do not have access to this match session.",
                403
            );
        }
    }

    return match;
}

export async function getMatchPerformances(
    actor: PerformanceActor,
    matchId: string
) {
    const match = await validateActorMatchAccess(actor, matchId);

    const performances = await MatchPerformanceModel.find({
        academyId: toObjectId(actor.academyId),
        matchId: toObjectId(matchId),
    })
        .populate("playerId", "playerCode name sportId")
        .populate("recordedBy", "name email")
        .sort({ createdAt: 1 })
        .lean();

    return {
        match,
        performances,
    };
}

export async function saveMatchPerformances(
    actor: PerformanceActor,
    matchId: string,
    data: SaveMatchPerformanceData
) {
    const match = await validateActorMatchAccess(actor, matchId);

    if (match.status !== "COMPLETED") {
        throw new PerformanceServiceError(
            "Performance can only be recorded for completed matches."
        );
    }

    const matchPlayerIds = match.playerIds.map(getDocumentId);
    const submittedPlayerIds = data.performances.map(
        (item) => item.playerId
    );

    if (matchPlayerIds.length === 0) {
        throw new PerformanceServiceError(
            "No players are assigned to this match."
        );
    }

    const matchPlayerSet = new Set(matchPlayerIds);
    const submittedPlayerSet = new Set(submittedPlayerIds);

    const extraPlayers = submittedPlayerIds.filter(
        (id) => !matchPlayerSet.has(id)
    );

    if (extraPlayers.length > 0) {
        throw new PerformanceServiceError(
            "Some submitted players are not part of this match."
        );
    }

    const missingPlayers = matchPlayerIds.filter(
        (id) => !submittedPlayerSet.has(id)
    );

    if (missingPlayers.length > 0) {
        throw new PerformanceServiceError(
            "Performance must be submitted for every player in the match."
        );
    }

    const academyId = toObjectId(actor.academyId);
    const matchObjectId = toObjectId(matchId);
    const recordedBy = toObjectId(actor.id);

    const operations = data.performances.map((item) => {
        const setFields: Record<string, unknown> = {
            participationStatus: item.participationStatus,
            recordedBy,
        };

        const unsetFields: Record<string, number> = {};

        if (item.score !== undefined) {
            setFields.score = item.score;
        } else {
            unsetFields.score = 1;
        }

        if (item.remarks) {
            setFields.remarks = item.remarks;
        } else {
            unsetFields.remarks = 1;
        }

        if (item.metrics !== undefined) {
            setFields.metrics = item.metrics;
        }

        return {
            updateOne: {
                filter: {
                    academyId,
                    matchId: matchObjectId,
                    playerId: toObjectId(item.playerId),
                },
                update: {
                    $set: setFields,
                    ...(Object.keys(unsetFields).length > 0
                        ? { $unset: unsetFields }
                        : {}),
                    $setOnInsert: {
                        academyId,
                        matchId: matchObjectId,
                        playerId: toObjectId(item.playerId),
                    },
                },
                upsert: true,
            },
        };
    });

    await MatchPerformanceModel.bulkWrite(operations, {
        ordered: true,
    });

    return getMatchPerformances(actor, matchId);
}

export async function getPerformanceHistory(
    actor: PerformanceActor,
    page = 1,
    limit = 20
) {
    const academyId = toObjectId(actor.academyId);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const filter: Record<string, unknown> = {
        academyId,
    };

    if (actor.role === "COACH") {
        const assignments = await CoachAssignmentModel.find({
            academyId,
            coachId: toObjectId(actor.id),
            isHeadCoach: false,
        })
            .select("sportId")
            .lean();

        const sportIds = assignments
            .map((assignment) => getDocumentId(assignment.sportId))
            .filter((id) => id.length > 0)
            .map(toObjectId);

        if (sportIds.length === 0) {
            return {
                performances: [],
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }

        const matches = await MatchModel.find({
            academyId,
            sportId: { $in: sportIds },
            status: "COMPLETED",
        })
            .select("_id")
            .lean();

        filter.matchId = {
            $in: matches.map((match) => match._id),
        };
    }

    const [performances, total] = await Promise.all([
        MatchPerformanceModel.find(filter)
            .populate("playerId", "playerCode name")
            .populate(
                "matchId",
                "matchCode name date opponent sportId result teamScore opponentScore"
            )
            .populate("recordedBy", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),

        MatchPerformanceModel.countDocuments(filter),
    ]);

    return {
        performances,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
}

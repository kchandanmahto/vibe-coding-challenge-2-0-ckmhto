
import "server-only";

import mongoose from "mongoose";

import Player from "@/models/Player";
import User from "@/models/User";
import Sport from "@/models/Sport";
import CoachAssignment from "@/models/CoachAssignment";
import { connectDB } from "@/server/database/mongodb";

import type { UpdatePlayerData } from "./player-validation";

export interface PlayerActor {
    id: string;
    academyId: string;
    role: "HEAD_COACH" | "COACH";
}

export class PlayerServiceError extends Error {
    constructor(
        public readonly code:
            | "NOT_FOUND"
            | "FORBIDDEN"
            | "INVALID_SPORT"
            | "INVALID_COACH"
            | "EMAIL_EXISTS"
            | "INVALID_STATUS",
        message: string,
    ) {
        super(message);
        this.name = "PlayerServiceError";
    }
}

async function getCoachSportIds(actor: PlayerActor) {
    if (actor.role !== "COACH") return null;

    const assignments = await CoachAssignment.find({
        academyId: actor.academyId,
        coachId: actor.id,
        isHeadCoach: false,
    }).distinct("sportId");

    return assignments.map(String);
}

async function checkPlayerAccess(
    player: { academyId: unknown; sportId: unknown },
    actor: PlayerActor,
) {
    if (String(player.academyId) !== actor.academyId) {
        throw new PlayerServiceError("NOT_FOUND", "Player not found.");
    }

    if (actor.role === "COACH") {
        const sportIds = await getCoachSportIds(actor);

        if (!sportIds?.includes(String(player.sportId))) {
            throw new PlayerServiceError("FORBIDDEN", "Access denied.");
        }
    }
}

export async function listPlayers(
    actor: PlayerActor,
    filters: {
        search?: string;
        sportId?: string;
        coachId?: string;
        status?: string;
        page: number;
        limit: number;
    },
) {
    await connectDB();

    const query: Record<string, unknown> = {
        academyId: actor.academyId,
    };

    if (actor.role === "COACH") {
        const sportIds = await getCoachSportIds(actor);

        if (!sportIds?.length) {
            return { players: [], total: 0, page: filters.page, limit: filters.limit };
        }

        query.sportId = { $in: sportIds };
    }

    if (filters.sportId) {
        if (!mongoose.isValidObjectId(filters.sportId)) {
            throw new PlayerServiceError("INVALID_SPORT", "Invalid sport ID.");
        }

        if (actor.role === "COACH") {
            const sportIds = await getCoachSportIds(actor);
            if (!sportIds?.includes(filters.sportId)) {
                throw new PlayerServiceError("FORBIDDEN", "Access denied.");
            }
        }

        query.sportId = filters.sportId;
    }

    if (filters.coachId) {
        if (!mongoose.isValidObjectId(filters.coachId)) {
            throw new PlayerServiceError("INVALID_COACH", "Invalid coach ID.");
        }

        query.coachId = filters.coachId;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.search) {
        const search = filters.search.trim().slice(0, 80);
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.$or = [
            { name: { $regex: escaped, $options: "i" } },
            { email: { $regex: escaped, $options: "i" } },
            { playerCode: { $regex: escaped, $options: "i" } },
        ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [players, total] = await Promise.all([
        Player.find(query)
            .populate("sportId", "name")
            .populate("coachId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(filters.limit)
            .lean(),
        Player.countDocuments(query),
    ]);

    return {
        players,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
    };
}

export async function getPlayerById(
    id: string,
    actor: PlayerActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new PlayerServiceError("NOT_FOUND", "Player not found.");
    }

    const player = await Player.findOne({
        _id: id,
        academyId: actor.academyId,
    })
        .populate("sportId", "name")
        .populate("coachId", "name email")
        .lean();

    if (!player) {
        throw new PlayerServiceError("NOT_FOUND", "Player not found.");
    }

    await checkPlayerAccess(player, actor);

    return player;
}

export async function updatePlayer(
    id: string,
    data: UpdatePlayerData,
    actor: PlayerActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new PlayerServiceError("NOT_FOUND", "Player not found.");
    }

    const session = await mongoose.connection.startSession();

    try {
        let updatedPlayer = null;

        await session.withTransaction(async () => {
            const player = await Player.findOne({
                _id: id,
                academyId: actor.academyId,
            }).session(session);

            if (!player) {
                throw new PlayerServiceError("NOT_FOUND", "Player not found.");
            }

            await checkPlayerAccess(player, actor);

            if (data.email) {
                const existing = await User.findOne({
                    email: data.email,
                    _id: { $ne: player.userId },
                }).session(session);

                if (existing) {
                    throw new PlayerServiceError(
                        "EMAIL_EXISTS",
                        "This email is already registered.",
                    );
                }
            }

            const sportId = data.sportId ?? String(player.sportId);

            if (data.sportId) {
                const sport = await Sport.exists({
                    _id: data.sportId,
                    academyId: actor.academyId,
                    status: "ACTIVE",
                }).session(session);

                if (!sport) {
                    throw new PlayerServiceError(
                        "INVALID_SPORT",
                        "Selected sport is not active.",
                    );
                }
            }

            let coachId = data.coachId === null
                ? undefined
                : data.coachId ?? (player.coachId ? String(player.coachId) : undefined);

            if (actor.role === "COACH") {
                const assignment = await CoachAssignment.exists({
                    academyId: actor.academyId,
                    coachId: actor.id,
                    sportId,
                    isHeadCoach: false,
                }).session(session);

                if (!assignment) {
                    throw new PlayerServiceError(
                        "INVALID_SPORT",
                        "You are not assigned to the selected sport.",
                    );
                }

                coachId = actor.id;
            } else if (coachId) {
                const assignment = await CoachAssignment.exists({
                    academyId: actor.academyId,
                    coachId,
                    sportId,
                    isHeadCoach: false,
                }).session(session);

                if (!assignment) {
                    throw new PlayerServiceError(
                        "INVALID_COACH",
                        "Selected coach is not assigned to this sport.",
                    );
                }
            }

            const update: Record<string, unknown> = {};

            for (const key of [
                "name",
                "dateOfBirth",
                "gender",
                "phone",
                "address",
                "emergencyContact",
            ] as const) {
                if (data[key] !== undefined) {
                    update[key] = data[key];
                }
            }

            if (data.email !== undefined) update.email = data.email;
            if (data.sportId !== undefined) update.sportId = sportId;

            if (data.coachId !== undefined || actor.role === "COACH") {
                update.coachId = coachId;
            }

            Object.assign(player, update);
            await player.save({ session });

            if (player.userId) {
                const userUpdate: Record<string, unknown> = {};

                if (data.name !== undefined) userUpdate.name = data.name;
                if (data.email !== undefined) userUpdate.email = data.email;

                if (Object.keys(userUpdate).length) {
                    await User.updateOne(
                        { _id: player.userId, academyId: actor.academyId },
                        { $set: userUpdate },
                        { session },
                    );
                }
            }

            updatedPlayer = player.toObject();
        });

        return updatedPlayer;
    } catch (error) {
        if (error instanceof PlayerServiceError) throw error;

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new PlayerServiceError(
                "EMAIL_EXISTS",
                "This email is already registered.",
            );
        }

        throw error;
    } finally {
        await session.endSession();
    }
}

export async function updatePlayerStatus(
    id: string,
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
    actor: PlayerActor,
) {
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
        throw new PlayerServiceError("NOT_FOUND", "Player not found.");
    }

    const session = await mongoose.connection.startSession();

    try {
        let result: {
            playerId: string;
            status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        } | null = null;

        await session.withTransaction(async () => {
            const player = await Player.findOne({
                _id: id,
                academyId: actor.academyId,
            }).session(session);

            if (!player) {
                throw new PlayerServiceError("NOT_FOUND", "Player not found.");
            }

            await checkPlayerAccess(player, actor);

            player.status = status;
            await player.save({ session });

            if (player.userId) {
                await User.updateOne(
                    { _id: player.userId, academyId: actor.academyId },
                    {
                        $set: { status },
                        $inc: { authSessionVersion: 1 },
                    },
                    { session },
                );
            }

            result = { playerId: String(player._id), status };
        });

        if (!result) {
            throw new Error("Player status update failed.");
        }

        return result;
    } finally {
        await session.endSession();
    }
}

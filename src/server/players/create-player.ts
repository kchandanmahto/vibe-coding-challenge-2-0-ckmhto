
import "server-only";

import mongoose from "mongoose";
import { randomBytes } from "crypto";

import User from "@/models/User";
import Player from "@/models/Player";
import Sport from "@/models/Sport";
import CoachAssignment from "@/models/CoachAssignment";
import PasswordResetToken from "@/models/PasswordResetToken";

import { connectDB } from "@/server/database/mongodb";
import {
    createPasswordResetToken,
    hashPasswordResetToken,
    PASSWORD_RESET_TTL_MS,
} from "@/server/auth/password-reset";
import { sendPasswordResetEmail } from "@/server/email/password-reset";

export interface CreatePlayerInput {
    academyId: string;
    actorId: string;
    actorRole: "HEAD_COACH" | "COACH";
    name: string;
    email: string;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    sportId: string;
    coachId?: string;
    phone?: string;
    address?: string;
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
    };
}

export class PlayerCreationError extends Error {
    constructor(
        public readonly code:
            | "EMAIL_EXISTS"
            | "INVALID_SPORT"
            | "INVALID_COACH"
            | "CREATION_FAILED",
        message: string,
    ) {
        super(message);
        this.name = "PlayerCreationError";
    }
}

export async function createPlayer(input: CreatePlayerInput) {
    await connectDB();

    const academyId = new mongoose.Types.ObjectId(input.academyId);
    const sportId = new mongoose.Types.ObjectId(input.sportId);
    const actorId = new mongoose.Types.ObjectId(input.actorId);
    const email = input.email.trim().toLowerCase();

    const session = await mongoose.connection.startSession();

    const rawToken = createPasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);

    let playerId = "";

    try {
        await session.withTransaction(async () => {
            const existingUser = await User.findOne({ email })
                .session(session)
                .lean();

            if (existingUser) {
                throw new PlayerCreationError(
                    "EMAIL_EXISTS",
                    "This email is already registered.",
                );
            }

            const sport = await Sport.exists({
                _id: sportId,
                academyId,
                status: "ACTIVE",
            }).session(session);

            if (!sport) {
                throw new PlayerCreationError(
                    "INVALID_SPORT",
                    "Selected sport is not active in this academy.",
                );
            }

            let coachId: mongoose.Types.ObjectId | undefined;

            if (input.actorRole === "COACH") {
                const assignment = await CoachAssignment.findOne({
                    academyId,
                    coachId: actorId,
                    sportId,
                    isHeadCoach: false,
                }).session(session);

                if (!assignment) {
                    throw new PlayerCreationError(
                        "INVALID_SPORT",
                        "You are not assigned to this sport.",
                    );
                }

                if (input.coachId && input.coachId !== input.actorId) {
                    throw new PlayerCreationError(
                        "INVALID_COACH",
                        "Coaches can assign players only to themselves.",
                    );
                }

                coachId = actorId;
            } else if (input.coachId) {
                coachId = new mongoose.Types.ObjectId(input.coachId);

                const assignment = await CoachAssignment.exists({
                    academyId,
                    coachId,
                    sportId,
                    isHeadCoach: false,
                }).session(session);

                if (!assignment) {
                    throw new PlayerCreationError(
                        "INVALID_COACH",
                        "Selected coach is not assigned to this sport.",
                    );
                }
            }

            const [user] = await User.create(
                [{
                    academyId,
                    name: input.name.trim(),
                    email,
                    role: "PLAYER",
                    status: "ACTIVE",
                    passwordSetupCompleted: false,
                    authSessionVersion: 0,
                }],
                { session },
            );

            const playerCode =
                `PLY-${randomBytes(5).toString("hex").toUpperCase()}`;

            const [player] = await Player.create(
                [{
                    academyId,
                    userId: user._id,
                    playerCode,
                    name: input.name.trim(),
                    dateOfBirth: input.dateOfBirth,
                    gender: input.gender,
                    sportId,
                    coachId,
                    email,
                    phone: input.phone,
                    address: input.address,
                    emergencyContact: input.emergencyContact,
                    status: "ACTIVE",
                }],
                { session },
            );

            await PasswordResetToken.create(
                [{
                    userId: user._id,
                    tokenHash,
                    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
                }],
                { session },
            );

            playerId = String(player._id);
        });
    } catch (error) {
        if (error instanceof PlayerCreationError) {
            throw error;
        }

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new PlayerCreationError(
                "EMAIL_EXISTS",
                "This email is already registered.",
            );
        }

        throw new PlayerCreationError(
            "CREATION_FAILED",
            "Unable to create player.",
        );
    } finally {
        await session.endSession();
    }

    const appUrl =
        process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;

    let invitationSent = false;

    if (appUrl) {
        const setupUrl =
            `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`;

        invitationSent = await sendPasswordResetEmail({
            to: email,
            resetUrl: setupUrl,
        });
    }

    return {
        playerId,
        invitationSent,
    };
}

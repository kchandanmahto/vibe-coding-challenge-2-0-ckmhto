
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "node:dns";
import mongoose from "mongoose";
import * as argon2 from "argon2";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import Academy from "../src/models/Academy.ts";
import User from "../src/models/User.ts";
import Sport from "../src/models/Sport.ts";
import PlayerModel from "../src/models/Player.ts";
import CoachAssignment from "../src/models/CoachAssignment.ts";

async function main() {
    const {
        MONGODB_URI,
        TEST_PLAYER_NAME,
        TEST_PLAYER_EMAIL,
        TEST_PLAYER_PASSWORD,
        TEST_PLAYER_CODE,
    } = process.env;

    if (
        !MONGODB_URI ||
        !TEST_PLAYER_NAME ||
        !TEST_PLAYER_EMAIL ||
        !TEST_PLAYER_PASSWORD ||
        !TEST_PLAYER_CODE
    ) {
        throw new Error("Required environment variables are missing.");
    }

    if (TEST_PLAYER_PASSWORD.length < 12) {
        throw new Error("Password must contain at least 12 characters.");
    }

    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB connected.");

    const academy = await Academy.findOne({
        name: "Dumka Sports Academy",
    });

    if (!academy) throw new Error("Academy not found.");

    const sport = await Sport.findOne({
        academyId: academy._id,
        name: "football",
        status: "ACTIVE",
    });

    if (!sport) throw new Error("Active Football sport not found.");

    const email = TEST_PLAYER_EMAIL.trim().toLowerCase();
    const playerCode = TEST_PLAYER_CODE.trim().toUpperCase();

    let user = await User.findOne({ email });

    if (user) {
        if (
            user.role !== "PLAYER" ||
            !user.academyId.equals(academy._id)
        ) {
            throw new Error("Email belongs to another account.");
        }

        console.log("Player login account already exists.");
    } else {
        const passwordHash = await argon2.hash(TEST_PLAYER_PASSWORD, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        user = await User.create({
            academyId: academy._id,
            name: TEST_PLAYER_NAME.trim(),
            email,
            passwordHash,
            role: "PLAYER",
            status: "ACTIVE",
            authSessionVersion: 0,
        });

        console.log("Player login account created.");
    }

    const existingProfile = await PlayerModel.findOne({
        userId: user._id,
    });

    if (existingProfile) {
        console.log("Player profile already exists. Existing profile unchanged.");
    } else {
        const codeExists = await PlayerModel.exists({
            academyId: academy._id,
            playerCode,
        });

        if (codeExists) {
            throw new Error("Player code already belongs to another profile.");
        }

        const coach = await User.findOne({
            academyId: academy._id,
            email: "coach.test@academy.local",
            role: "COACH",
            status: "ACTIVE",
        });

        if (coach) {
            const assignment = await CoachAssignment.exists({
                academyId: academy._id,
                coachId: coach._id,
                sportId: sport._id,
                isHeadCoach: false,
            });

            if (!assignment) {
                throw new Error("Test Coach is not assigned to Football.");
            }
        }

        await PlayerModel.create({
            academyId: academy._id,
            userId: user._id,
            playerCode,
            name: TEST_PLAYER_NAME.trim(),
            email,
            sportId: sport._id,
            ...(coach ? { coachId: coach._id } : {}),
            status: "ACTIVE",
        });

        console.log("Player profile created and linked.");
    }

    console.log("PLAYER SETUP SUCCESS");
}

main()
    .catch((error) => {
        console.error("SETUP FAILED:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });

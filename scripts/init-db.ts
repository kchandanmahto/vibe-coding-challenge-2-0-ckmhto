import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import dns from "node:dns";
import mongoose from "mongoose";
import argon2 from "argon2";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import Academy from "../src/models/Academy.ts";
import User from "../src/models/User.ts";
import Sport from "../src/models/Sport.ts";
import CoachAssignment from "../src/models/CoachAssignment.ts";
import PasswordResetToken from "../src/models/PasswordResetToken.ts";

import Player from "../src/models/Player.ts";
import TrainingSession from "../src/models/TrainingSession.ts";
import Attendance from "../src/models/Attendance.ts";
import Match from "../src/models/Match.ts";
import MatchPerformance from "../src/models/MatchPerformance.ts";

const MONGODB_URI = process.env.MONGODB_URI;

const HEAD_COACH_NAME = "Chandan Kumar";
const HEAD_COACH_EMAIL = "pvtkcmog@gmail.com";

const ACADEMY_DETAILS = {
    name: "Dumka Sports Academy",
    address: "Dumka, Jharkhand, India",
    contactEmail: HEAD_COACH_EMAIL,
    contactPhone: "8809214664",
};

const SPORTS = [
    "Football",
    "Cricket",
    "Volleyball",
    "Basketball",
    "Athletics",
];

const MODELS = [
    Academy,
    User,
    Sport,
    CoachAssignment,
    PasswordResetToken,
    Player,
    TrainingSession,
    Attendance,
    Match,
    MatchPerformance,
];

async function initializeCollections() {
    console.log("\nInitializing MongoDB collections...");

    for (const model of MODELS) {
        try {
            await model.createCollection();
            console.log(`CREATED COLLECTION: ${model.collection.name}`);
        } catch (error: unknown) {
            const mongoError = error as { code?: number };

            if (mongoError.code === 48) {
                console.log(`EXISTS: ${model.collection.name}`);
            } else {
                throw error;
            }
        }

        await model.createIndexes();
        console.log(`INDEXES READY: ${model.collection.name}`);
    }
}

async function seedAcademy() {
    const academy = await Academy.findOneAndUpdate(
        { contactEmail: ACADEMY_DETAILS.contactEmail },
        { $setOnInsert: ACADEMY_DETAILS },
        {
            upsert: true,
            new: true,
            runValidators: true,
        }
    );

    console.log(`\nACADEMY READY: ${academy.name}`);

    return academy;
}

async function seedSports(academyId: mongoose.Types.ObjectId) {
    console.log("\nSeeding sports...");

    for (const sportName of SPORTS) {
        const sport = await Sport.findOneAndUpdate(
            {
                academyId,
                name: sportName.toLowerCase(),
            },
            {
                $setOnInsert: {
                    academyId,
                    name: sportName.toLowerCase(),
                    status: "ACTIVE",
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        );

        console.log(`SPORT READY: ${sport.name}`);
    }
}

async function seedHeadCoach(academyId: mongoose.Types.ObjectId) {
    console.log("\nSetting up Head Coach...");

    const existingHeadCoach = await User.findOne({
        email: HEAD_COACH_EMAIL.toLowerCase(),
    });

    let headCoach = existingHeadCoach;

    if (!headCoach) {
        const initialPassword = process.env.HEAD_COACH_INITIAL_PASSWORD;

        if (!initialPassword || initialPassword.length < 12) {
            throw new Error(
                "Set HEAD_COACH_INITIAL_PASSWORD in .env.local. Minimum 12 characters required."
            );
        }

        const passwordHash = await argon2.hash(initialPassword, {
            type: argon2.argon2id,
        });

        headCoach = await User.create({
            academyId,
            name: HEAD_COACH_NAME,
            email: HEAD_COACH_EMAIL.toLowerCase(),
            passwordHash,
            role: "HEAD_COACH",
            status: "ACTIVE",
        });

        console.log("HEAD COACH ACCOUNT CREATED");
    } else {
        if (
            String(headCoach.academyId) !== String(academyId) ||
            headCoach.role !== "HEAD_COACH"
        ) {
            throw new Error(
                "An account with the Head Coach email already exists but belongs to another academy or role. Please review it manually."
            );
        }

        console.log("HEAD COACH ACCOUNT ALREADY EXISTS");
    }

    await CoachAssignment.findOneAndUpdate(
        {
            academyId,
            coachId: headCoach._id,
            isHeadCoach: true,
        },
        {
            $setOnInsert: {
                academyId,
                coachId: headCoach._id,
                isHeadCoach: true,
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
        }
    );

    console.log("HEAD COACH ASSIGNMENT READY");
}

async function main() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from .env.local");
        }

        console.log("Connecting to MongoDB...");

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 15000,
        });

        console.log("MongoDB connected successfully!");

        await initializeCollections();

        const academy = await seedAcademy();

        await seedSports(academy._id);

        await seedHeadCoach(academy._id);

        await mongoose.connection.db?.admin().ping();

        console.log("\n================================");
        console.log("DATABASE INITIALIZATION SUCCESS");
        console.log("================================");
        console.log(`Database: ${mongoose.connection.name}`);
        console.log(`Academy: ${academy.name}`);
        console.log(`Collections: ${MODELS.length}`);
        console.log(`Sports: ${SPORTS.length}`);
        console.log("================================\n");
    } catch (error) {
        console.error("\nDATABASE INITIALIZATION FAILED:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

main();
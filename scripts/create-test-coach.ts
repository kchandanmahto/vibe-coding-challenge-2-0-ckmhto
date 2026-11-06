
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import * as argon2 from "argon2";

import Academy from "../src/models/Academy.ts";
import User from "../src/models/User.ts";
import Sport from "../src/models/Sport.ts";
import CoachAssignment from "../src/models/CoachAssignment.ts";

async function main() {
    const { MONGODB_URI, TEST_COACH_NAME, TEST_COACH_EMAIL, TEST_COACH_PASSWORD } =
        process.env;

    if (!MONGODB_URI || !TEST_COACH_NAME || !TEST_COACH_EMAIL || !TEST_COACH_PASSWORD) {
        throw new Error("Required environment variables are missing.");
    }

    if (TEST_COACH_PASSWORD.length < 12) {
        throw new Error("Test password must be at least 12 characters.");
    }

    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB connected.");

    const academy = await Academy.findOne({
        name: "Dumka Sports Academy",
    });

    if (!academy) throw new Error("Academy not found.");

    const email = TEST_COACH_EMAIL.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (user) {
        if (user.role !== "COACH" || !user.academyId.equals(academy._id)) {
            throw new Error("Email already belongs to another account.");
        }

        console.log("Coach account already exists. Existing account unchanged.");
    } else {
        const passwordHash = await argon2.hash(TEST_COACH_PASSWORD, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        user = await User.create({
            academyId: academy._id,
            name: TEST_COACH_NAME.trim(),
            email,
            passwordHash,
            role: "COACH",
            status: "ACTIVE",
            authSessionVersion: 0,
        });

        console.log("Coach account created.");
    }

    const football = await Sport.findOne({
        academyId: academy._id,
        name: "football",
        status: "ACTIVE",
    });

    if (!football) throw new Error("Active Football sport not found.");

    const assignment = await CoachAssignment.findOne({
        academyId: academy._id,
        coachId: user._id,
        isHeadCoach: false,
    });

    if (!assignment) {
        await CoachAssignment.create({
            academyId: academy._id,
            coachId: user._id,
            sportId: football._id,
            isHeadCoach: false,
        });
    }

    console.log("Coach assignment ready.");
    console.log("TEST COACH SETUP SUCCESS");
}

main()
    .catch((error) => {
        console.error("SETUP FAILED:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });


import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "node:dns";
import mongoose from "mongoose";
import * as argon2 from "argon2";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import Academy from "../src/models/Academy.ts";
import User from "../src/models/User.ts";

async function main() {
    const {
        MONGODB_URI,
        TEST_SCOUT_NAME,
        TEST_SCOUT_EMAIL,
        TEST_SCOUT_PASSWORD,
    } = process.env;

    if (
        !MONGODB_URI ||
        !TEST_SCOUT_NAME ||
        !TEST_SCOUT_EMAIL ||
        !TEST_SCOUT_PASSWORD
    ) {
        throw new Error("Required environment variables are missing.");
    }

    if (TEST_SCOUT_PASSWORD.length < 12) {
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

    const email = TEST_SCOUT_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        if (
            existingUser.role !== "SCOUT" ||
            !existingUser.academyId.equals(academy._id)
        ) {
            throw new Error("Email belongs to another account.");
        }

        console.log("Scout already exists. Existing account unchanged.");
    } else {
        const passwordHash = await argon2.hash(TEST_SCOUT_PASSWORD, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        await User.create({
            academyId: academy._id,
            name: TEST_SCOUT_NAME.trim(),
            email,
            passwordHash,
            role: "SCOUT",
            status: "ACTIVE",
            authSessionVersion: 0,
        });

        console.log("Scout account created.");
    }

    console.log("SCOUT SETUP SUCCESS");
}

main()
    .catch((error) => {
        console.error("SETUP FAILED:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });

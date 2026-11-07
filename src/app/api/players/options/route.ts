
import { connection, NextResponse } from "next/server";

import mongoose from "mongoose";

import Sport from "@/models/Sport";
import User from "@/models/User";
import CoachAssignment from "@/models/CoachAssignment";

import { connectDB } from "@/server/database/mongodb";
import {
    requireRole,
    requireCoachAccess,
    AuthorizationError,
} from "@/server/auth/permissions";

export async function GET(request: Request) {
        await connection();

    try {
        const user = await requireRole(["HEAD_COACH", "COACH"]);

        const actor = user.role === "COACH"
            ? await requireCoachAccess()
            : user;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const sportId = searchParams.get("sportId");

        const academyId = new mongoose.Types.ObjectId(actor.academyId);

        const sportQuery: Record<string, unknown> = {
            academyId,
            status: "ACTIVE",
        };

        if (sportId) {
            if (!mongoose.isValidObjectId(sportId)) {
                return NextResponse.json(
                    { message: "Invalid sport ID." },
                    { status: 400 },
                );
            }

            sportQuery._id = sportId;
        }

        const sports = await Sport.find(sportQuery)
            .select("_id name")
            .sort({ name: 1 })
            .lean();

        const assignmentQuery: Record<string, unknown> = {
            academyId,
            isHeadCoach: false,
        };

        if (sportId) assignmentQuery.sportId = sportId;
        if (actor.role === "COACH") assignmentQuery.coachId = actor.id;

        const assignments = await CoachAssignment.find(assignmentQuery)
            .populate({
                path: "coachId",
                match: { status: "ACTIVE", role: "COACH" },
                select: "name email",
            })
            .populate({
                path: "sportId",
                select: "name",
            })
            .lean();

        const coaches = assignments
            .filter((assignment) => assignment.coachId)
            .map((assignment) => {
                const coach = assignment.coachId as unknown as {
                    _id: mongoose.Types.ObjectId;
                    name: string;
                    email: string;
                };

                const sport = assignment.sportId as unknown as {
                    _id: mongoose.Types.ObjectId;
                    name: string;
                };

                return {
                    id: String(coach._id),
                    name: coach.name,
                    email: coach.email,
                    sportId: sport ? String(sport._id) : "",
                };
            });

        return NextResponse.json({
            sports: sports.map((sport) => ({
                id: String(sport._id),
                name: sport.name,
            })),
            coaches,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.code === "UNAUTHENTICATED" ? 401 : 403 },
            );
        }

        console.error("Player options API error:", error);

        return NextResponse.json(
            { message: "Unable to load player options." },
            { status: 500 },
        );
    }
}

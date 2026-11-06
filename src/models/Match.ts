import "server-only";
import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
} from "mongoose";

export type MatchStatus =
    | "UPCOMING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type MatchType = "FRIENDLY" | "TOURNAMENT" | "LEAGUE";

export type MatchResult =
    | "WIN"
    | "LOSS"
    | "DRAW"
    | "NO_RESULT";

export interface Match {
    academyId: mongoose.Types.ObjectId;
    matchCode: string;
    name: string;
    sportId: mongoose.Types.ObjectId;
    date: Date;
    time?: string;
    type: MatchType;
    opponent: string;
    description?: string;
    venue?: string;
    playerIds: mongoose.Types.ObjectId[];
    sessionId?: mongoose.Types.ObjectId;
    status: MatchStatus;
    teamScore?: number;
    opponentScore?: number;
    result?: MatchResult;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type MatchDocument = HydratedDocument<Match>;

const MatchSchema = new Schema<Match>(
    {
        academyId: {
            type: Schema.Types.ObjectId,
            ref: "Academy",
            required: true,
            index: true,
        },
        matchCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sportId: {
            type: Schema.Types.ObjectId,
            ref: "Sport",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["FRIENDLY", "TOURNAMENT", "LEAGUE"],
            required: true,
        },
        opponent: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        venue: {
            type: String,
            trim: true,
        },
        playerIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Player",
            },
        ],
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: "TrainingSession",
        },
        status: {
            type: String,
            enum: ["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
            default: "UPCOMING",
        },
        teamScore: {
            type: Number,
            min: 0,
        },
        opponentScore: {
            type: Number,
            min: 0,
        },
        result: {
            type: String,
            enum: ["WIN", "LOSS", "DRAW", "NO_RESULT"],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

MatchSchema.index(
    { academyId: 1, matchCode: 1 },
    { unique: true }
);

MatchSchema.index({
    academyId: 1,
    date: 1,
    status: 1,
});

MatchSchema.index({
    sportId: 1,
    date: 1,
});

const MatchModel: Model<Match> =
    mongoose.models.Match ||
    mongoose.model<Match>("Match", MatchSchema);

export default MatchModel;
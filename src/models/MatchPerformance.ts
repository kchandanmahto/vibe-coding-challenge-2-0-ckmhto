import "server-only";
import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
} from "mongoose";

export type ParticipationStatus =
    | "PARTICIPATED"
    | "DID_NOT_PARTICIPATE";

export interface MatchPerformance {
    academyId: mongoose.Types.ObjectId;
    matchId: mongoose.Types.ObjectId;
    playerId: mongoose.Types.ObjectId;
    participationStatus: ParticipationStatus;
    score?: number;
    remarks?: string;
    metrics?: Record<string, unknown>;
    recordedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type MatchPerformanceDocument =
    HydratedDocument<MatchPerformance>;

const MatchPerformanceSchema = new Schema<MatchPerformance>(
    {
        academyId: {
            type: Schema.Types.ObjectId,
            ref: "Academy",
            required: true,
            index: true,
        },
        matchId: {
            type: Schema.Types.ObjectId,
            ref: "Match",
            required: true,
        },
        playerId: {
            type: Schema.Types.ObjectId,
            ref: "Player",
            required: true,
        },
        participationStatus: {
            type: String,
            enum: ["PARTICIPATED", "DID_NOT_PARTICIPATE"],
            required: true,
            default: "PARTICIPATED",
        },
        score: {
            type: Number,
            min: 0,
        },
        remarks: {
            type: String,
            trim: true,
        },
        metrics: {
            type: Schema.Types.Mixed,
            default: {},
        },
        recordedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

MatchPerformanceSchema.index(
    { matchId: 1, playerId: 1 },
    { unique: true }
);

MatchPerformanceSchema.index({
    academyId: 1,
    playerId: 1,
    createdAt: -1,
});

const MatchPerformanceModel: Model<MatchPerformance> =
    mongoose.models.MatchPerformance ||
    mongoose.model<MatchPerformance>(
        "MatchPerformance",
        MatchPerformanceSchema
    );

export default MatchPerformanceModel;
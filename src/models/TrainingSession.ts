import "server-only";
import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
} from "mongoose";

export type TrainingSessionStatus =
    | "SCHEDULED"
    | "OPEN"
    | "CLOSED"
    | "CANCELLED";

export interface TrainingSession {
    academyId: mongoose.Types.ObjectId;
    sessionCode: string;
    title: string;
    sportId: mongoose.Types.ObjectId;
    coachId: mongoose.Types.ObjectId;
    playerIds: mongoose.Types.ObjectId[];
    date: Date;
    startTime: string;
    endTime: string;
    status: TrainingSessionStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TrainingSessionDocument =
    HydratedDocument<TrainingSession>;

const TrainingSessionSchema = new Schema<TrainingSession>(
    {
        academyId: {
            type: Schema.Types.ObjectId,
            ref: "Academy",
            required: true,
            index: true,
        },
        sessionCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        sportId: {
            type: Schema.Types.ObjectId,
            ref: "Sport",
            required: true,
        },
        coachId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        playerIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Player",
            },
        ],
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
            trim: true,
        },
        endTime: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"],
            default: "SCHEDULED",
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

TrainingSessionSchema.index(
    { academyId: 1, sessionCode: 1 },
    { unique: true }
);

TrainingSessionSchema.index({
    academyId: 1,
    date: 1,
    status: 1,
});

TrainingSessionSchema.index({
    coachId: 1,
    date: 1,
});

TrainingSessionSchema.index({
    playerIds: 1,
    date: 1,
});

const TrainingSessionModel: Model<TrainingSession> =
    mongoose.models.TrainingSession ||
    mongoose.model<TrainingSession>(
        "TrainingSession",
        TrainingSessionSchema
    );

export default TrainingSessionModel;
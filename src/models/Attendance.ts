import "server-only";
import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
} from "mongoose";

export type AttendanceStatus =
    | "PRESENT"
    | "ABSENT"
    | "LATE"
    | "EXCUSED";

export interface Attendance {
    academyId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
    playerId: mongoose.Types.ObjectId;
    status: AttendanceStatus;
    markedBy: mongoose.Types.ObjectId;
    markedAt: Date;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type AttendanceDocument = HydratedDocument<Attendance>;

const AttendanceSchema = new Schema<Attendance>(
    {
        academyId: {
            type: Schema.Types.ObjectId,
            ref: "Academy",
            required: true,
            index: true,
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: "TrainingSession",
            required: true,
        },
        playerId: {
            type: Schema.Types.ObjectId,
            ref: "Player",
            required: true,
        },
        status: {
            type: String,
            enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
            required: true,
        },
        markedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        markedAt: {
            type: Date,
            default: Date.now,
        },
        remarks: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

AttendanceSchema.index(
    { sessionId: 1, playerId: 1 },
    { unique: true }
);

AttendanceSchema.index({
    academyId: 1,
    markedAt: -1,
});

AttendanceSchema.index({
    academyId: 1,
    playerId: 1,
    markedAt: -1,
});

const AttendanceModel: Model<Attendance> =
    mongoose.models.Attendance ||
    mongoose.model<Attendance>("Attendance", AttendanceSchema);

export default AttendanceModel;
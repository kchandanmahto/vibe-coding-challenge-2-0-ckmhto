import "server-only";
import mongoose, {
    Schema,
    type Model,
    type HydratedDocument,
} from "mongoose";

export type PlayerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type PlayerGender = "MALE" | "FEMALE" | "OTHER";

export interface Player {
    academyId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    playerCode: string;
    name: string;
    dateOfBirth?: Date;
    gender?: PlayerGender;
    sportId: mongoose.Types.ObjectId;
    coachId?: mongoose.Types.ObjectId;
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phone?: string;
    };
    status: PlayerStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type PlayerDocument = HydratedDocument<Player>;

const PlayerSchema = new Schema<Player>(
    {
        academyId: {
            type: Schema.Types.ObjectId,
            ref: "Academy",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        playerCode: {
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
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"],
        },
        sportId: {
            type: Schema.Types.ObjectId,
            ref: "Sport",
            required: true,
            index: true,
        },
        coachId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            trim: true,
        },
        emergencyContact: {
            name: { type: String, trim: true },
            relationship: { type: String, trim: true },
            phone: { type: String, trim: true },
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
    }
);

// Unique player code within an academy
PlayerSchema.index(
    { academyId: 1, playerCode: 1 },
    { unique: true }
);

// Filter players by sport and status
PlayerSchema.index({
    academyId: 1,
    sportId: 1,
    status: 1,
});

// Filter players by assigned coach
PlayerSchema.index({
    academyId: 1,
    coachId: 1,
    status: 1,
});

// One login account can belong to only one player.
// Multiple players can have no userId.
PlayerSchema.index(
    { userId: 1 },
    {
        name: "userId_unique_sparse",
        unique: true,
        sparse: true,
    }
);

const PlayerModel: Model<Player> =
    mongoose.models.Player ||
    mongoose.model<Player>("Player", PlayerSchema);

export default PlayerModel;
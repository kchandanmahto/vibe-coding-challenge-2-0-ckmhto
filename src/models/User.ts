import "server-only";

import mongoose, {
  type HydratedDocument,
  type Model,
  Schema,
} from "mongoose";

export interface IUser {
  academyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  role: "HEAD_COACH" | "COACH" | "SCOUT" | "PLAYER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  authSessionVersion: number;
  emailVerified?: Date;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    academyId: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: [true, "Academy is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "User name must be at least 2 characters"],
      maxlength: [100, "User name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
      unique: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["HEAD_COACH", "COACH", "SCOUT", "PLAYER"],
      required: [true, "User role is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      required: true,
      index: true,
    },
    authSessionVersion: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Session version must be a non-negative integer",
      },
    },
    emailVerified: {
      type: Date,
    },
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.index({ academyId: 1, role: 1, status: 1 });
userSchema.index({ academyId: 1, email: 1 });

export type UserDocument = HydratedDocument<IUser>;

const User =
  (mongoose.models.User as Model<IUser> | undefined) ??
  mongoose.model<IUser>("User", userSchema);

export default User;

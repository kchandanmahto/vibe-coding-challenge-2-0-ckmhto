import "server-only";

import mongoose, {
  type HydratedDocument,
  type Model,
  Schema,
} from "mongoose";

export interface IPasswordResetToken {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ userId: 1, consumedAt: 1 });

export type PasswordResetTokenDocument =
  HydratedDocument<IPasswordResetToken>;

const PasswordResetToken =
  (mongoose.models.PasswordResetToken as
    | Model<IPasswordResetToken>
    | undefined) ??
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    passwordResetTokenSchema,
  );

export default PasswordResetToken;

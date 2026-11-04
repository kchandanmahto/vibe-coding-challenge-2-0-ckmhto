import "server-only";

import mongoose, {
  type HydratedDocument,
  type Model,
  Schema,
} from "mongoose";

export interface ISport {
  academyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const sportSchema = new Schema<ISport>(
  {
    academyId: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: [true, "Academy is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Sport name is required"],
      trim: true,
      lowercase: true,
      minlength: [2, "Sport name must be at least 2 characters"],
      maxlength: [100, "Sport name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Sport description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
  },
  { timestamps: true },
);

sportSchema.index(
  { academyId: 1, name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);
sportSchema.index({ academyId: 1, status: 1, name: 1 });

export type SportDocument = HydratedDocument<ISport>;

const Sport =
  (mongoose.models.Sport as Model<ISport> | undefined) ??
  mongoose.model<ISport>("Sport", sportSchema);

export default Sport;

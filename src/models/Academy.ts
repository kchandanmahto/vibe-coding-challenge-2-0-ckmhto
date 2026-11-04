import "server-only";

import mongoose, {
  type HydratedDocument,
  type Model,
  Schema,
} from "mongoose";

export interface IAcademy {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const academySchema = new Schema<IAcademy>(
  {
    name: {
      type: String,
      required: [true, "Academy name is required"],
      trim: true,
      minlength: [2, "Academy name must be at least 2 characters"],
      maxlength: [100, "Academy name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Academy address is required"],
      trim: true,
      minlength: [5, "Academy address must be at least 5 characters"],
      maxlength: [300, "Academy address cannot exceed 300 characters"],
    },
    contactEmail: {
      type: String,
      required: [true, "Academy contact email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Contact email cannot exceed 254 characters"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
      unique: true,
    },
    contactPhone: {
      type: String,
      required: [true, "Academy contact phone is required"],
      trim: true,
      maxlength: [30, "Contact phone cannot exceed 30 characters"],
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

academySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

export type AcademyDocument = HydratedDocument<IAcademy>;

const Academy =
  (mongoose.models.Academy as Model<IAcademy> | undefined) ??
  mongoose.model<IAcademy>("Academy", academySchema);

export default Academy;

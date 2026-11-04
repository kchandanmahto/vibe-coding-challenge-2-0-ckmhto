import "server-only";

import mongoose, {
  type HydratedDocument,
  type Model,
  Schema,
} from "mongoose";

export interface ICoachAssignment {
  academyId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  sportId?: mongoose.Types.ObjectId;
  isHeadCoach: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const coachAssignmentSchema = new Schema<ICoachAssignment>(
  {
    academyId: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: [true, "Academy is required"],
      index: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Coach is required"],
      index: true,
    },
    sportId: {
      type: Schema.Types.ObjectId,
      ref: "Sport",
    },
    isHeadCoach: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

coachAssignmentSchema.pre("validate", function validateAssignment() {
  if (this.isHeadCoach) {
    this.sportId = undefined;
  } else if (!this.sportId) {
    this.invalidate("sportId", "A sport is required for a regular coach");
  }
});

coachAssignmentSchema.index(
  { academyId: 1, coachId: 1, sportId: 1 },
  { unique: true },
);
coachAssignmentSchema.index(
  { academyId: 1, coachId: 1 },
  {
    unique: true,
    partialFilterExpression: { isHeadCoach: true },
  },
);
coachAssignmentSchema.index({ academyId: 1, sportId: 1, coachId: 1 });

export type CoachAssignmentDocument = HydratedDocument<ICoachAssignment>;

const CoachAssignment =
  (mongoose.models.CoachAssignment as Model<ICoachAssignment> | undefined) ??
  mongoose.model<ICoachAssignment>(
    "CoachAssignment",
    coachAssignmentSchema,
  );

export default CoachAssignment;

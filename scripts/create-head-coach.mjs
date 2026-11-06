
import dotenv from "dotenv";
import dns from "node:dns";
import mongoose, { Schema } from "mongoose";
import argon2 from "argon2";
import readline from "node:readline/promises";

dotenv.config({ path: ".env.local" });

// Resolve MongoDB Atlas SRV records through Google DNS.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const CONFIG = {
  email: "pvtkcmog@gmail.com",
  academyName: "Dumka Sports Academy",
  academyAddress: "Dumka, Jharkhand, India",
  phone: "8809214664",
  headCoachName: "Chandan Kumar",
};

// Schemas mirror the existing project models.
// Do not use this script to modify unrelated collections.

const academySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 300,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
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
  { unique: true, collation: { locale: "en", strength: 2 } },
);

const userSchema = new Schema(
  {
    academyId: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["HEAD_COACH", "COACH", "SCOUT", "PLAYER"],
      required: true,
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
    },
    emailVerified: Date,
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

const assignmentSchema = new Schema(
  {
    academyId: {
      type: Schema.Types.ObjectId,
      ref: "Academy",
      required: true,
      index: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

assignmentSchema.pre("validate", function () {
  if (this.isHeadCoach) {
    this.sportId = undefined;
  } else if (!this.sportId) {
    this.invalidate("sportId", "A sport is required for a regular coach");
  }
});

assignmentSchema.index(
  { academyId: 1, coachId: 1, sportId: 1 },
  { unique: true },
);
assignmentSchema.index(
  { academyId: 1, coachId: 1 },
  {
    unique: true,
    partialFilterExpression: { isHeadCoach: true },
  },
);
assignmentSchema.index({ academyId: 1, sportId: 1, coachId: 1 });

const Academy =
  mongoose.models.Academy || mongoose.model("Academy", academySchema);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

const CoachAssignment =
  mongoose.models.CoachAssignment ||
  mongoose.model("CoachAssignment", assignmentSchema);

// Password input is masked in a normal interactive terminal.
async function readSecret(prompt) {
  const input = process.stdin;

  if (!input.isTTY || typeof input.setRawMode !== "function") {
    const rl = readline.createInterface({
      input,
      output: process.stdout,
    });

    try {
      return await rl.question(prompt);
    } finally {
      rl.close();
    }
  }

  return new Promise((resolve, reject) => {
    let value = "";

    process.stdout.write(prompt);
    input.setRawMode(true);
    input.resume();
    input.setEncoding("utf8");

    const cleanup = () => {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
    };

    const onData = (key) => {
      if (key === "\u0003") {
        cleanup();
        reject(new Error("Password input cancelled."));
        return;
      }

      if (key === "\r" || key === "\n") {
        cleanup();
        resolve(value);
        return;
      }

      if (key === "\u007f" || key === "\b") {
        if (value.length > 0) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      if (key >= " " && key !== "\u007f") {
        value += key;
        process.stdout.write("*");
      }
    };

    input.on("data", onData);
  });
}

async function createPasswordHash() {
  const password = await readSecret("Create HEAD_COACH password: ");

  if (password.length < 8 || password.length > 128) {
    throw new Error("Password must contain 8-128 characters.");
  }

  const confirmation = await readSecret("Confirm password: ");

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env.local");
  }

  console.log("Connecting to MongoDB Atlas...");

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
      bufferCommands: false,
    });
  } catch (error) {
    console.error("\nMongoDB connection failed.");
    console.error("Error name:", error.name);
    console.error("Error code:", error.code ?? "Not provided");
    console.error("Reason:", error.message);
    throw new Error("Could not connect to MongoDB Atlas.");
  }

  console.log("MongoDB connected:", mongoose.connection.name);

  const existingUser = await User.findOne({
    email: CONFIG.email,
  }).select("+passwordHash");

  let passwordHash = null;

  if (existingUser) {
    if (existingUser.role !== "HEAD_COACH") {
      throw new Error(
        "This email belongs to another role. No account changes made.",
      );
    }

    if (existingUser.status !== "ACTIVE" || !existingUser.passwordHash) {
      throw new Error(
        "Existing account is not ready for login. No changes made.",
      );
    }

    console.log("Existing HEAD_COACH account found. Password will not change.");
  } else {
    passwordHash = await createPasswordHash();
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      let user = await User.findOne({
        email: CONFIG.email,
      })
        .session(session)
        .select("+passwordHash");

      let academy;

      if (user) {
        if (user.role !== "HEAD_COACH" || user.status !== "ACTIVE") {
          throw new Error("Existing user is not an active HEAD_COACH.");
        }

        academy = await Academy.findById(user.academyId).session(session);

        if (!academy || academy.status !== "ACTIVE") {
          throw new Error(
            "Existing HEAD_COACH academy is missing or inactive.",
          );
        }

        result = "EXISTING_USER";
      } else {
        academy = await Academy.findOne({
          name: CONFIG.academyName,
        }).session(session);

        if (!academy) {
          const emailConflict = await Academy.findOne({
            contactEmail: CONFIG.email,
          }).session(session);

          if (emailConflict) {
            throw new Error(
              "The contact email is already used by another academy.",
            );
          }

          [academy] = await Academy.create(
            [
              {
                name: CONFIG.academyName,
                address: CONFIG.academyAddress,
                contactEmail: CONFIG.email,
                contactPhone: CONFIG.phone,
                status: "ACTIVE",
              },
            ],
            { session },
          );

          console.log("Academy created.");
        } else if (academy.status !== "ACTIVE") {
          throw new Error("Dumka Sports Academy exists but is inactive.");
        }

        [user] = await User.create(
          [
            {
              academyId: academy._id,
              name: CONFIG.headCoachName,
              email: CONFIG.email,
              passwordHash,
              role: "HEAD_COACH",
              status: "ACTIVE",
              authSessionVersion: 0,
            },
          ],
          { session },
        );

        console.log("HEAD_COACH account created.");
        result = "CREATED";
      }

      let assignment = await CoachAssignment.findOne({
        academyId: academy._id,
        coachId: user._id,
        isHeadCoach: true,
      }).session(session);

      if (!assignment) {
        await CoachAssignment.create(
          [
            {
              academyId: academy._id,
              coachId: user._id,
              isHeadCoach: true,
            },
          ],
          { session },
        );

        console.log("Head Coach assignment created.");
      } else {
        console.log("Head Coach assignment already exists.");
      }

      result = {
        action: result,
        academyName: academy.name,
        academyId: String(academy._id),
        userId: String(user._id),
        email: user.email,
        role: user.role,
        status: user.status,
      };
    });

    console.log("\n----- SETUP VERIFICATION -----");
    console.log("Action:", result.action);
    console.log("Academy:", result.academyName);
    console.log("Database:", mongoose.connection.name);
    console.log("Email:", result.email);
    console.log("Role:", result.role);
    console.log("Status:", result.status);
    console.log("Academy relationship: OK");
    console.log("Head Coach assignment: OK");
    console.log("\nSetup completed successfully.");
  } finally {
    await session.endSession();
  }
}

main()
  .catch((error) => {
    console.error("\nSetup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

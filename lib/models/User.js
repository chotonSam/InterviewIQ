import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    image: { type: String, default: "" }, // Cloudinary URL of the profile picture
    bio: { type: String, default: "", maxlength: 160 }, // short public description
    // Bumped on every password change/reset. Each login cookie carries the number it was issued with, so
    // changing the password signs out every other device.
    tokenVersion: { type: Number, default: 0 },
    passwordChangedAt: { type: Date, default: null },
    // password reset (forgot password): a code (10 min, 5 tries) and a link (1 h), both stored hashed
    reset: {
      tokenHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      codeHash: { type: String, default: "" },
      codeExpiresAt: { type: Date, default: null },
      codeAttempts: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: null },
      windowStart: { type: Date, default: null },
      sentCount: { type: Number, default: 0 },
    },
    // brute-force guard for "current password" checks
    security: {
      failedChecks: { type: Number, default: 0 },
      lockedUntil: { type: Date, default: null },
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    // Only a SHA-256 hash of the emailed token is stored, so a database leak can't be used to verify accounts
    verification: {
      tokenHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      lastSentAt: { type: Date, default: null },
      windowStart: { type: Date, default: null },
      sentCount: { type: Number, default: 0 },
      // the 6-digit code (OTP): stored as a keyed hash, valid 10 minutes, 5 tries
      codeHash: { type: String, default: "" },
      codeExpiresAt: { type: Date, default: null },
      codeAttempts: { type: Number, default: 0 },
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

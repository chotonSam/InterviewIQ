import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    image: { type: String, default: "" }, // Cloudinary URL of the profile picture
    bio: { type: String, default: "", maxlength: 160 }, // short public description
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

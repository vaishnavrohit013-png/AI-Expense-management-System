import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypts.js";

const { Schema } = mongoose;

/* ===== Schema ===== */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

/* ===== Hooks ===== */
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
  next();
});

/* ===== Methods ===== */
userSchema.methods.comparePassword = function (password) {
  return compareValue(password, this.password);
};

userSchema.methods.omitPassword = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/* ===== Model ===== */
const UserModel = mongoose.model("User", userSchema);

export default UserModel;


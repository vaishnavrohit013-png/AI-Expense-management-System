import mongoose from "mongoose";

/**
 * Budget Model
 * Allows users to set specific spending limits for categories per month.
 */
const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index — one budget per (user, category, month, year)
budgetSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

const BudgetModel = mongoose.model("Budget", budgetSchema);

export default BudgetModel;

import mongoose from "mongoose";

/**
 * BudgetAlert Model
 * Tracks which budget threshold emails have already been sent.
 * Prevents duplicate alerts per category / threshold / month.
 */
const budgetAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // "overall" for total monthly budget, or category name (e.g. "Food")
    category: {
      type: String,
      required: true,
      default: "overall",
    },

    // Calendar month (1–12)
    month: {
      type: Number,
      required: true,
    },

    // Calendar year (e.g. 2026)
    year: {
      type: Number,
      required: true,
    },

    // One of: "80", "100", "exceeded"
    thresholdType: {
      type: String,
      enum: ["80", "100", "exceeded"],
      required: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index — only one alert per (user, category, month, year, threshold)
budgetAlertSchema.index(
  { userId: 1, category: 1, month: 1, year: 1, thresholdType: 1 },
  { unique: true }
);

const BudgetAlertModel = mongoose.model("BudgetAlert", budgetAlertSchema);

export default BudgetAlertModel;

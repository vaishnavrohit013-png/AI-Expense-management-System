import mongoose from "mongoose";
import {
  convertToPaise,
  convertToRupeeUnit,
} from "../utils/format-currency.js";

const { Schema } = mongoose;

/* ================= ENUMS (JS STYLE) ================= */

export const TransactionStatusEnum = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

export const RecurringIntervalEnum = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
};

export const TransactionTypeEnum = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
};

export const PaymentMethodEnum = {
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  MOBILE_PAYMENT: "MOBILE_PAYMENT",
  AUTO_DEBIT: "AUTO_DEBIT",
  CASH: "CASH",
  OTHER: "OTHER",
};

/* ================= SCHEMA ================= */

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(TransactionTypeEnum),
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
      required: true,
    },

    merchant: {
      type: String,
    },

    receiptUrl: {
      type: String,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringInterval: {
      type: String,
      enum: Object.values(RecurringIntervalEnum),
      default: null,
    },

    nextRecurringDate: {
      type: Date,
      default: null,
    },

    lastProcessed: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(TransactionStatusEnum),
      default: TransactionStatusEnum.COMPLETED,
    },

    paymentMethod: {
      type: String,
      // Accepts free-form values like "Cash", "Credit Card", "UPI", "Debit Card", etc.
      // AI receipt scanner returns human-readable strings, strict enum would reject them.
      default: "Cash",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

/* ================= MODEL ================= */

const TransactionModel = mongoose.model("Transaction", transactionSchema);

export default TransactionModel;

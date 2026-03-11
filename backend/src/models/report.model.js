import mongoose from "mongoose";

export const ReportStatusEnum = {
  SENT: "SENT",
  PENDING: "PENDING",
  FAILED: "FAILED",
  NO_ACTIVITY: "NO_ACTIVITY",
};

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    period: {
      type: String,
      required: true,
    },

    sentDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ReportStatusEnum),
      default: ReportStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const ReportModel = mongoose.model("Report", reportSchema);

export default ReportModel;

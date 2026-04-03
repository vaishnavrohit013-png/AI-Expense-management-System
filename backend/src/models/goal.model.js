import mongoose from 'mongoose';

const { Schema } = mongoose;

const goalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be positive'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
      default: 'IN_PROGRESS',
    },
    category: {
      type: String,
      default: 'General',
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress percentage
goalSchema.virtual('progress').get(function() {
  if (this.targetAmount <= 0) return 0;
  const p = (this.currentAmount / this.targetAmount) * 100;
  return Math.min(Math.round(p), 100);
});

// Virtual for remaining amount
goalSchema.virtual('remaining').get(function() {
  const r = this.targetAmount - this.currentAmount;
  return Math.max(r, 0);
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;

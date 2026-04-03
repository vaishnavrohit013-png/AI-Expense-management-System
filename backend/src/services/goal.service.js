import Goal from '../models/goal.model.js';
import { NotFoundException } from '../utils/app-error.js';

export const createGoalService = async (userId, data) => {
  // Clean empty strings for optional fields and ensure proper casting
  const cleanedData = { ...data };
  if (!cleanedData.targetDate || cleanedData.targetDate === "") delete cleanedData.targetDate;
  
  const targetAmount = Number(cleanedData.targetAmount);
  const currentAmount = Number(cleanedData.currentAmount || 0);

  const goal = await Goal.create({
    userId,
    ...cleanedData,
    targetAmount,
    currentAmount,
  });
  return goal;
};

export const getAllGoalsService = async (userId) => {
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
  return goals;
};

export const getGoalByIdService = async (userId, goalId) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new NotFoundException('Goal not found');
  }
  return goal;
};

export const updateGoalService = async (userId, goalId, data) => {
  // Clean empty strings and cast
  const cleanedData = { ...data };
  if (!cleanedData.targetDate || cleanedData.targetDate === "") {
    cleanedData.targetDate = undefined;
  }
  
  if (cleanedData.targetAmount) cleanedData.targetAmount = Number(cleanedData.targetAmount);
  if (cleanedData.currentAmount !== undefined) cleanedData.currentAmount = Number(cleanedData.currentAmount);

  const goal = await Goal.findOneAndUpdate(
    { _id: goalId, userId },
    { ...cleanedData },
    { new: true, runValidators: true }
  );
  if (!goal) {
    throw new NotFoundException('Goal not found');
  }

  // Auto-complete if amount reached
  if (goal.currentAmount >= goal.targetAmount && goal.status !== 'COMPLETED') {
    goal.status = 'COMPLETED';
    await goal.save();
  } else if (goal.currentAmount < goal.targetAmount && goal.status === 'COMPLETED') {
     goal.status = 'IN_PROGRESS';
     await goal.save();
  }

  return goal;
};

export const deleteGoalService = async (userId, goalId) => {
  const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
  if (!goal) {
    throw new NotFoundException('Goal not found');
  }
  return true;
};

export const contributeGoalService = async (userId, goalId, amount) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new NotFoundException('Goal not found');
  }

  goal.currentAmount += Number(amount);
  
  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = 'COMPLETED';
  } else {
    goal.status = 'IN_PROGRESS';
  }

  await goal.save();
  return goal;
};

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import {
  createGoalService,
  getAllGoalsService,
  getGoalByIdService,
  updateGoalService,
  deleteGoalService,
  contributeGoalService,
} from "../services/goal.service.js";

export const createGoalController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const goal = await createGoalService(userId, req.body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Goal created successfully",
    data: goal,
  });
});

export const getAllGoalsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const goals = await getAllGoalsService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goals fetched successfully",
    data: goals,
  });
});

export const getGoalByIdController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const goal = await getGoalByIdService(userId, req.params.id);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goal fetched successfully",
    data: goal,
  });
});

export const updateGoalController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const goal = await updateGoalService(userId, req.params.id, req.body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goal updated successfully",
    data: goal,
  });
});

export const deleteGoalController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await deleteGoalService(userId, req.params.id);

  return res.status(HTTPSTATUS.OK).json({
    message: "Goal deleted successfully",
  });
});

export const contributeGoalController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { amount } = req.body;
  const goal = await contributeGoalService(userId, req.params.id, amount);

  return res.status(HTTPSTATUS.OK).json({
    message: "Contribution added successfully",
    data: goal,
  });
});

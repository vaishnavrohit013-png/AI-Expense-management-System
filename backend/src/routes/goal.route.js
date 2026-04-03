import { Router } from "express";
import {
  createGoalController,
  getAllGoalsController,
  getGoalByIdController,
  updateGoalController,
  deleteGoalController,
  contributeGoalController,
} from "../controllers/goal.controller.js";

const goalRoutes = Router();

goalRoutes.post("/", createGoalController);
goalRoutes.get("/", getAllGoalsController);
goalRoutes.get("/:id", getGoalByIdController);
goalRoutes.put("/:id", updateGoalController);
goalRoutes.delete("/:id", deleteGoalController);
goalRoutes.post("/:id/contribute", contributeGoalController);

export default goalRoutes;

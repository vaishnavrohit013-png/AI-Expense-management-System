import { Router } from "express";
import { getCalendarExpensesController } from "../controllers/calendar.controller.js";

const calendarRoutes = Router();

calendarRoutes.get("/expenses", getCalendarExpensesController);

export default calendarRoutes;

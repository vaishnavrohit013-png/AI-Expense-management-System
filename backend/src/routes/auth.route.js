import { Router } from "express";
import {
  LoginController,
  RegisterController,
  ForgotPasswordController,
} from "../controllers/auth.controller.js"; 

const authRoutes = Router();

authRoutes.post("/register", RegisterController);
authRoutes.post("/login", LoginController);
authRoutes.post("/forgot-password", ForgotPasswordController);

export default authRoutes;

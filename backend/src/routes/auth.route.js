import { Router } from "express";
import {
  LoginController,
  RegisterController,
  ForgotPasswordController,
  SendOTPController,
  VerifyOTPController,
  ResetPasswordController
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", RegisterController);
authRoutes.post("/login", LoginController);
authRoutes.post("/forgot-password", ForgotPasswordController);
authRoutes.post("/reset-password", ResetPasswordController);
authRoutes.post("/send-otp", SendOTPController);
authRoutes.post("/verify-otp", VerifyOTPController);

export default authRoutes;

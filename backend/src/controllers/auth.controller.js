import { HTTPSTATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import {
  loginService,
  registerService,
  sendOTPService,
  verifyOTPService,
  resetPasswordService
} from "../services/auth.service.js";

import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

import UserModel from "../models/user.model.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import { signJwtToken } from "../utils/jwt.js";
import { sendEmail } from "../mailers/mailer.js";
import { Env } from "../config/env.config.js";

/* -------------------------------------------------------------------------- */
/*                                REGISTER                                    */
/* -------------------------------------------------------------------------- */
export const RegisterController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const result = await registerService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User registered successfully",
    data: result,
  });
});

/* -------------------------------------------------------------------------- */
/*                                  LOGIN                                     */
/* -------------------------------------------------------------------------- */
export const LoginController = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const result = await loginService(body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Login successful",
    data: result,
  });
});



/* -------------------------------------------------------------------------- */
/*                           FORGOT PASSWORD                                   */
/* -------------------------------------------------------------------------- */
export const ForgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestException("Email is required");

  const result = await sendOTPService(email);

  return res.status(HTTPSTATUS.OK).json({
    message: "Reset password OTP sent to your email",
    data: result,
  });
});

/* -------------------------------------------------------------------------- */
/*                            RESET PASSWORD                                   */
/* -------------------------------------------------------------------------- */
export const ResetPasswordController = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    throw new BadRequestException("Email, OTP and new password are required");
  }

  const result = await resetPasswordService(email, otp, newPassword);

  return res.status(HTTPSTATUS.OK).json({
    message: "Password reset successful",
    data: result,
  });
});

/* -------------------------------------------------------------------------- */
/*                                  SEND OTP                                  */
/* -------------------------------------------------------------------------- */
export const SendOTPController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestException("Email is required");

  const result = await sendOTPService(email);
  return res.status(HTTPSTATUS.OK).json({
    message: "OTP sent successfully",
    data: result,
  });
});

/* -------------------------------------------------------------------------- */
/*                                  VERIFY OTP                                */
/* -------------------------------------------------------------------------- */
export const VerifyOTPController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    throw new BadRequestException("Email and OTP are required");

  const result = await verifyOTPService(email, otp);
  return res.status(HTTPSTATUS.OK).json({
    message: "OTP verified successfully",
    data: result,
  });
});

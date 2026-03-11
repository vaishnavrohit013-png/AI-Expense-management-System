import { HTTPSTATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import {
  loginService,
  registerService,
} from "../services/auth.service.js";

import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

import UserModel from "../models/user.model.js";
import { NotFoundException } from "../utils/app-error.js";
import { signJwtToken } from "../utils/jwt.js";
import { sendEmail } from "../mailers/mailer.js";

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

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const { token } = signJwtToken({ userId: user.id });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: resetLink,
    html: `
      <h3>Password Reset</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });

  return res.status(HTTPSTATUS.OK).json({
    message: "Reset password email sent",
  });
});

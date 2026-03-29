import mongoose from "mongoose";

import UserModel from "../models/user.model.js";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model.js";

import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "../utils/app-error.js";

import { calulateNextReportDate } from "../utils/helper.js";
import { signJwtToken } from "../utils/jwt.js";
import { sendEmail } from "../mailers/mailer.js";

/* -------------------------------------------------------------------------- */
/*                               REGISTER SERVICE                              */
/* -------------------------------------------------------------------------- */

export const registerService = async (body) => {
  const session = await mongoose.startSession();
  let createdUser = null;

  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({
        email: body.email,
      }).session(session);

      if (existingUser) {
        throw new BadRequestException("User already exists");
      }

      const newUser = new UserModel({
        ...body,
        isEmailVerified: true, // Mark verified immediately
      });
      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calulateNextReportDate(),
        lastSentDate: null,
      });

      await reportSetting.save({ session });

      const { token, expiresAt } = signJwtToken({
        userId: newUser._id.toString(),
      });

      createdUser = {
        user: {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
        accessToken: token,
        expiresAt,
        message: "Account created successfully.",
      };
      console.log("Transaction successfully completed for user:", newUser.email);
    });

    return createdUser;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/* -------------------------------------------------------------------------- */
/*                                 LOGIN SERVICE                               */
/* -------------------------------------------------------------------------- */

export const loginService = async (body) => {
  const { email, password } = body;

  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) throw new NotFoundException("Email/password not found");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new UnauthorizedException("Invalid email/password");



  const { token, expiresAt } = signJwtToken({
    userId: user._id.toString(),
  });

  const reportSetting = await ReportSettingModel.findOne(
    { userId: user._id },
    { frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    accessToken: token,
    expiresAt,
    reportSetting: reportSetting
      ? {
        _id: reportSetting._id.toString(),
        frequency: reportSetting.frequency,
        isEnabled: reportSetting.isEnabled,
      }
      : null,
  };
};
/* -------------------------------------------------------------------------- */
/*                                SEND OTP SERVICE                             */
/* -------------------------------------------------------------------------- */

export const sendOTPService = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFoundException("User not found with this email");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  const subject = user.isEmailVerified ? "Your Login OTP - FinanceAI" : "Verify your email - FinanceAI";
  const title = user.isEmailVerified ? "FinanceAI Secure Login" : "FinanceAI Email Verification";
  const message = user.isEmailVerified ? "Your one-time password for logging into FinanceAI is:" : "Your verification code for FinanceAI is:";

  if (process.env.RESEND_API_KEY === "test" || !process.env.RESEND_API_KEY) {
    console.log(`[DEV] SendOTP for ${email}: ${otp}`);
  } else {
    try {
      await sendEmail({
        to: email,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; text-align: center;">${title}</h2>
            <p>Hello,</p>
            <p>${message}</p>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1e293b;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="text-align: center; color: #94a3b8; font-size: 12px;">&copy; 2026 FinanceAI Inc. All rights reserved.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
    }
  }

  return { success: true };
};

/* -------------------------------------------------------------------------- */
/*                               VERIFY OTP SERVICE                            */
/* -------------------------------------------------------------------------- */

export const verifyOTPService = async (email, otp) => {
  const user = await UserModel.findOne({ email }).select("+otp +otpExpires");
  if (!user) throw new NotFoundException("User not found");

  if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
    throw new UnauthorizedException("Invalid or expired OTP");
  }

  // Clear OTP and set verified
  user.otp = undefined;
  user.otpExpires = undefined;
  user.isEmailVerified = true;
  await user.save();

  const { token, expiresAt } = signJwtToken({
    userId: user._id.toString(),
  });

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
    },
    accessToken: token,
    expiresAt,
  };
};

/* -------------------------------------------------------------------------- */
/*                            RESET PASSWORD SERVICE                           */
/* -------------------------------------------------------------------------- */

export const resetPasswordService = async (email, otp, newPassword) => {
  const user = await UserModel.findOne({ email }).select("+otp +otpExpires");
  if (!user) throw new NotFoundException("User not found");

  if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
    throw new UnauthorizedException("Invalid or expired OTP");
  }

  // Update password
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { success: true, message: "Password reset successful" };
};


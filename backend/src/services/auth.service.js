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

/* -------------------------------------------------------------------------- */
/*                               REGISTER SERVICE                              */
/* -------------------------------------------------------------------------- */

export const registerService = async (body) => {
  const existingUser = await UserModel.findOne({ email: body.email });

  if (existingUser) {
    throw new BadRequestException("User already exists");
  }

  const newUser = new UserModel({
    ...body,
    isEmailVerified: true,
  });
  await newUser.save();

  const reportSetting = new ReportSettingModel({
    userId: newUser._id,
    frequency: ReportFrequencyEnum.MONTHLY,
    isEnabled: true,
    nextReportDate: calulateNextReportDate(),
    lastSentDate: null,
  });

  await reportSetting.save();

  const { token, expiresAt } = signJwtToken({
    userId: newUser._id.toString(),
  });

  return {
    user: {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    },
    accessToken: token,
    expiresAt,
    message: "Account created successfully.",
  };
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

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  return { success: true, message: "OTP sent (check your email)" };
};

/* -------------------------------------------------------------------------- */
/*                              VERIFY OTP SERVICE                             */
/* -------------------------------------------------------------------------- */

export const verifyOTPService = async (email, otp) => {
  const user = await UserModel.findOne({ email }).select("+otp +otpExpires");
  if (!user) throw new NotFoundException("User not found");

  if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
    throw new UnauthorizedException("Invalid or expired OTP");
  }

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

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { success: true, message: "Password reset successful" };
};


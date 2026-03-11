import mongoose from "mongoose";

import UserModel from "../models/user.model.js";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model.js";

import {
  UnauthorizedException,
  NotFoundException,
} from "../utils/app-error.js";

import { calulateNextReportDate } from "../utils/helper.js";
import { signJwtToken } from "../utils/jwt.js";

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
        throw new UnauthorizedException("User already exists");
      }

      const newUser = new UserModel(body);
      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calulateNextReportDate(),
        lastSentDate: null,
      });

      await reportSetting.save({ session });

      createdUser = {
        user: {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      };
    });

    return createdUser;
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

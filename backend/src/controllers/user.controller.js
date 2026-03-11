import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

import {
  findByIdUserService,
  updateUserService,
} from "../services/user.service.js";

import { HTTPSTATUS } from "../config/http.config.js";
import { updateUserSchema } from "../validators/user.validator.js";

export const getCurrentUserController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await findByIdUserService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "User fetched successfully",
    user,
  });
});

export const updateUserController = asyncHandler(async (req, res) => {
  const body = updateUserSchema.parse(req.body);
  const userId = req.user?._id;
  const profilePic = req.file;

  const user = await updateUserService(userId, body, profilePic);

  return res.status(HTTPSTATUS.OK).json({
    message: "User profile updated successfully",
    data: user,
  });
});

import UserModel from "../models/user.model.js";
import { NotFoundException } from "../utils/app-error.js";

export const findByIdUserService = async (userId) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId,
  body,
  profilePic
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  user.set({
    name: body.name,
  });

  await user.save();

  return user.omitPassword();
};

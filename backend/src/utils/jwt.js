import jwt from "jsonwebtoken";
import { Env } from "../config/env.config.js";

export const signJwtToken = (payload, options = {}) => {
  const token = jwt.sign(payload, Env.JWT_SECRET, {
    expiresIn: Env.JWT_EXPIRES_IN,
    ...options,
  });

  return { token };
};

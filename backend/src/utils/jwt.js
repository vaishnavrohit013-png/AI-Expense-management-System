import jwt from "jsonwebtoken";
import { Env } from "../config/env.config.js";

export const signJwtToken = (payload, options = {}) => {
  const expiresIn = options.expiresIn || Env.JWT_EXPIRES_IN;

  const token = jwt.sign(payload, Env.JWT_SECRET, {
    expiresIn,
    ...options,
  });

  // Calculate expiry date from the token itself so it's always accurate
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000).toISOString()
    : null;

  return { token, expiresAt };
};

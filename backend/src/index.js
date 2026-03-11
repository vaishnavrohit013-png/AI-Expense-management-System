import "dotenv/config";
import "./config/passport.config.js";

import express from "express";
import cors from "cors";
import passport from "passport";

import { Env } from "./config/env.config.js";
import { HTTPSTATUS } from "./config/http.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import connectDatabase from "./config/database.config.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import reportRoutes from "./routes/report.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { passportAuthenticateJwt } from "./config/passport.config.js";
import { initializeCrons } from "./cron/index.js";

/* -------------------- Create Express App -------------------- */

const app = express();

/* -------------------- Middleware -------------------- */

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

/* -------------------- Routes -------------------- */

app.use(`${Env.BASE_PATH}/auth`, authRoutes);
app.use(`${Env.BASE_PATH}/users`, passportAuthenticateJwt, userRoutes);
app.use(`${Env.BASE_PATH}/transactions`, passportAuthenticateJwt, transactionRoutes);
app.use(`${Env.BASE_PATH}/reports`, passportAuthenticateJwt, reportRoutes);
app.use(`${Env.BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);

/* -------------------- Health Check -------------------- */

app.get("/", (req, res) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Financial App Backend Running 🚀",
  });
});

/* -------------------- Error Handler -------------------- */

app.use(errorHandler);

/* -------------------- Start Server -------------------- */

const startServer = async () => {
  try {
    await connectDatabase();
    initializeCrons();

    app.listen(Env.PORT, () => {
      console.log(`🚀 Server running on port ${Env.PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
  }
};

startServer();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "./env.config.js";

export const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);

export const genAIModel = "gemini-2.0-flash";

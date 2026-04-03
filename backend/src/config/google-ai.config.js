import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "./env.config.js";

export const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);

export const genAIModels = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3-flash-preview"
];

export const genAIModel = genAIModels[0];

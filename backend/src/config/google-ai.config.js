import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "./env.config.js";

export const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);

export const genAIModels = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro-latest",
  "gemini-pro",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash",
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.0-flash-exp"
];

export const genAIModel = genAIModels[0];

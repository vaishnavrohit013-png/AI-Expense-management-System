import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-exp"
];

async function test() {
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello");
      console.log(`SUCCESS [${m}]:`, result.response.text());
    } catch (err) {
      console.log(`FAILED [${m}]:`, err.message);
    }
  }
}

test();

import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  const models = [
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b",
  ];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hello");
      const text = result.response.text();
      console.log(`✅ ${modelName}: [${text.substring(0, 20)}...]`);
    } catch (e) {
      console.log(`❌ ${modelName}: [${e.message}]`);
    }
  }
}

checkModels();

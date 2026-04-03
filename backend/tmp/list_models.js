import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    models.models.forEach((m) => {
      console.log(`- ${m.name}`);
    });
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();

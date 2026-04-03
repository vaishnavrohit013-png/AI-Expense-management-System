import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
       fs.writeFileSync("models_output.txt", "GEMINI_API_KEY IS NOT SET IN ENV");
       return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    
    let result = "AVAILABLE MODELS:\n";
    if (data.models) {
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          result += `- ${m.name.split('/').pop()}\n`;
        }
      });
    } else {
      result += "No models found or error: " + JSON.stringify(data);
    }
    fs.writeFileSync("models_output.txt", result);
  } catch (err) {
    fs.writeFileSync("models_output.txt", "Fetch Error: " + err.message);
  }
}

listModels();

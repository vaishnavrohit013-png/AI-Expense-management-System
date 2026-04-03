import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    let result = "AVAILABLE MODELS FOR THIS KEY:\n";
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
    console.log("Done. Results in models_output.txt");
  } catch (err) {
    fs.writeFileSync("models_output.txt", "Fetch Error: " + err.message);
  }
}

listModels();

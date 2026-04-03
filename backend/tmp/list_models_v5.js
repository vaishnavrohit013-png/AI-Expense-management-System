import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: 'backend/.env' });

async function list() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Using Key:", key.substring(0, 10), "...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    if (data.models) {
      console.log("Models found:", data.models.map(m => m.name));
    } else {
      console.log("Error response:", JSON.stringify(data));
    }
  } catch (err) {
    console.log("Fetch failed:", err.message);
  }
}
list();

import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
  console.log("Starting AI Scan Test...");
  const prompt = "Extract total amount from this receipt as JSON: { total: number }";
  
  // Minimal 1x1 white pixel base64 JPG
  const base64Data = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAFA3PEY8MlBGREZaVWRqbW52aXFycW90hGZ3fX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2HhYWFfX6LhX2H/2wBDAQFGRlZqbW92Vl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9WVl9W/8AAEQgAAQABAwIRISIA8QUH/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAEMENTSURBAM96";
  
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: "image/jpeg"
    }
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    console.log("✅ SUCCESS:", result.response.text());
  } catch (error) {
    console.error("❌ FAILED:", error.message);
  }
}

test();

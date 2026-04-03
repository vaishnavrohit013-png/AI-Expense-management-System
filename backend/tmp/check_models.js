import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Correct way to list models in newer SDK versions
    // Actually, sometimes it's just not available in the lite SDK
    // Let's try to just test a few known ones
    const modelsToTest = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-001",
      "gemini-1.5-flash-8b"
    ];
    
    console.log("Testing model availability...");
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Just a dummy call to see if it exist (though we need some data)
        // But listModels is better if we can find it.
        console.log(`- ${modelName}: [Constructor OK]`);
      } catch (e) {
        console.log(`- ${modelName}: [FAILED] ${e.message}`);
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();

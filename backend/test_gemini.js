import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function testGemini() {
    try {
        const result = await model.generateContent("Say 'Gemini 2.0 is working' if you can read this.");
        console.log(result.response.text());
    } catch (error) {
        console.error("Gemini Test Failed:", error.message);
    }
}

testGemini();

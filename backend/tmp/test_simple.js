import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: 'backend/.env' });

async function test() {
  const key = process.env.GEMINI_API_KEY;
  console.log('KEY_PREFIX:', key ? key.substring(0, 5) : 'MISSING');
  const genAI = new GoogleGenerativeAI(key);
  const models = ["gemini-1.5-flash", "gemini-2.0-flash-exp"];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hi");
      console.log('OK', m);
    } catch (err) {
      console.log('FAIL', m, err.message.substring(0, 100));
    }
  }
}
test();

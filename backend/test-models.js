import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro', 'gemini-1.5-flash-latest'];
  const results = {};
  for(let m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const prompt = "Say hi";
      await model.generateContent(prompt);
      results[m] = "SUCCESS";
    } catch(err) {
      results[m] = err.message;
    }
  }
  fs.writeFileSync('model-test.json', JSON.stringify(results, null, 2));
}
listModels();

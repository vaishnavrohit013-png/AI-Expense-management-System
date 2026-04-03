import 'dotenv/config';
import fs from 'fs';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    fs.writeFileSync('model-list.json', JSON.stringify(data, null, 2));
    console.log("Written to model-list.json");
  } catch(err) {
    console.error(err);
  }
}
listModels();

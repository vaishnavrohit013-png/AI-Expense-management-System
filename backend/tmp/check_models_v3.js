import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  const versions = ["v1", "v1beta"];
  for (const v of versions) {
    try {
      console.log(`Checking version: ${v}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${API_KEY}`);
      const data = await response.json();
      if (data.models) {
        console.log(`Available models in ${v}:`);
        data.models.forEach(m => console.log(`- ${m.name}`));
      } else {
        console.log(`No models found in ${v} or error: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`Error in ${v}: ${e.message}`);
    }
  }
}

listModels();

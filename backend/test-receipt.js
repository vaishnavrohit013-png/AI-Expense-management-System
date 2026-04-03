import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables so the Gemini API Key is available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { genAI, genAIModel } from "./src/config/google-ai.config.js";

async function testReceiptScanner(imagePath) {
    console.log(`[TEST] Starting AI Receipt Scan on file: ${imagePath}`);
    
    if (!fs.existsSync(imagePath)) {
        console.error(`[ERROR] File not found at path: ${imagePath}`);
        return;
    }

    try {
        // Read file and convert to base64
        const fileContent = fs.readFileSync(imagePath);
        const base64Data = Buffer.from(fileContent).toString('base64');
        
        // Simple mime-type detection for the test script
        const extension = path.extname(imagePath).toLowerCase();
        let mimeType = 'image/jpeg';
        if (extension === '.png') mimeType = 'image/png';
        if (extension === '.webp') mimeType = 'image/webp';
        
        const prompt = `You are an AI specialized in OCR and financial data extraction. 
        Analyze the attached receipt image and extract the following details as a valid JSON object:
        {
          "title": "A short, descriptive title for the expense (e.g., Starbucks Coffee)",
          "amount": <number: total amount including tax>,
          "date": "YYYY-MM-DD" (Format strictly as YYYY-MM-DD. Use today's date if not found: ${new Date().toISOString().split('T')[0]}),
          "merchant": "Name of the merchant/store",
          "category": "Pick the most relevant: FOOD, TRANSPORT, SHOPPING, ENTERTAINMENT, UTILITIES, or OTHER"
        }
        Return ONLY the raw JSON object, no markdown, no explanation.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        console.log(`[TEST] Analyzing image with Gemini model: ${genAIModel}... Please wait.`);
        const model = genAI.getGenerativeModel({ model: genAIModel });
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        console.log("\n====== RAW AI RESPONSE ======");
        console.log(responseText);
        console.log("=============================\n");

        let extractedData;
        try {
            const cleanedText = responseText.replace(/```json|```/g, '').trim();
            extractedData = JSON.parse(cleanedText);
            console.log("✅ PERFECT! JSON successfully parsed. Final Output:");
            console.dir(extractedData, { depth: null, colors: true });
        } catch (err) {
            console.error("❌ FAILED to parse JSON. Gemini did not return a pure JSON string.");
            console.error(err.message);
        }

    } catch (error) {
        console.error("❌ AI API ERROR:", error.message);
    }
}

// Get the image path from command-line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: node test-receipt.js <path-to-receipt-image>");
    process.exit(1);
}

testReceiptScanner(args[0]);

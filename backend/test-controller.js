import { chatWithAIController } from './src/controllers/ai.controller.js';
import mongoose from 'mongoose';
import 'dotenv/config';

async function testController() {
    const req = {
        body: {
            message: "What is my highest expense category?",
            history: []
        },
        user: {
            _id: new mongoose.Types.ObjectId() // Fake user ID
        }
    };
    
    const res = {
        status: (code) => {
            console.log("Status:", code);
            return {
                json: (data) => console.log("Response:", data)
            };
        }
    };

    mongoose.connect(process.env.MONGO_URI);
    await chatWithAIController(req, res);
    mongoose.disconnect();
}
testController();

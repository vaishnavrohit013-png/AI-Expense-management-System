import axios from 'axios';
import 'dotenv/config';

async function testChat() {
    try {
        // First login
        const loginRes = await axios.post('http://localhost:8000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = loginRes.data.data.accessToken;

        // Then chat
        const res = await axios.post('http://localhost:8000/api/ai/chat', {
            message: 'What is my highest expense?',
            history: []
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
testChat();

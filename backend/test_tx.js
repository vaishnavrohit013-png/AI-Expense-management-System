// Test transaction creation
const http = require('http');

async function run() {
  try {
    // 1. login 
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@test.com', password: 'password123' })
    });
    const { data: userData } = await loginRes.json();
    const token = userData.accessToken;

    // 2. add tx
    const txRes = await fetch('http://localhost:8000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
         type: 'EXPENSE', 
         title: '9999', 
         amount: 44, 
         category: 'Salary', 
         date: '2026-04-01', 
         description: '33' 
      })
    });
    const txData = await txRes.json();
    console.log("Status:", txRes.status);
    console.log("Data:", JSON.stringify(txData, null, 2));
  } catch(e) { console.error(e) }
}
run();

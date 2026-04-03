/**
 * Quick test for the scan-receipt API.
 */
import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BASE = 'http://localhost:8000/api';

async function getToken() {
  const email = 'scantest' + Date.now() + '@test.com';
  const password = 'testpass123';
  // Register
  const regRes = await axios.post(`${BASE}/auth/register`, {
    name: 'Scan Tester', email, password, confirmPassword: password,
  });
  // register returns data.data.accessToken
  const token = regRes.data?.data?.accessToken;
  if (!token) throw new Error('No accessToken in register response: ' + JSON.stringify(regRes.data));
  return token;
}

async function test() {
  console.log('=== Receipt Scan API Test ===\n');

  let token;
  try {
    token = await getToken();
    console.log('1. ✓ Auth token obtained\n');
  } catch (err) {
    console.error('1. ✗ Auth failed:', err.response?.data?.message || err.message);
    return;
  }

  const testImagePath = 'C:\\Users\\rohit\\.gemini\\antigravity\\brain\\88c2584f-8ad7-42e3-bed7-080c94f462c1\\test_receipt_1775148612194.png';

  let imageBuffer;
  if (fs.existsSync(testImagePath)) {
    imageBuffer = fs.readFileSync(testImagePath);
    console.log('2. ✓ Test receipt loaded:', (imageBuffer.length / 1024).toFixed(1), 'KB\n');
  } else {
    console.log('2. ✗ Test image not found at', testImagePath);
    return;
  }

  const form = new FormData();
  form.append('receipt', imageBuffer, { filename: 'receipt.png', contentType: 'image/png' });

  console.log('3. Calling POST /api/ai/scan-receipt (may take 15-30s)...');
  try {
    const res = await axios.post(`${BASE}/ai/scan-receipt`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
      timeout: 60000,
    });
    console.log('   ✓ HTTP', res.status);
    console.log('   ✓ success:', res.data.success);
    console.log('   ✓ message:', res.data.message);
    console.log('\n   Extracted data:');
    console.log(JSON.stringify(res.data.data, null, 2));
    console.log('\n✅ API WORKS!');
  } catch (err) {
    console.error('   ✗ HTTP', err.response?.status);
    console.error('   ✗ Body:', JSON.stringify(err.response?.data, null, 2) || err.message);
  }
}

test();

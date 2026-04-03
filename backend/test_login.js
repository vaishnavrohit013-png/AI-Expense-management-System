fetch('http://127.0.0.1:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'testuser@test.com', password: 'password123' })
})
.then(r => r.json())
.then(data => console.log("DATA=>", JSON.stringify(data, null, 2)))
.catch(console.error);

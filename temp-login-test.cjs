require('dotenv').config();

(async () => {
  try {
    const res = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'superadmin', password: 'AcseS2026!' }),
    });
    console.log('status', res.status);
    const body = await res.text();
    console.log('body', body);
  } catch (err) {
    console.error('error', err.message);
    process.exit(1);
  }
})();

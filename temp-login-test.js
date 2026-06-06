import 'dotenv/config';
import { fileURLToPath } from 'url';
import { chmodSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.chdir(__dirname);

async function main() {
  const res = await fetch('http://localhost:3002/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'superadmin', password: 'AcseS2026!' }),
  });
  console.log('status', res.status);
  const body = await res.text();
  console.log('body', body);
}

main().catch((err) => {
  console.error('error', err.message);
  process.exit(1);
});

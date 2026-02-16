async function run() {
  try {
    const health = await fetch('https://educonnect-lhkv.onrender.com/health');
    const healthText = await health.text();
    console.log('/health ->', health.status, healthText);

    const username = 'rendertest' + Date.now();
    const res = await fetch('https://educonnect-lhkv.onrender.com/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name: 'Render Test', password: 'Pass1234!' }),
    });
    const text = await res.text();
    console.log('/api/register ->', res.status, text);
  } catch (err) {
    console.error('error', err);
    process.exitCode = 1;
  }
}

run();

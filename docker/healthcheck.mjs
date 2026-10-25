try {
  const response = await fetch('http://127.0.0.1:3000/api/health', {
    signal: AbortSignal.timeout(4000),
  });
  const result = await response.json();
  process.exit(response.ok && result.status === 'ok' ? 0 : 1);
} catch {
  process.exit(1);
}

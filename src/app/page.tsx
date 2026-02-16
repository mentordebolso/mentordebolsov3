export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Mentor de Bolso</h1>
      <p>Backend rodando. Use o Telegram pra interagir.</p>
      <ul>
        <li>Webhook: <code>/api/telegram/webhook</code></li>
        <li>Cron: <code>/api/cron/morning</code>, <code>/api/cron/afternoon</code>, <code>/api/cron/night</code></li>
      </ul>
    </main>
  );
}

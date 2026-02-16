import { mustGetEnv } from './env';

export type TelegramSendMessage = {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
};

export async function tgSendMessage(msg: TelegramSendMessage) {
  const token = mustGetEnv('TELEGRAM_BOT_TOKEN');
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ disable_web_page_preview: true, ...msg })
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Telegram sendMessage failed: ${res.status} ${t}`);
  }
}

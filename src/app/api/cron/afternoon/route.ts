import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tgSendMessage } from '@/lib/telegram';
import { buildMentorMessage } from '@/lib/mentor';

export const runtime = 'nodejs';

export async function GET() {
  const sb = supabaseAdmin();
  const { data: users, error } = await sb.from('user_settings').select('*').eq('alerts_enabled', true);
  if (error) throw error;

  const content = buildMentorMessage('afternoon');

  for (const u of users || []) {
    await sb.from('recommendations').insert({
      user_id: u.id,
      alert_kind: 'afternoon',
      title: content.title,
      message: content.message,
      meta: {}
    });
    await tgSendMessage({ chat_id: u.telegram_chat_id, text: `${content.title}\n\n${content.message}` });
  }

  return NextResponse.json({ ok: true, sent: users?.length ?? 0 });
}

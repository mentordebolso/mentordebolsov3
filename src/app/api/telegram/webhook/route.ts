import { NextResponse } from 'next/server';
import { mustGetEnv } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';
import { tgSendMessage } from '@/lib/telegram';
import { buildMentorMessage } from '@/lib/mentor';

export const runtime = 'nodejs';

function verifySecret(req: Request) {
  const expected = process.env.TELEGRAM_SECRET_TOKEN;
  if (!expected) return true; // allow if not configured
  const got = req.headers.get('x-telegram-bot-api-secret-token');
  return got === expected;
}

async function ensureUser(chatId: number) {
  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from('user_settings')
    .select('*')
    .eq('telegram_chat_id', chatId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await sb
    .from('user_settings')
    .insert({ telegram_chat_id: chatId })
    .select('*')
    .single();

  if (error) throw error;

  // default watchlist (Flávio)
  const defaults = [
    { symbol: 'BTC', kind: 'crypto' },
    { symbol: 'ETH', kind: 'crypto' },
    { symbol: 'ITUB4', kind: 'stock_br' },
    { symbol: 'PETR4', kind: 'stock_br' },
    { symbol: 'VALE3', kind: 'stock_br' },
    { symbol: 'BPAC11', kind: 'stock_br' },
    { symbol: 'ABEV3', kind: 'stock_br' },
    { symbol: 'BBAS3', kind: 'stock_br' },
    { symbol: 'BBSE3', kind: 'stock_br' },
    { symbol: 'ITSA4', kind: 'stock_br' },
    { symbol: 'MXRF11', kind: 'fii_br' },
    { symbol: 'GARE11', kind: 'fii_br' },
    { symbol: 'XPML11', kind: 'fii_br' },
    { symbol: 'VGHF11', kind: 'fii_br' },
    { symbol: 'HGLG11', kind: 'fii_br' }
  ];

  await sb.from('watchlist').insert(defaults.map(d => ({ ...d, user_id: created.id })));

  return created;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) return new NextResponse('unauthorized', { status: 401 });

  // Minimal Telegram update types
  const update = await req.json().catch(() => null) as any;
  if (!update) return NextResponse.json({ ok: true });

  const msg = update.message || update.edited_message;
  if (!msg?.chat?.id) return NextResponse.json({ ok: true });

  const chatId = Number(msg.chat.id);
  const text: string = (msg.text || '').trim();

  await ensureUser(chatId);

  if (text === '/start') {
    await tgSendMessage({
      chat_id: chatId,
      text:
        [
          'Fechado. Eu sou teu Mentor de Bolso.',
          '',
          'Comandos:',
          '/status — panorama e regras',
          '/plano — plano 30 dias (v1)',
          '/ok — marcar que você fez o aporte/ação',
          '/nao — marcar que você não fez'
        ].join('\n')
    });
    return NextResponse.json({ ok: true });
  }

  if (text === '/status') {
    await tgSendMessage({ chat_id: chatId, text: buildMentorMessage('manual').message });
    return NextResponse.json({ ok: true });
  }

  if (text === '/plano') {
    await tgSendMessage({
      chat_id: chatId,
      text:
        [
          'Plano 30 dias (v1):',
          '• Aporte: R$100/semana',
          '• Cripto: 70% BTC / 30% ETH (spot)',
          '• Regras: sem alavancagem, sem altcoin pequena, sem operar por impulso',
          '• Ações/FIIs: monitorar + aprender (sem automatizar execução por enquanto)'
        ].join('\n')
    });
    return NextResponse.json({ ok: true });
  }

  if (text === '/ok' || text === '/nao') {
    const sb = supabaseAdmin();
    const { data: user } = await sb
      .from('user_settings')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single();

    await sb.from('decisions').insert({
      user_id: user.id,
      decision: text === '/ok' ? 'done' : 'skipped',
      notes: null
    });

    await tgSendMessage({ chat_id: chatId, text: text === '/ok' ? 'Boa. Consistência é rei.' : 'Tranquilo. O importante é seguir o plano sem culpa.' });
    return NextResponse.json({ ok: true });
  }

  // fallback
  await tgSendMessage({ chat_id: chatId, text: 'Comandos: /start /status /plano /ok /nao' });
  return NextResponse.json({ ok: true });
}

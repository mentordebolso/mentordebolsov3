# Mentor de Bolso (MVP)

Telegram bot + alertas 3x/dia + diário de decisões, com Supabase (banco) e deploy na Vercel.

## Segurança (importante)
Você postou tokens/keys no chat. **Considere vazado**.
- Telegram: gere um **novo token** no BotFather (`/revoke` ou criar novo bot) e use o novo.
- Supabase: **não exponha** a `SERVICE_ROLE_KEY` em client-side; use só no server.

## Stack
- Next.js (App Router) rodando na Vercel
- Supabase (Postgres)
- Telegram Webhook
- Cron: Vercel Cron (e opção de Supabase scheduler)

## Setup
1) Crie um projeto no Supabase.
2) Rode o SQL em `supabase/schema.sql`.
3) Copie `.env.example` para `.env.local` e preencha.
4) `npm i`
5) `npm run dev`

## Rotas
- POST `/api/telegram/webhook` (Telegram webhook)
- GET  `/api/cron/morning`
- GET  `/api/cron/afternoon`
- GET  `/api/cron/night`

## Configurar webhook do Telegram
Recomendado usar `secret_token`.

Exemplo (rode no seu terminal, não commite token):

```bash
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://SEU-PROJETO.vercel.app/api/telegram/webhook" \
  -d "secret_token=$TELEGRAM_SECRET_TOKEN"
```

## Cron
### Vercel Cron
Configure 3 cron jobs chamando:
- `/api/cron/morning`
- `/api/cron/afternoon`
- `/api/cron/night`

### Supabase Scheduled (opcional)
Você pode agendar no Supabase pra chamar os endpoints acima, ou mover a lógica pra edge functions.

## Roadmap
- v0: mentor + alertas + diário
- v1: painel web simples
- v2: paper trading
- v3: execução real (Coinbase) com limites de risco

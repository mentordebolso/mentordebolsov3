'use client';

import React from 'react';
import Link from 'next/link'; // Importar Link do Next.js
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAdvancedSettings } from '@/hooks/useAdvancedSettings'; // Importar o hook de configurações avançadas
import { WatchlistForm } from '@/components/WatchlistForm';
import { WatchlistTable } from '@/components/WatchlistTable';

export default function Preview() {
  const { settings, loading: loadingAdvancedSettings, error: errorAdvancedSettings } = useAdvancedSettings();

  // Use as configurações avançadas para o polling interval, com fallback para 1 minuto (60000ms)
  const pollingInterval = settings?.polling_interval_ms || 60000;

  const {
    watchlist,
    prices,
    loadingWatchlist,
    loadingPrices,
    error: errorWatchlist,
    handleAddItem,
    handleRemoveItem,
  } = useWatchlist(pollingInterval); // Passa o intervalo configurável

  const currentLoading = loadingWatchlist || loadingPrices || loadingAdvancedSettings;
  const currentError = errorWatchlist || errorAdvancedSettings;

  return (
    <main style={{
      minHeight: '100vh',
      color: '#e8f0ff',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
      background:
        'radial-gradient(900px 500px at 20% 0%, rgba(76,201,240,.18), transparent 50%),' +
        'radial-gradient(900px 500px at 80% 0%, rgba(50,213,131,.14), transparent 50%),' +
        '#0b1220'
    }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,.10)', padding: '28px 18px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Mentor de Bolso</h1>
          <div style={{ marginTop: 6, color: '#9db0d0', fontSize: 14 }}>
            Preview do frontend (MVP). O “core” do produto está no <b>Telegram</b> + logs no Supabase.
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: 18 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr .8fr',
          gap: 14
        }}>
          <section style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={pillStyle}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: '#32d583', display: 'inline-block' }} />
                Status: <b>Calmo</b> (exemplo)
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a style={btnStyle} href="#">Ver plano 30 dias</a>
                {/* Botão Configurar alertas agora é um link real para /settings */}
                <Link href="/settings" style={{ ...btnStyle, background: 'rgba(255,255,255,.04)' }}>Configurações</Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
              <div style={kpiStyle}><div style={kpiLabel}>Aporte semanal</div><div style={kpiValue}>R$ 100</div></div>
              <div style={kpiStyle}><div style={kpiLabel}>Cripto (spot)</div><div style={kpiValue}>70% BTC / 30% ETH</div></div>
              <div style={kpiStyle}><div style={kpiLabel}>Regras</div><div style={kpiValue}>Sem alavancagem</div></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Ação de hoje</h3>
                  <span style={tagStyle}>Manhã (09:00)</span>
                </div>
                {/* Exibe a ação diária configurada ou um placeholder */}
                <p style={pStyle}>
                  {settings?.daily_action || 'Nenhuma ação diária configurada ainda. Configure em "Configurações".'}
                </p>
              </div>

              <div style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Checklist Anti-Impulso</h3>
                  <span style={tagStyle}>Guardrails</span>
                </div>
                {/* Exibe os itens do checklist configurados ou um placeholder */}
                <ul style={{ ...pStyle, margin: '0', padding: '0 0 0 1.2em' }}>
                  {settings?.anti_impulse_checklist && settings.anti_impulse_checklist.length > 0 ? (
                    settings.anti_impulse_checklist.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>Nenhum item no checklist. Configure em "Configurações".</li>
                  )}
                </ul>
              </div>

              {/* ----- WATCHLIST REFACTORADA ----- */}
              <div style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Minha Watchlist</h3>
                </div>

                <WatchlistForm onAddItem={handleAddItem} error={currentError} loading={currentLoading} />
                <WatchlistTable
                  watchlist={watchlist}
                  prices={prices}
                  onRemoveItem={handleRemoveItem}
                  loading={currentLoading}
                />
              </div>
              {/* ----- FIM WATCHLIST REFACTORADA ----- */}

            </div>
          </section>

          <aside style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: 14 }}>Como você usa (de verdade)</h3>
            <p style={{ ...pStyle, marginTop: 8 }}>
              O app web é só um painel. O “Mentor” vive no Telegram:
              <br /><br />
              <code style={{ color: '#b7d5ff' }}>/start</code> cria teu perfil e watchlist.<br />
              <code style={{ color: '#b7d5ff' }}>/plano</code> mostra o plano 30 dias.<br />
              <code style={{ color: '#b7d5ff' }}>/ok</code> e <code style={{ color: '#b7d5ff' }}>/nao</code> registram se você fez a tarefa.<br />
            </p>

            <div style={itemStyle}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Próxima evolução</h3>
              <p style={pStyle}>
                • Dashboard com histórico e métricas<br />
                • Paper trading<br />
                • Execução real na Coinbase (com limites)<br />
              </p>
            </div>

            <div style={itemStyle}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Links internos (backend)</h3>
              <p style={pStyle}>
                <code style={{ color: '#b7d5ff' }}>/api/telegram/webhook</code><br />
                <code style={{ color: '#b7d5ff' }}> /api/cron/morning</code><br />
                <code style={{ color: '#b7d5ff' }}> /api/cron/afternoon</code><br />
                <code style={{ color: '#b7d5ff' }}> /api/cron/night</code><br />
              </p>
            </div>
          </aside>
        </div>

        <div style={{ padding: 18, color: '#9db0d0', fontSize: 12 }}>
          Preview em rota Next.js: <code style={{ color: '#b7d5ff' }}>/preview</code>
        </div>
      </div>
    </main>
  );
}

// Estilos existentes (mantidos como estavam)
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 14,
  padding: 14
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 999,
  color: '#9db0d0',
  fontSize: 12
};

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,.10)',
  background: 'rgba(76,201,240,.10)',
  color: '#e8f0ff',
  textDecoration: 'none',
  fontSize: 13
};

const kpiStyle: React.CSSProperties = {
  padding: 12,
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 12,
  background: 'rgba(0,0,0,.12)'
};

const kpiLabel: React.CSSProperties = { color: '#9db0d0', fontSize: 12 };
const kpiValue: React.CSSProperties = { fontSize: 18, marginTop: 6 };

const itemStyle: React.CSSProperties = {
  padding: 12,
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 12,
  background: 'rgba(0,0,0,.12)'
};

const tagStyle: React.CSSProperties = {
  display: 'inline-flex',
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,.10)',
  color: '#9db0d0'
};

const pStyle: React.CSSProperties = { margin: '8px 0 0', color: '#9db0d0', fontSize: 13, lineHeight: 1.5 };

'use client';

import React, { useEffect, useState, FormEvent } from 'react';

// Interface para o item da watchlist
interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  kind: string; // "crypto", "stock_br", "fii_br"
  created_at: string;
}

// Interface para os preços (retorno da /api/prices/get)
interface PriceData {
  price: number;
  last_updated: string;
}

// Mapeamento de símbolos de cripto para IDs da CoinMarketCap (exemplo)
// Em um projeto real, isso viria de um banco de dados ou de uma API de mapeamento
const COINMARKETCAP_ID_MAP: { [symbol: string]: string } = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  // Adicione outros mapeamentos conforme necessário
};

export default function Preview() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [prices, setPrices] = useState<{[symbol: string]: PriceData}>({}); // Novo estado para os preços
  const [loadingWatchlist, setLoadingWatchlist] = useState(true); // Renomeado para clareza
  const [loadingPrices, setLoadingPrices] = useState(false); // Novo estado para carregamento de preços
  const [error, setError] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState('');
  const [newKind, setNewKind] = useState('stock_br');

  // Função para buscar a watchlist e os preços (reutilizável para polling)
  async function fetchWatchlistAndPrices() {
    setLoadingWatchlist(true);
    setError(null);
    try {
      // 1. Buscar a watchlist do Supabase
      const watchlistResponse = await fetch('/api/watchlist/get');
      if (!watchlistResponse.ok) {
        throw new Error(`HTTP error! status: ${watchlistResponse.status} ao buscar watchlist`);
      }
      const watchlistData: WatchlistItem[] = await watchlistResponse.json();
      setWatchlist(watchlistData);

      // 2. Filtrar apenas as criptomoedas para enviar à API de preços
      const cryptoItemsToFetch = watchlistData
        .filter(item => item.kind === 'crypto')
        .map(item => ({ symbol: item.symbol, kind: item.kind }));

      if (cryptoItemsToFetch.length > 0) {
        setLoadingPrices(true);
        const pricesResponse = await fetch('/api/prices/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cryptoItemsToFetch }),
        });

        if (!pricesResponse.ok) {
          const errorData = await pricesResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${pricesResponse.status} ao buscar preços`);
        }
        const pricesData: {[symbol: string]: PriceData} = await pricesResponse.json();
        setPrices(pricesData);
      } else {
        setPrices({}); // Limpa os preços se não houver criptos na watchlist
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingWatchlist(false);
      setLoadingPrices(false);
    }
  }

  // useEffect para carregar a watchlist e preços iniciais, e configurar o polling
  useEffect(() => {
    fetchWatchlistAndPrices(); // Primeira carga

    const intervalId = setInterval(() => {
      fetchWatchlistAndPrices(); // Atualiza a cada 10 segundos
    }, 10000); // 10 segundos

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, []);

  // Handler para adicionar um novo item
  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newSymbol || !newKind) {
      setError('Símbolo e Tipo são obrigatórios.');
      return;
    }

    try {
      const response = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newSymbol, kind: newKind }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setNewSymbol('');
      // setWatchlist([...watchlist, newItemData]); // Se a API retornar o item adicionado
      await fetchWatchlistAndPrices(); // Recarrega tudo para ter os preços atualizados
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler para remover um item
  const handleRemoveItem = async (id: string) => {
    setError(null);
    try {
      const response = await fetch('/api/watchlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // setWatchlist(watchlist.filter(item => item.id !== id)); // Otimização: remover localmente
      await fetchWatchlistAndPrices(); // Recarrega tudo para ter a lista atualizada
    } catch (err: any) {
      setError(err.message);
    }
  };

  const currentLoading = loadingWatchlist || loadingPrices;

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
                <a style={{ ...btnStyle, background: 'rgba(255,255,255,.04)' }} href="#">Configurar alertas</a>
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
                <p style={pStyle}><b>Hoje:</b> manter consistência. Se for dia de aporte, comprar aos poucos (spot) e registrar no diário.</p>
              </div>

              <div style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Checklist anti-impulso</h3>
                  <span style={tagStyle}>Guardrails</span>
                </div>
                <p style={pStyle}>
                  • Estou com FOMO?<br />
                  • Estou tentando “recuperar prejuízo” rápido?<br />
                  • Se eu errar, minha perda máxima está controlada?
                </p>
              </div>

              {/* ----- INÍCIO DA WATCHLIST DINÂMICA COM FORMULÁRIO E PREÇOS ----- */}
              <div style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Minha Watchlist</h3>
                </div>

                {/* Formulário para adicionar item */}
                <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Símbolo (Ex: BTC, VALE3)"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    style={inputStyle}
                    required
                  />
                  <select
                    value={newKind}
                    onChange={(e) => setNewKind(e.target.value)}
                    style={selectStyle}
                    required
                  >
                    <option value="stock_br">Ação BR</option>
                    <option value="fii_br">FII BR</option>
                    <option value="crypto">Cripto</option>
                  </select>
                  <button type="submit" style={addButtonStyle}>Adicionar</button>
                </form>

                {currentLoading && <p style={pStyle}>Carregando dados da watchlist e preços...</p>}
                {error && <p style={{ ...pStyle, color: '#ff6b6b' }}>Erro: {error}</p>}
                {!currentLoading && !error && (
                  watchlist.length === 0 ? (
                    <p style={pStyle}>Nenhum ativo na watchlist. Adicione alguns acima!</p>
                  ) : (
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>Símbolo</th>
                          <th style={tableHeaderStyle}>Tipo</th>
                          <th style={tableHeaderStyle}>Preço Atual (USD)</th>
                          <th style={tableHeaderStyle}>Última Atualização</th>
                          <th style={tableHeaderStyle}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {watchlist.map((item: WatchlistItem) => {
                          const itemPriceData = prices[item.symbol];
                          return (
                            <tr key={item.id}>
                              <td style={tableCellStyle}>{item.symbol}</td>
                              <td style={tableCellStyle}>{item.kind}</td>
                              <td style={tableCellStyle}>
                                {item.kind === 'crypto' && itemPriceData?.price
                                  ? `$${itemPriceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : (item.kind !== 'crypto' ? 'Aguardando API' : '-')}
                              </td>
                              <td style={tableCellStyle}>
                                {item.kind === 'crypto' && itemPriceData?.last_updated
                                  ? new Date(itemPriceData.last_updated).toLocaleTimeString()
                                  : '-'}
                              </td>
                              <td style={tableCellStyle}>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  style={removeButtonStyle}
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )
                )}
              </div>
              {/* ----- FIM DA WATCHLIST DINÂMICA COM FORMULÁRIO E PREÇOS ----- */}

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
                <code style={{ color: '#b7d5ff' }}>/api/cron/morning</code><br />
                <code style={{ color: '#b7d5ff' }}>/api/cron/afternoon</code><br />
                <code style={{ color: '#b7d5ff' }}>/api/cron/night</code><br />
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

// Novos estilos para a tabela da watchlist
const tableStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 10,
  borderCollapse: 'collapse',
};

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,.10)',
  color: '#9db0d0',
  fontSize: 12,
};

const tableCellStyle: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,.05)',
  color: '#e8f0ff',
  fontSize: 13,
  display: 'table-cell',
  verticalAlign: 'middle',
};

// Novos estilos para inputs e botões
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e8f0ff',
  fontSize: 13,
  flexGrow: 1,
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e8f0ff',
  fontSize: 13,
};

const addButtonStyle: React.CSSProperties = {
  background: '#32d583',
  color: '#0b1220',
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 'bold',
  flexShrink: 0,
};

const removeButtonStyle: React.CSSProperties = {
  background: '#ff6b6b',
  color: '#ffffff',
  border: 'none',
  borderRadius: 6,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold',
};

'use client';

import React, { useEffect, useState, FormEvent } from 'react'; // Adicionar FormEvent

// Interface para o item da watchlist (para tipagem)
interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  kind: string;
  created_at: string;
}

export default function Preview() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState(''); // Estado para o input do novo símbolo
  const [newKind, setNewKind] = useState('stock_br'); // Estado para o input do novo tipo, com valor padrão

  // Função para buscar a watchlist (refatorada para ser reutilizável)
  async function fetchWatchlist() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/watchlist/get');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWatchlist(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // useEffect para carregar a watchlist na montagem do componente
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Handler para adicionar um novo item
  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault(); // Previne o recarregamento da página
    setError(null); // Limpa erros anteriores

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

      setNewSymbol(''); // Limpa o input do símbolo
      // setNewKind('stock_br'); // Mantém o tipo padrão ou limpa, dependendo da UX
      await fetchWatchlist(); // Recarrega a lista para mostrar o novo item
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handler para remover um item
  const handleRemoveItem = async (id: string) => {
    setError(null); // Limpa erros anteriores
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

      await fetchWatchlist(); // Recarrega a lista para remover o item
    } catch (err: any) {
      setError(err.message);
    }
  };


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

              {/* ----- INÍCIO DA WATCHLIST DINÂMICA COM FORMULÁRIO ----- */}
              <div style={itemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Minha Watchlist</h3>
                  {/* <a style={{ ...btnStyle, background: 'rgba(255,255,255,.04)' }} href="#">Config</a> */}
                </div>

                {/* Formulário para adicionar item */}
                <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Símbolo (Ex: BTC, VALE3)"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())} // Converte para maiúsculas
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
                    {/* Adicione outros tipos conforme necessário */}
                  </select>
                  <button type="submit" style={addButtonStyle}>Adicionar</button>
                </form>

                {loading && <p style={pStyle}>Carregando watchlist...</p>}
                {error && <p style={{ ...pStyle, color: '#ff6b6b' }}>Erro: {error}</p>}
                {!loading && !error && (
                  watchlist.length === 0 ? (
                    <p style={pStyle}>Nenhum ativo na watchlist. Adicione alguns acima!</p>
                  ) : (
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>Símbolo</th>
                          <th style={tableHeaderStyle}>Tipo</th>
                          <th style={tableHeaderStyle}>Adicionado em</th>
                          <th style={tableHeaderStyle}>Ações</th> {/* Nova coluna para ações */}
                        </tr>
                      </thead>
                      <tbody>
                        {watchlist.map((item: WatchlistItem) => (
                          <tr key={item.id}>
                            <td style={tableCellStyle}>{item.symbol}</td>
                            <td style={tableCellStyle}>{item.kind}</td>
                            <td style={tableCellStyle}>{new Date(item.created_at).toLocaleDateString()}</td>
                            <td style={tableCellStyle}>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                style={removeButtonStyle}
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
              {/* ----- FIM DA WATCHLIST DINÂMICA COM FORMULÁRIO ----- */}

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
  display: 'table-cell', // Garante que o display seja de célula de tabela
  verticalAlign: 'middle', // Alinha verticalmente
};

// Novos estilos para inputs e botões
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e8f0ff',
  fontSize: 13,
  flexGrow: 1, // Permite que o input cresça
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
  background: '#32d583', // Verde para adicionar
  color: '#0b1220',
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 'bold',
  flexShrink: 0, // Não permite que o botão diminua
};

const removeButtonStyle: React.CSSProperties = {
  background: '#ff6b6b', // Vermelho para remover
  color: '#ffffff',
  border: 'none',
  borderRadius: 6,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold',
};

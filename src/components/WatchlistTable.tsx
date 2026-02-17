import React from 'react';

// Interfaces (copiadas do useWatchlist.ts)
interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  kind: string; // "crypto", "stock_br", "fii_br"
  created_at: string;
}

interface PriceData {
  price: number;
  last_updated: string;
}

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  prices: {[symbol: string]: PriceData};
  onRemoveItem: (id: string) => Promise<boolean>;
  loading: boolean;
}

// Estilos (copiados do page.tsx)
const pStyle: React.CSSProperties = { margin: '8px 0 0', color: '#9db0d0', fontSize: 13, lineHeight: 1.5 };
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

export function WatchlistTable({ watchlist, prices, onRemoveItem, loading }: WatchlistTableProps) {
  if (loading) {
    return <p style={pStyle}>Carregando watchlist...</p>;
  }

  if (watchlist.length === 0) {
    return <p style={pStyle}>Nenhum ativo na watchlist. Adicione alguns!</p>;
  }

  return (
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
                  onClick={() => onRemoveItem(item.id)}
                  style={removeButtonStyle}
                  disabled={loading} // Desabilita enquanto carrega
                >
                  Remover
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

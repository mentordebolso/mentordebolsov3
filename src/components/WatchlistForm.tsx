import React, { useState, FormEvent } from 'react';

interface WatchlistFormProps {
  onAddItem: (symbol: string, kind: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

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

const pStyle: React.CSSProperties = { margin: '8px 0 0', color: '#9db0d0', fontSize: 13, lineHeight: 1.5 };


export function WatchlistForm({ onAddItem, error, loading }: WatchlistFormProps) {
  const [newSymbol, setNewSymbol] = useState('');
  const [newKind, setNewKind] = useState('stock_br');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onAddItem(newSymbol, newKind);
    if (success) {
      setNewSymbol('');
      // setNewKind('stock_br'); // Manter o tipo ou limpar, dependendo da UX
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Símbolo (Ex: BTC, VALE3)"
        value={newSymbol}
        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
        style={inputStyle}
        required
        disabled={loading} // Desabilita enquanto carrega
      />
      <select
        value={newKind}
        onChange={(e) => setNewKind(e.target.value)}
        style={selectStyle}
        required
        disabled={loading} // Desabilita enquanto carrega
      >
        <option value="stock_br">Ação BR</option>
        <option value="fii_br">FII BR</option>
        <option value="crypto">Cripto</option>
      </select>
      <button type="submit" style={addButtonStyle} disabled={loading}>
        {loading ? 'Adicionando...' : 'Adicionar'}
      </button>
      {error && <p style={{ ...pStyle, color: '#ff6b6b', width: '100%' }}>Erro: {error}</p>}
    </form>
  );
}

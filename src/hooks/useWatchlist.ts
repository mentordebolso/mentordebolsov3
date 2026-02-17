// mentordebolsov3/src/hooks/useWatchlist.ts
import { useEffect, useState } from 'react';

// Interfaces (copiadas do page.tsx)
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

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [prices, setPrices] = useState<{[symbol: string]: PriceData}>({});
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar a watchlist e os preços
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
          console.error('Erro da CoinMarketCap API:', errorData);
          throw new Error(errorData.error || `Erro ao buscar preços na CoinMarketCap (${pricesResponse.status})`);
        }
        const pricesData: {[symbol: string]: PriceData} = await pricesResponse.json();
        setPrices(pricesData);
      } else {
        setPrices({});
      }

    } catch (err: any) {
      console.error("Erro em fetchWatchlistAndPrices:", err);
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
      fetchWatchlistAndPrices(); // Atualiza a cada 1 minuto
    }, 60000); // 1 minuto

    return () => clearInterval(intervalId); // Limpa o intervalo na desmontagem
  }, []);

  // Handler para adicionar um novo item
  const handleAddItem = async (symbol: string, kind: string) => {
    setError(null);
    if (!symbol || !kind) {
      setError('Símbolo e Tipo são obrigatórios.');
      return false; // Indica falha
    }

    try {
      const response = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, kind }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      await fetchWatchlistAndPrices(); // Recarrega a lista para mostrar o novo item
      return true; // Indica sucesso
    } catch (err: any) {
      console.error("Erro em handleAddItem:", err);
      setError(err.message);
      return false; // Indica falha
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

      await fetchWatchlistAndPrices(); // Recarrega a lista
      return true; // Indica sucesso
    } catch (err: any) {
      console.error("Erro em handleRemoveItem:", err);
      setError(err.message);
      return false; // Indica falha
    }
  };

  return {
    watchlist,
    prices,
    loadingWatchlist,
    loadingPrices,
    error,
    handleAddItem,
    handleRemoveItem,
  };
}

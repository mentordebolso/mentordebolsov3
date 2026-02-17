import { NextRequest, NextResponse } from 'next/server';

interface PriceRequestItem {
  symbol: string;
  kind: string; // "crypto", "stock_br", "fii_br"
}

interface CoinMarketCapQuote {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      last_updated: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json(); // Espera uma lista de { symbol, kind }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Nenhum item fornecido para buscar preços.' }, { status: 400 });
    }

    const cryptoSymbols = items
      .filter((item: PriceRequestItem) => item.kind === 'crypto')
      .map((item: PriceRequestItem) => item.symbol)
      .join(',');

    const prices: { [symbol: string]: { price: number; last_updated: string } } = {};

    if (cryptoSymbols) {
      const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

      if (!COINMARKETCAP_API_KEY) {
        throw new Error('COINMARKETCAP_API_KEY não configurada nas variáveis de ambiente.');
      }

      // Consulta a API do CoinMarketCap
      const cmcResponse = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptoSymbols}`, {
        headers: {
          'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        },
      });

      if (!cmcResponse.ok) {
        const errorData = await cmcResponse.json();
        console.error('Erro da CoinMarketCap API:', errorData);
        throw new Error(errorData.status?.error_message || `Erro ao buscar preços na CoinMarketCap (${cmcResponse.status})`);
      }

      const cmcData = await cmcResponse.json();
      
      // Processa a resposta da CoinMarketCap
      for (const symbol of Object.keys(cmcData.data)) {
        const quote: CoinMarketCapQuote = cmcData.data[symbol];
        if (quote?.quote?.USD?.price) {
          prices[symbol] = {
            price: quote.quote.USD.price,
            last_updated: quote.quote.USD.last_updated,
          };
        }
      }
    }

    // Por enquanto, ações e FIIs serão mockados ou deixados em branco.
    // Flávio, quando você tiver a estratégia para ações/FIIs, integraremos aqui!
    items.forEach((item: PriceRequestItem) => {
      if (!prices[item.symbol]) {
        // Mock ou valor vazio para não criptos por enquanto
        prices[item.symbol] = { price: 0, last_updated: new Date().toISOString() }; 
      }
    });

    return NextResponse.json(prices);
  } catch (err: any) {
    console.error('Erro inesperado na API de preços:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

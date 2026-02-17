import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { symbol, kind } = await req.json();

    if (!symbol || !kind) {
      return NextResponse.json({ error: 'Símbolo e tipo são obrigatórios.' }, { status: 400 });
    }

    // Por enquanto, user_id fixo para testes.
    const userId = '29f36a04-137e-4e34-ae40-874398cfb905';

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_id: userId, symbol, kind })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar à watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 }); // Retorna o item adicionado com status 201 Created
  } catch (err: any) {
    console.error('Erro inesperado na API de adicionar watchlist:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

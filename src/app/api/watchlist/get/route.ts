import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const userId = '29f36a04-137e-4e34-ae40-874398cfb905'; // ID do usuário para testes

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao buscar watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Erro inesperado na API de watchlist:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

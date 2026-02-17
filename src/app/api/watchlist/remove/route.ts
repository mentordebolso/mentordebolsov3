import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json(); // Esperamos o ID do item a ser removido

    if (!id) {
      return NextResponse.json({ error: 'ID do item é obrigatório.' }, { status: 400 });
    }

    // Por enquanto, user_id fixo para testes.
    const userId = '29f36a04-137e-4e34-ae40-874398cfb905';

    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id) // Filtra pelo ID do item
      .eq('user_id', userId); // Garante que só o user_id correto pode remover

    if (error) {
      console.error('Erro ao remover da watchlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Item removido com sucesso.' }, { status: 200 });
  } catch (err: any) {
    console.error('Erro inesperado na API de remover watchlist:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

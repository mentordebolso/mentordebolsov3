import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Por enquanto, user_id fixo para testes.
    const userId = '29f36a04-137e-4e34-ae40-874398cfb905'; // Seu user_id
    const updates = await req.json(); // Os campos a serem atualizados

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo fornecido para atualização.' }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: updatedSettings, error } = await supabase
      .from('advanced_user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar configurações avançadas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedSettings);
  } catch (err: any) {
    console.error('Erro inesperado na API de atualizar configurações avançadas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Por enquanto, user_id fixo para testes.
    const userId = '29f36a04-137e-4e34-ae40-874398cfb905'; // Seu user_id

    const supabase = supabaseAdmin();

    // Tenta buscar as configurações existentes
    let { data: settings, error } = await supabase
      .from('advanced_user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') { // Nenhum registro encontrado
      console.log('Nenhuma configuração avançada encontrada para o usuário, criando padrão...');
      const { data: newSettings, error: insertError } = await supabase
        .from('advanced_user_settings')
        .insert({
          user_id: userId,
          polling_interval_ms: 60000, // Default 1 minuto
          crypto_api_source: 'coinmarketcap',
          crypto_api_enabled: true,
          stock_fii_api_source: null,
          stock_fii_api_enabled: false,
          ai_model: null, // Default null
          ai_tone: null, // Default null
          daily_action: null, // Default null
          anti_impulse_checklist: [] // Default array vazio
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar configurações avançadas padrão:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      settings = newSettings; // Usa as configurações recém-criadas
    } else if (error) {
      console.error('Erro ao buscar configurações avançadas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (err: any) {
    console.error('Erro inesperado na API de obter configurações avançadas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

type AlertKind = 'morning' | 'afternoon' | 'night' | 'manual';

export function buildMentorMessage(alert: AlertKind) {
  // MVP: mensagens simples, sem “sinal mágico”.
  // Depois a gente pluga dados reais e métricas.
  const base = {
    morning: {
      title: 'Mentor de Bolso — Manhã',
      message:
        [
          'Hoje a missão é simples: consistência > emoção.',
          '',
          '✅ Regra do dia: sem alavancagem, sem altcoin pequena.',
          '📌 Aporte semanal: R$100 (sugestão: 70% BTC / 30% ETH).',
          '',
          'Se você quiser, responda: /ok (se fez) ou /nao (se não fez).'
        ].join('\n')
    },
    afternoon: {
      title: 'Mentor de Bolso — Tarde',
      message:
        [
          'Check de risco:',
          '• Mercado pode estar volátil — não inventa moda.',
          '• Se bater ansiedade: a ação correta é NÃO fazer nada.',
          '',
          'Dica: foco em BTC/ETH e em aprender o básico de ações/FIIs.'
        ].join('\n')
    },
    night: {
      title: 'Mentor de Bolso — Noite',
      message:
        [
          'Fechamento do dia:',
          '1) Você seguiu as regras? (sem impulso)',
          '2) Fez o aporte planejado?',
          '3) Alguma dúvida pra eu te explicar amanhã?',
          '',
          'Comando: /status (ver resumo)'
        ].join('\n')
    },
    manual: {
      title: 'Mentor de Bolso',
      message: 'Manda /plano ou /status.'
    }
  } as const;

  return base[alert];
}

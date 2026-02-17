'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useAdvancedSettings } from '@/hooks/useAdvancedSettings';

// Estilos básicos (repetidos para não depender do page.tsx, ou podem ser centralizados depois)
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 14,
  padding: 14,
  marginBottom: 14, // Adicionado para espaçamento
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e8f0ff',
  fontSize: 13,
  flexGrow: 1,
  width: '100%', // Para inputs ficarem em largura total dentro de um flex-column
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e8f0ff',
  fontSize: 13,
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  color: '#9db0d0',
  fontSize: 13,
  marginBottom: 4,
  display: 'block',
};

const checkboxContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
};

const checkboxStyle: React.CSSProperties = {
  // Estilos básicos para checkbox
  width: 16,
  height: 16,
};

const buttonStyle: React.CSSProperties = {
  background: '#76c9f0', // Cor para o botão de salvar
  color: '#0b1220',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 'bold',
  marginTop: 14,
};

const errorStyle: React.CSSProperties = {
  color: '#ff6b6b',
  marginTop: 10,
  fontSize: 13,
};

const successStyle: React.CSSProperties = {
  color: '#32d583',
  marginTop: 10,
  fontSize: 13,
};


export default function SettingsPage() {
  const { settings, loading, error, saveSettings } = useAdvancedSettings();
  const [formState, setFormState] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormState(settings); // Inicializa o formState com as configurações carregadas
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFormState(prev => {
      if (!prev) return null;

      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }
      
      // Converte para número se for o caso do polling_interval_ms
      if (name === 'polling_interval_ms') {
        return { ...prev, [name]: Number(value) };
      }
      
      // Para o checklist, precisamos lidar com o JSONB array
      if (name === 'anti_impulse_checklist_input') {
        // Isso é um tratamento temporário para um input de texto simples
        // Em um app real, teríamos um componente para gerenciar o array de itens
        return { ...prev, anti_impulse_checklist: value.split(',').map(s => s.trim()) };
      }

      return { ...prev, [name]: value };
    });
    setSaveSuccess(false); // Remove mensagem de sucesso ao editar
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    // Remove campos que não devem ser atualizados diretamente
    const updatesToSend: Partial<typeof formState> = { ...formState };
    delete updatesToSend.id;
    delete updatesToSend.user_id;
    delete updatesToSend.created_at;
    delete updatesToSend.updated_at;

    const success = await saveSettings(updatesToSend);
    if (success) {
      setSaveSuccess(true);
      // O hook já atualiza o estado `settings` com os dados mais recentes do DB
    }
  };

  if (loading) {
    return (
      <main style={{ color: '#e8f0ff', padding: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Configurações do Mentor de Bolso</h1>
        <p style={{ ...errorStyle, color: '#9db0d0' }}>Carregando configurações...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ color: '#e8f0ff', padding: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Configurações do Mentor de Bolso</h1>
        <p style={errorStyle}>Erro ao carregar configurações: {error}</p>
      </main>
    );
  }

  if (!formState) {
    return (
      <main style={{ color: '#e8f0ff', padding: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Configurações do Mentor de Bolso</h1>
        <p style={errorStyle}>Não foi possível carregar as configurações.</p>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      color: '#e8f0ff',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
      background:
        'radial-gradient(900px 500px at 20% 0%, rgba(76,201,240,.18), transparent 50%),' +
        'radial-gradient(900px 500px at 80% 0%, rgba(50,213,131,.14), transparent 50%),' +
        '#0b1220',
      padding: 18,
    }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 22, marginBottom: 14 }}>Configurações do Mentor de Bolso</h1>
        <p style={{ color: '#9db0d0', fontSize: 14, marginBottom: 20 }}>
          Aqui você controla o cérebro e os olhos do seu Mentor.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Seção de Atualização de Preços */}
          <section style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 18, marginBottom: 10, color: '#e8f0ff' }}>Atualização de Preços</h2>
            
            <label style={labelStyle} htmlFor="polling_interval_ms">Intervalo de Atualização (ms):</label>
            <input
              type="number"
              id="polling_interval_ms"
              name="polling_interval_ms"
              value={formState.polling_interval_ms}
              onChange={handleChange}
              style={inputStyle}
              min="10000" // Mínimo de 10 segundos
              required
            />
            <small style={{ color: '#9db0d0', fontSize: 11, display: 'block', marginBottom: 10 }}>
              (1 minuto = 60000ms. Mínimo recomendado para economizar API: 30000ms)
            </small>

            <label style={labelStyle} htmlFor="crypto_api_source">Fonte API Criptomoedas:</label>
            <select
              id="crypto_api_source"
              name="crypto_api_source"
              value={formState.crypto_api_source}
              onChange={handleChange}
              style={selectStyle}
              required
            >
              <option value="coinmarketcap">CoinMarketCap (Gratuita)</option>
              {/* Adicionar outras opções se investigar mais APIs */}
            </select>
            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                id="crypto_api_enabled"
                name="crypto_api_enabled"
                checked={formState.crypto_api_enabled}
                onChange={handleChange}
                style={checkboxStyle}
              />
              <label style={labelStyle} htmlFor="crypto_api_enabled">Ativar API de Criptomoedas</label>
            </div>

            {/* Ações/FIIs - Por enquanto, placeholder */}
            <label style={labelStyle} htmlFor="stock_fii_api_source">Fonte API Ações/FIIs (BR):</label>
            <select
              id="stock_fii_api_source"
              name="stock_fii_api_source"
              value={formState.stock_fii_api_source || ''}
              onChange={handleChange}
              style={selectStyle}
            >
              <option value="">Ainda não configurado</option>
              {/* Opções como StatusInvest (Web Scraping) ou HUB3 (se viável) */}
            </select>
            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                id="stock_fii_api_enabled"
                name="stock_fii_api_enabled"
                checked={formState.stock_fii_api_enabled}
                onChange={handleChange}
                style={checkboxStyle}
              />
              <label style={labelStyle} htmlFor="stock_fii_api_enabled">Ativar API de Ações/FIIs</label>
            </div>
          </section>

          {/* Seção de Configurações da IA */}
          <section style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 18, marginBottom: 10, color: '#e8f0ff' }}>Inteligência Artificial do Mentor</h2>
            <label style={labelStyle} htmlFor="ai_model">Modelo de IA:</label>
            <select
              id="ai_model"
              name="ai_model"
              value={formState.ai_model || ''}
              onChange={handleChange}
              style={selectStyle}
            >
              <option value="">Padrão do Sistema</option>
              <option value="openai/gpt-4.1">ChatGPT 4.1</option>
              <option value="openai/gpt-5">ChatGPT 5</option>
              <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
              {/* Adicionar outros modelos conforme disponibilidade e integrações */}
            </select>

            <label style={labelStyle} htmlFor="ai_tone">Tom e Comportamento da IA:</label>
            <textarea
              id="ai_tone"
              name="ai_tone"
              value={formState.ai_tone || ''}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: 80 }}
              placeholder="Ex: 'Objetivo, prático e zoeiro na medida certa.'"
            />
          </section>

          {/* Seção de Ação Diária e Checklist */}
          <section style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 18, marginBottom: 10, color: '#e8f0ff' }}>Orientação Diária</h2>
            <label style={labelStyle} htmlFor="daily_action">Ação de Hoje:</label>
            <textarea
              id="daily_action"
              name="daily_action"
              value={formState.daily_action || ''}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: 60 }}
              placeholder="Ex: 'Manter consistência. Se for dia de aporte, comprar aos poucos (spot) e registrar no diário.'"
            />

            <label style={labelStyle} htmlFor="anti_impulse_checklist_input">Checklist Anti-Impulso (itens separados por vírgula):</label>
            <textarea
              id="anti_impulse_checklist_input"
              name="anti_impulse_checklist_input"
              value={formState.anti_impulse_checklist.join(', ')} // Converte o array para string para o textarea
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: 80 }}
              placeholder="Ex: 'Estou com FOMO?, Estou tentando recuperar prejuízo rápido?, Se eu errar, minha perda máxima está controlada?'"
            />
          </section>

          {saveSuccess && <p style={successStyle}>Configurações salvas com sucesso!</p>}
          {error && <p style={errorStyle}>Erro ao salvar configurações: {error}</p>}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </main>
  );
}

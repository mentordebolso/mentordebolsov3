// mentordebolsov3/src/hooks/useAdvancedSettings.ts
import { useEffect, useState } from 'react';

// Interface para as configurações avançadas (baseada na tabela advanced_user_settings)
interface AdvancedUserSettings {
  id: string;
  user_id: string;
  polling_interval_ms: number;
  crypto_api_source: string;
  crypto_api_enabled: boolean;
  stock_fii_api_source: string | null;
  stock_fii_api_enabled: boolean;
  ai_model: string | null;
  ai_tone: string | null;
  daily_action: string | null;
  anti_impulse_checklist: string[]; // JSONB array no Supabase
  created_at: string;
  updated_at: string;
}

export function useAdvancedSettings() {
  const [settings, setSettings] = useState<AdvancedUserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar as configurações
  async function fetchSettings() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user-settings/get-advanced');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ao buscar configurações.`);
      }
      const data: AdvancedUserSettings = await response.json();
      setSettings(data);
    } catch (err: any) {
      console.error("Erro em fetchSettings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Função para salvar (atualizar) as configurações
  async function saveSettings(updates: Partial<AdvancedUserSettings>) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user-settings/update-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status} ao salvar configurações.`);
      }

      const updatedData: AdvancedUserSettings = await response.json();
      setSettings(updatedData); // Atualiza o estado com as novas configurações
      return true; // Indica sucesso
    } catch (err: any) {
      console.error("Erro em saveSettings:", err);
      setError(err.message);
      return false; // Indica falha
    } finally {
      setLoading(false);
    }
  }

  // Carrega as configurações na montagem do componente
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
    fetchSettings, // Para recarregar se necessário
  };
}

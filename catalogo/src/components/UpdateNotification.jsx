import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import styles from './UpdateNotification.module.css';

// Versão injetada em tempo de build pelo Vite
const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

export default function UpdateNotification() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkVersion = useCallback(async () => {
    // Não checa em ambiente de desenvolvimento local
    if (import.meta.env.DEV || CURRENT_VERSION === 'dev') return;

    try {
      const response = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data && data.version && data.version !== CURRENT_VERSION) {
        setHasUpdate(true);
      }
    } catch {
      // Falha silenciosa em caso de perda temporária de conexão
    }
  }, []);

  useEffect(() => {
    // Primeira checagem após 5 segundos da página aberta
    const initialTimer = setTimeout(checkVersion, 5000);

    // Checagem periódica a cada 60 segundos
    const interval = setInterval(checkVersion, 60000);

    // Checagem quando o usuário volta para a aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkVersion);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkVersion);
    };
  }, [checkVersion]);

  const handleUpdate = () => {
    setIsUpdating(true);
    // Pequeno delay para feedback visual antes do reload
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!hasUpdate || dismissed) {
    return null;
  }

  return (
    <aside className={styles.updateBanner} aria-label="Notificação de nova versão">
      <div className={styles.iconWrapper}>
        <Sparkles size={18} />
        <span className={styles.pulseDot} />
      </div>

      <div className={styles.content}>
        <div className={styles.title}>
          <span>Nova versão pronta</span>
          <span className={styles.badge}>Novo</span>
        </div>
        <p className={styles.description}>
          O catálogo foi atualizado com melhorias.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.updateButton}
          onClick={handleUpdate}
          disabled={isUpdating}
          title="Recarregar catálogo com a nova versão"
        >
          <RefreshCw size={14} className={isUpdating ? 'spin' : ''} />
          {isUpdating ? 'Atualizando...' : 'Atualizar'}
        </button>

        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          title="Fechar aviso temporariamente"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}

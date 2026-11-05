import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AdminLogin({
  usuario,
  setUsuario,
  senha,
  setSenha,
  manterConectado,
  setManterConectado,
  erroLogin,
  onSubmit,
  onVoltarCatalogo,
  styles
}) {
  return (
    <div className={styles.adminWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <img src="/logo.svg" alt="WD Blocos" className={styles.loginLogo} />
          <h2 className={styles.loginTitle}>Painel Administrativo</h2>
          <p className={styles.loginSubtitle}>Gestão de Produtos & Catálogo WD Blocos</p>

          {erroLogin && <div className={styles.loginError}>{erroLogin}</div>}

          <form onSubmit={onSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Usuário</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Senha</label>
              <input 
                type="password" 
                className={styles.formInput} 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="manterConectado"
                checked={manterConectado}
                onChange={(e) => setManterConectado(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="manterConectado" style={{ cursor: 'pointer', fontSize: '0.9rem', margin: 0, userSelect: 'none' }}>
                Manter-me conectado
              </label>
            </div>

            <button type="submit" className={styles.btnLogin}>
              Entrar no Painel
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <button 
              type="button" 
              className={styles.btnReturnCatalog} 
              onClick={onVoltarCatalogo}
            >
              <ArrowLeft size={16} /> Voltar ao Catálogo Público
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


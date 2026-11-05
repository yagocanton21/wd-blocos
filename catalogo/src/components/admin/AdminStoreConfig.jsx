import React from 'react';

export default function AdminStoreConfig({
  configLoja,
  setConfigLoja,
  onSubmit,
  salvandoConfig,
  styles
}) {
  return (
    <div className={styles.tableCard} style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#1E293B' }}>Configurações Gerais da Loja</h3>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>WhatsApp para Vendas (Somente números)</label>
          <input 
            type="text" 
            className={styles.formInput} 
            value={configLoja.telefone_whatsapp}
            onChange={e => setConfigLoja({ ...configLoja, telefone_whatsapp: e.target.value.replace(/\D/g, '') })}
            placeholder="Ex: 5511999999999"
            required
          />
          <small style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>Inclua o 55 (Brasil) e o DDD. Ex: 5511999999999</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Telefone para Exibição (Como aparece pro cliente)</label>
          <input 
            type="text" 
            className={styles.formInput} 
            value={configLoja.telefone_exibicao}
            onChange={e => setConfigLoja({ ...configLoja, telefone_exibicao: e.target.value })}
            placeholder="Ex: (11) 99999-9999"
            required
          />
        </div>

        <button 
          type="submit" 
          className={styles.btnSave} 
          style={{ width: '100%', marginTop: '12px' }}
          disabled={salvandoConfig}
        >
          {salvandoConfig ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}


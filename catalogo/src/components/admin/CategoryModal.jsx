import React from 'react';
import { X } from 'lucide-react';

export default function CategoryModal({
  aberto,
  onClose,
  categoriaEditando,
  formCategoria,
  setFormCategoria,
  onSubmit,
  salvando,
  styles
}) {
  if (!aberto) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.formModal} style={{ maxWidth: '500px' }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {categoriaEditando ? `Editar Categoria: ${categoriaEditando.label}` : 'Nova Categoria'}
          </h3>
          <button 
            type="button" 
            className={styles.modalCloseBtn}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Nome da Categoria *</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formCategoria.label}
                  placeholder="Ex: Blocos Estruturais"
                  onChange={(e) => setFormCategoria({ ...formCategoria, label: e.target.value })}
                  required 
                />
              </div>
            </div>
          </div>

          <div className={styles.modalFooter} style={{ marginTop: '20px' }}>
            <button 
              type="button" 
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.btnSave}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


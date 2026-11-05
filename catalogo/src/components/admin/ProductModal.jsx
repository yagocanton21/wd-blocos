import React from 'react';
import { X, Upload, Link as LinkIcon, Trash2, AlertCircle, Check } from 'lucide-react';

export default function ProductModal({
  aberto,
  onClose,
  produtoEditando,
  formDados,
  setFormDados,
  categorias,
  modoFoto,
  setModoFoto,
  fazendoUpload,
  erroCarregarUrl,
  setErroCarregarUrl,
  handleFileChange,
  onSubmit,
  salvando,
  styles
}) {
  if (!aberto) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.formModal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {produtoEditando ? `Editar Produto: ${produtoEditando.codigo || produtoEditando.nome}` : 'Cadastrar Novo Produto'}
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
              {/* Nome do Produto */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Nome do Material / Produto *</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={formDados.nome}
                  placeholder="Ex: Bloco de Concreto Estrutural 14x19x39 cm"
                  onChange={(e) => setFormDados({ ...formDados, nome: e.target.value })}
                  required 
                />
              </div>

              {/* Categoria */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Categoria *</label>
                <select 
                  className={styles.formSelect}
                  value={formDados.categoria}
                  onChange={(e) => {
                    const cat = categorias.find(c => c.id === e.target.value);
                    setFormDados({ 
                      ...formDados, 
                      categoria: e.target.value,
                      categoriaLabel: cat ? cat.label : 'Material'
                    });
                  }}
                >
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Quantidade Mínima */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Qtd. Mínima para Cotação</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={formDados.qtdMinima || 10}
                  min={1}
                  onChange={(e) => setFormDados({ ...formDados, qtdMinima: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </div>

              {/* Foto Real do Produto (Arquivo Local ou URL da Internet) */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap', gap: '8px' }}>
                  <label className={styles.formLabel}>Foto do Produto (Opcional)</label>
                  <div className={styles.photoModeToggle}>
                    <button
                      type="button"
                      className={`${styles.photoTabBtn} ${modoFoto === 'upload' ? styles.photoTabBtnActive : ''}`}
                      onClick={() => setModoFoto('upload')}
                    >
                      <Upload size={13} /> Enviar Arquivo
                    </button>
                    <button
                      type="button"
                      className={`${styles.photoTabBtn} ${modoFoto === 'url' ? styles.photoTabBtnActive : ''}`}
                      onClick={() => setModoFoto('url')}
                    >
                      <LinkIcon size={13} /> Link da Internet (URL)
                    </button>
                  </div>
                </div>

                {modoFoto === 'upload' ? (
                  <div className={styles.uploadBox}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={fazendoUpload}
                      className={styles.fileInput}
                    />
                    <span className={styles.photoHelpText}>
                      Selecione um arquivo de foto do seu computador ou celular (Máx 5MB).
                    </span>
                    {fazendoUpload && <span className={styles.uploadingBadge}>Enviando imagem para o servidor...</span>}
                  </div>
                ) : (
                  <div className={styles.urlBox}>
                    <input 
                      type="url"
                      className={styles.formInput}
                      placeholder="Ex: https://imagens.com/bloco-concreto.jpg"
                      value={formDados.imagemUrl && (formDados.imagemUrl.startsWith('http://') || formDados.imagemUrl.startsWith('https://')) ? formDados.imagemUrl : ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setFormDados(prev => ({ ...prev, imagemUrl: val || null }));
                        setErroCarregarUrl(false);
                      }}
                    />
                    <span className={styles.photoHelpText}>
                      Cole o link direto da imagem que você pegou na internet.
                    </span>
                  </div>
                )}

                {/* Pré-visualização da Foto */}
                {formDados.imagemUrl && (
                  <div className={styles.photoPreviewCard}>
                    <div className={styles.previewImageContainer}>
                      <img 
                        src={formDados.imagemUrl} 
                        alt="Pré-visualização do produto" 
                        onLoad={() => setErroCarregarUrl(false)}
                        onError={() => setErroCarregarUrl(true)}
                      />
                    </div>
                    <div className={styles.previewDetails}>
                      <div className={styles.previewStatus}>
                        {erroCarregarUrl ? (
                          <span className={styles.previewError}>
                            <AlertCircle size={14} /> Não foi possível carregar a imagem deste link
                          </span>
                        ) : (
                          <span className={styles.previewSuccess}>
                            <Check size={14} /> Imagem pronta
                          </span>
                        )}
                        <span className={styles.previewSourceBadge}>
                          {formDados.imagemUrl.startsWith('http') ? 'Link da Internet' : 'Arquivo Local'}
                        </span>
                      </div>
                      <span className={styles.previewUrlText} title={formDados.imagemUrl}>
                        {formDados.imagemUrl}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className={styles.previewRemoveBtn}
                      onClick={() => {
                        setFormDados(prev => ({ ...prev, imagemUrl: null }));
                        setErroCarregarUrl(false);
                      }}
                      title="Remover foto do produto"
                    >
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
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
              {salvando ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


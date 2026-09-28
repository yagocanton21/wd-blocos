import React, { useState } from 'react';
import { X, CheckCircle2, Plus, Minus, Check, Shield } from 'lucide-react';
import ProductVisual from './ProductVisual';
import styles from './ProductModal.module.css';

export default function ProductModal({ produto, onClose, onAdicionarCotacao }) {
  if (!produto) return null;

  const [quantidade, setQuantidade] = useState(produto.qtdMinima || 10);
  const [adicionado, setAdicionado] = useState(false);

  const incremento = produto.incremento || 10;
  const qtdMinima = produto.qtdMinima || 10;

  const handleAdicionar = () => {
    onAdicionarCotacao(produto, quantidade);
    setAdicionado(true);
    setTimeout(() => {
      setAdicionado(false);
    }, 1500);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Botão de Fechar */}
        <button className={styles.modalCloseBtn} onClick={onClose} title="Fechar (ESC)">
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.modalCategory}>{produto.categoriaLabel}</div>
          <h2 className={styles.modalTitle}>{produto.nome}</h2>
          <div className={styles.modalMetaBar}>
            <span>Código Técnico: <strong>{produto.codigo}</strong></span>
            <span className={styles.modalNorma}><Shield size={14} /> {produto.norma}</span>
          </div>
        </div>

        <div className={styles.modalContentGrid}>
          {/* Coluna Visual e Ficha Rápida */}
          <div>
            <div className={styles.modalVisualBox}>
              <ProductVisual 
                tipo={produto.tipoIcone} 
                dimensao={produto.dimensoes} 
                nome={produto.nome}
              />
            </div>

            <div className={styles.modalHighlights}>
              <div className={styles.modalHighlightBox}>
                <span className={styles.boxTitle}>Resistência</span>
                <span className={`${styles.boxVal} ${styles.highlight}`}>{produto.resistencia}</span>
              </div>
              <div className={styles.modalHighlightBox}>
                <span className={styles.boxTitle}>Paletização</span>
                <span className={styles.boxVal}>{produto.paletizacao}</span>
              </div>
              <div className={styles.modalHighlightBox}>
                <span className={styles.boxTitle}>Peso Unitário</span>
                <span className={styles.boxVal}>{produto.peso}</span>
              </div>
            </div>
          </div>

          {/* Coluna Descritiva e Especificações */}
          <div className={styles.modalInfoCol}>
            <div className={styles.modalSection}>
              <h4>Descrição Técnica</h4>
              <p className={styles.modalText}>{produto.descricaoLonga}</p>
            </div>

            <div className={styles.modalSection}>
              <h4>Aplicações Recomendadas</h4>
              <ul className={styles.modalAppList}>
                {produto.aplicacoes.map((app, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className={styles.appIcon} />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabela de Dados Construtivos */}
            <div className={styles.modalSection}>
              <h4>Parâmetros da Peça</h4>
              <table className={styles.techTable}>
                <tbody>
                  <tr>
                    <th>Dimensões Nominais:</th>
                    <td>{produto.dimensoes}</td>
                  </tr>
                  <tr>
                    <th>Consumo Médio:</th>
                    <td>{produto.rendimento}</td>
                  </tr>

                    <th>Norma Regulamentadora:</th>
                    <td>{produto.norma}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Seletor e Ação de Cotação dentro do Modal */}
            <div className={styles.modalActionBar}>
              <div className={styles.modalQtyGroup}>
                <span className={styles.qtyLabel}>Quantidade ({produto.unidade}):</span>
                <div className={styles.modalStepper}>
                  <button 
                    type="button" 
                    className={styles.stepperBtn} 
                    onClick={() => setQuantidade(prev => Math.max(qtdMinima, prev - incremento))}
                  >
                    <Minus size={14} />
                  </button>
                  <input 
                    type="number" 
                    className={styles.stepperInput} 
                    value={quantidade}
                    min={qtdMinima}
                    step={incremento}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuantidade(isNaN(val) || val < qtdMinima ? qtdMinima : val);
                    }}
                    onBlur={() => setQuantidade(prev => Math.max(qtdMinima, prev))}
                  />
                  <button 
                    type="button" 
                    className={styles.stepperBtn} 
                    onClick={() => setQuantidade(prev => prev + incremento)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button 
                type="button"
                className={`${styles.btnModalAdd} ${adicionado ? styles.added : ''}`}
                onClick={handleAdicionar}
              >
                {adicionado ? (
                  <>
                    <Check size={18} />
                    <span>Adicionado à Lista!</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Incluir na Lista de Cotação</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

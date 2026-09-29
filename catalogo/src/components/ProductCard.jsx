import React, { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import ProductVisual from './ProductVisual';
import styles from './ProductCard.module.css';

export default function ProductCard({ 
  produto, 
  onAdicionarCotacao, 
  quantidadeNoCarrinho 
}) {
  const [quantidade, setQuantidade] = useState(produto.qtdMinima || 1);
  const [adicionadoAnim, setAdicionadoAnim] = useState(false);

  const incremento = 1;
  const qtdMinima = produto.qtdMinima || 1;

  const handleDiminuir = (e) => {
    e.stopPropagation();
    setQuantidade(prev => Math.max(qtdMinima, prev - incremento));
  };

  const handleAumentar = (e) => {
    e.stopPropagation();
    setQuantidade(prev => prev + incremento);
  };

  const handleAdicionar = (e) => {
    e.stopPropagation();
    onAdicionarCotacao(produto, quantidade);
    setAdicionadoAnim(true);
    setTimeout(() => {
      setAdicionadoAnim(false);
    }, 1200);
  };

  const formatarUnidade = (qtd, un) => {
    if (un === 'saco') return qtd > 1 ? 'sacos' : 'saco';
    if (un === 'un') return qtd > 1 ? 'unidades' : 'unidade';
    if (un === 'painel') return qtd > 1 ? 'painéis' : 'painel';
    if (un === 'bisnaga') return qtd > 1 ? 'bisnagas' : 'bisnaga';
    return un || 'unidades';
  };

  const specText = [
    `Mín: ${produto.qtdMinima || 1} ${formatarUnidade(produto.qtdMinima || 1, produto.unidade)}`
  ].filter(Boolean).join(' • ');

  return (
    <div className={styles.productCard}>
      {/* Visual: Foto real OU SVG ilustrativo */}
      <div className={styles.visualContainer}>
        {produto.imagemUrl ? (
          <div className={styles.photoWrapper}>
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className={styles.productPhoto}
              loading="lazy"
              onError={(e) => {
                // Fallback: esconde a foto e mostra o SVG
                e.currentTarget.parentElement.style.display = 'none';
                e.currentTarget.parentElement.nextSibling.style.display = 'flex';
              }}
            />
          </div>
        ) : null}
        <div className={styles.svgFallback} style={produto.imagemUrl ? { display: 'none' } : {}}>
          <ProductVisual 
            tipo={produto.tipoIcone} 
            dimensao="" 
            nome={produto.nome}
          />
        </div>

      </div>

      {/* Identificação Direta do Material */}
      <div className={styles.cardBody}>
        <div className={styles.specSummary}>{specText}</div>
        <h3 className={styles.productTitle}>{produto.nome}</h3>
      </div>

      {/* Ação Única de Cotação */}
      <div className={styles.cardFooter}>
        <div className={styles.actionsRow} onClick={(e) => e.stopPropagation()}>
          {/* Seletor de Quantidade Rápido */}
          <div className={styles.stepper}>
            <button 
              type="button" 
              className={styles.stepperBtn} 
              onClick={handleDiminuir}
              title={`Diminuir ${incremento} ${formatarUnidade(incremento, produto.unidade)}`}
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
                const raw = e.target.value;
                if (raw === '') {
                  setQuantidade('');
                  return;
                }
                const val = parseInt(raw, 10);
                if (!isNaN(val)) setQuantidade(val);
              }}
              onBlur={() => {
                setQuantidade(prev => {
                  const val = parseInt(prev, 10);
                  if (isNaN(val) || val < qtdMinima) return qtdMinima;
                  return val;
                });
              }}
            />
            <button 
              type="button" 
              className={styles.stepperBtn} 
              onClick={handleAumentar}
              title={`Aumentar ${incremento} ${formatarUnidade(incremento, produto.unidade)}`}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Botão de Adicionar à Cotação */}
          <button 
            type="button"
            className={`${styles.btnAdd} ${adicionadoAnim ? styles.added : ''}`}
            onClick={handleAdicionar}
          >
            {adicionadoAnim ? (
              <>
                <Check size={16} />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{quantidadeNoCarrinho > 0 ? `+ Mais (${quantidadeNoCarrinho})` : 'Adicionar'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

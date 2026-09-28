import React, { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import ProductVisual from './ProductVisual';
import styles from './ProductCard.module.css';

export default function ProductCard({ 
  produto, 
  onAdicionarCotacao, 
  quantidadeNoCarrinho 
}) {
  const [quantidade, setQuantidade] = useState(produto.qtdMinima || 10);
  const [adicionadoAnim, setAdicionadoAnim] = useState(false);

  const incremento = produto.incremento || 10;
  const qtdMinima = produto.qtdMinima || 10;

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

  // Linha de especificações essenciais resumida
  const specText = [
    produto.dimensoes,
    produto.resistencia && produto.resistencia !== 'Livre de impurezas' ? produto.resistencia : null
  ].filter(Boolean).join(' • ');

  return (
    <div className={styles.productCard}>
      {/* Visual: Foto real OU SVG ilustrativo */}
      <div className={styles.visualContainer}>
        {produto.foto ? (
          <div className={styles.photoWrapper}>
            <img
              src={produto.foto}
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
        <div className={styles.svgFallback} style={produto.foto ? { display: 'none' } : {}}>
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
              title={`Diminuir ${incremento} ${produto.unidade}`}
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
              onClick={handleAumentar}
              title={`Aumentar ${incremento} ${produto.unidade}`}
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

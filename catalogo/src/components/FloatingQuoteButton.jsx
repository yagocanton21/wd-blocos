import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import styles from './FloatingQuoteButton.module.css';

export default function FloatingQuoteButton({ totalItens, totalVolumes, onClick }) {
  if (totalItens === 0) return null;

  return (
    <div className={styles.floatingQuoteContainer}>
      <button 
        type="button" 
        className={styles.floatingQuoteBtn}
        onClick={onClick}
        title="Abrir Lista de Cotação"
      >
        <div className={styles.floatingBtnLeft}>
          <div className={styles.floatingIconBubble}>
            <ShoppingCart size={20} />
            <span className={styles.floatingBadge}>{totalItens}</span>
          </div>
          <div className={styles.floatingText}>
            <span className={styles.floatingMainTitle}>
              {totalItens} {totalItens === 1 ? 'material selecionado' : 'materiais selecionados'}
            </span>
            <span className={styles.floatingSubTitle}>
              {totalVolumes.toLocaleString('pt-BR')} peças / volumes totais
            </span>
          </div>
        </div>

        <div className={styles.floatingBtnRight}>
          <span>Ver Lista & Cotar</span>
          <ArrowRight size={18} />
        </div>
      </button>
    </div>
  );
}

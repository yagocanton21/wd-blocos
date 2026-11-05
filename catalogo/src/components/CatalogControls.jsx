import React from 'react';
import { SlidersHorizontal, Layers } from 'lucide-react';
import styles from '../App.module.css';

export default function CatalogControls({
  categoriaAtiva,
  setCategoriaAtiva,
  categorias,
  contagemPorCategoria,
  ordenacao,
  setOrdenacao,
  onResetPagina
}) {
  return (
    <div className={styles.controlsGroup}>
      {/* Filtro de Categoria em Dropdown */}
      <div className={styles.controlSelectWrapper}>
        <Layers size={16} className={styles.controlIcon} />
        <label htmlFor="categorySelect">Categoria:</label>
        <select 
          id="categorySelect" 
          className={styles.controlSelect}
          value={categoriaAtiva}
          onChange={(e) => {
            setCategoriaAtiva(e.target.value);
            if (onResetPagina) onResetPagina();
          }}
        >
          <option value="todos">Todas as Categorias</option>
          {categorias.map((cat) => {
            const count = contagemPorCategoria[cat.id] || 0;
            return (
              <option key={cat.id} value={cat.id}>
                {cat.label} {count > 0 ? `(${count})` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* Ordenação */}
      <div className={styles.controlSelectWrapper}>
        <SlidersHorizontal size={16} className={styles.controlIcon} />
        <label htmlFor="sortSelect">Ordenar:</label>
        <select 
          id="sortSelect" 
          className={styles.controlSelect}
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value)}
        >
          <option value="destaque">Mais Cotados / Destaques</option>
          <option value="nome-asc">Nome do Produto (A - Z)</option>
          <option value="nome-desc">Nome do Produto (Z - A)</option>
        </select>
      </div>
    </div>
  );
}


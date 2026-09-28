import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

export default function Pagination({ 
  paginaAtual, 
  totalPaginas, 
  totalItens, 
  itensPorPagina, 
  setItensPorPagina,
  onMudarPagina 
}) {
  if (totalPaginas <= 1 && totalItens <= itensPorPagina) return null;

  const inicio = Math.min((paginaAtual - 1) * itensPorPagina + 1, totalItens);
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  // Calcula quais números de página exibir com reticências
  const gerarPaginasVisiveis = () => {
    const paginas = [];
    const delta = 1; // páginas adjacentes à atual

    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 ||
        i === totalPaginas ||
        (i >= paginaAtual - delta && i <= paginaAtual + delta)
      ) {
        paginas.push(i);
      } else if (paginas[paginas.length - 1] !== '...') {
        paginas.push('...');
      }
    }
    return paginas;
  };

  return (
    <nav className={styles.paginationWrapper} aria-label="Navegação do catálogo">
      {/* Informações de Contagem */}
      <div className={styles.paginationInfo}>
        Mostrando <strong>{inicio}</strong> a <strong>{fim}</strong> de <strong>{totalItens}</strong> materiais
      </div>

      {/* Controles de Navegação */}
      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onMudarPagina(1)}
          disabled={paginaAtual === 1}
          title="Primeira página"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {gerarPaginasVisiveis().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>
                …
              </span>
            );
          }

          const isAtiva = p === paginaAtual;
          return (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${isAtiva ? styles.active : ''}`}
              onClick={() => onMudarPagina(p)}
              aria-current={isAtiva ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          title="Próxima página"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onMudarPagina(totalPaginas)}
          disabled={paginaAtual === totalPaginas}
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      {/* Seletor de Quantidade por Página */}
      <div className={styles.itemsPerPageSelect}>
        <label htmlFor="itensPorPagina">Itens por página:</label>
        <select
          id="itensPorPagina"
          className={styles.selectInput}
          value={itensPorPagina}
          onChange={(e) => {
            setItensPorPagina(Number(e.target.value));
            onMudarPagina(1);
          }}
        >
          <option value={8}>8 por página</option>
          <option value={12}>12 por página</option>
          <option value={24}>24 por página</option>
          <option value={48}>48 por página</option>
        </select>
      </div>
    </nav>
  );
}

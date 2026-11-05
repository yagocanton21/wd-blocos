import React from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoriesTable({
  categorias,
  categoriasExibidas,
  handleNovaCategoria,
  handleEditarCategoria,
  handleExcluirCategoria,
  isProcessando,
  paginaCategorias,
  setPaginaCategorias,
  totalPaginasCategorias,
  indiceInicioCategorias,
  itensPorPaginaTabela,
  styles
}) {
  return (
    <>
      <div className={styles.tableControlsBar}>
        <div className={styles.tableFilters}>
          <h3 style={{ margin: 0, color: '#1E293B' }}>Categorias do Catálogo</h3>
        </div>
        <button 
          type="button" 
          className={styles.btnNewProduct}
          onClick={handleNovaCategoria}
        >
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th className={styles.colCodigo} style={{ width: '30%' }}>ID (Slug)</th>
                <th className={styles.colMaterial}>Nome da Categoria</th>
                <th className={styles.colAcoes}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : (
                categoriasExibidas.map((cat) => (
                  <tr key={cat.id}>
                    <td><span className={styles.codeBadge}>{cat.id}</span></td>
                    <td><span className={styles.productNameText}>{cat.label}</span></td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button 
                          type="button" 
                          className={styles.btnAction}
                          disabled={isProcessando(`cat-${cat.id}`)}
                          onClick={() => handleEditarCategoria(cat)}
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                        <button 
                          type="button" 
                          className={`${styles.btnAction} ${styles.delete}`}
                          disabled={isProcessando(`cat-${cat.id}`)}
                          onClick={() => handleExcluirCategoria(cat.id, cat.label)}
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação de Categorias */}
        {categorias.length > 0 && (
          <div className={styles.tablePagination}>
            <div className={styles.paginationText}>
              Mostrando <strong>{indiceInicioCategorias + 1}</strong> a <strong>{Math.min(indiceInicioCategorias + itensPorPaginaTabela, categorias.length)}</strong> de <strong>{categorias.length}</strong> categorias
            </div>

            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPaginaCategorias((p) => Math.max(1, p - 1))}
                disabled={paginaCategorias === 1}
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPaginasCategorias }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`${styles.pageBtn} ${paginaCategorias === num ? styles.active : ''}`}
                  onClick={() => setPaginaCategorias(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPaginaCategorias((p) => Math.min(totalPaginasCategorias, p + 1))}
                disabled={paginaCategorias === totalPaginasCategorias}
                title="Próxima Página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


import React from 'react';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsTable({
  produtos,
  produtosExibidos,
  categorias,
  termoBusca,
  setTermoBusca,
  categoriaFiltro,
  setCategoriaFiltro,
  handleNovoProduto,
  handleEditar,
  handleExcluir,
  handleToggleAtivo,
  isProcessando,
  paginaTabela,
  setPaginaTabela,
  itensPorPaginaTabela,
  setItensPorPaginaTabela,
  totalPaginas,
  indiceInicio,
  styles
}) {
  return (
    <>
      {/* Barra de Filtros e Novo Produto */}
      <div className={styles.tableControlsBar}>
        <div className={styles.tableFilters}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text"
              className={styles.searchInput}
              placeholder="Pesquisar por código, nome ou medida..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>

          <select 
            className={styles.categorySelect}
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="todos">Todas as Categorias</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <button 
          type="button" 
          className={styles.btnNewProduct}
          onClick={handleNovoProduto}
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Tabela de Produtos */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th className={styles.colCodigo}>Código</th>
                <th className={styles.colMaterial}>Material & Dimensões</th>
                <th className={styles.colCategoria}>Categoria</th>
                <th className={styles.colStatus}>Status (Visibilidade)</th>
                <th className={styles.colAcoes}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosExibidos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                produtosExibidos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.codeBadge}>{p.codigo}</span>
                    </td>
                    <td>
                      <div className={styles.productNameCell}>
                        <span className={styles.productNameText}>{p.nome}</span>
                        <span className={styles.productDimText}>{p.dimensoes}</span>
                      </div>
                    </td>
                    <td>{p.categoriaLabel}</td>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: isProcessando(p.id) ? 'not-allowed' : 'pointer', gap: '8px', opacity: isProcessando(p.id) ? 0.5 : 1 }}>
                        <input 
                          type="checkbox" 
                          checked={p.ativo}
                          disabled={isProcessando(p.id)}
                          onChange={() => handleToggleAtivo(p.id, !p.ativo)}
                          style={{ cursor: isProcessando(p.id) ? 'not-allowed' : 'pointer', width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: p.ativo ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>
                          {p.ativo ? 'ATIVO' : 'OCULTO'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button 
                          type="button" 
                          className={styles.btnAction}
                          disabled={isProcessando(p.id)}
                          onClick={() => handleEditar(p)}
                          title="Editar informações do produto"
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                        <button 
                          type="button" 
                          className={`${styles.btnAction} ${styles.delete}`}
                          disabled={isProcessando(p.id)}
                          onClick={() => handleExcluir(p.id, p.nome)}
                          title="Excluir do banco"
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

        {/* Paginação */}
        {produtos.length > 0 && (
          <div className={styles.tablePagination}>
            <div className={styles.paginationText}>
              Mostrando <strong>{indiceInicio + 1}</strong> a <strong>{Math.min(indiceInicio + itensPorPaginaTabela, produtos.length)}</strong> de <strong>{produtos.length}</strong> produtos
            </div>

            <div className={styles.paginationControls}>
              <label htmlFor="itensPorPaginaAdmin" style={{ color: '#94A3B8', fontSize: '0.8rem', marginRight: '4px' }}>
                Exibir:
              </label>
              <select
                id="itensPorPaginaAdmin"
                className={styles.pageSizeSelect}
                value={itensPorPaginaTabela}
                onChange={(e) => {
                  setItensPorPaginaTabela(Number(e.target.value));
                  setPaginaTabela(1);
                }}
              >
                <option value={5}>5 por pág.</option>
                <option value={8}>8 por pág.</option>
                <option value={15}>15 por pág.</option>
                <option value={30}>30 por pág.</option>
              </select>

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPaginaTabela((p) => Math.max(1, p - 1))}
                disabled={paginaTabela === 1}
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`${styles.pageBtn} ${paginaTabela === num ? styles.active : ''}`}
                  onClick={() => setPaginaTabela(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPaginaTabela((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaTabela === totalPaginas}
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


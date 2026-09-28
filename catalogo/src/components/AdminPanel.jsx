import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ArrowLeft, 
  LogOut, 
  Layers, 
  X, 
  Save, 
  Check, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Settings,
  Tag
} from 'lucide-react';
import { 
  getProdutos, 
  getStats, 
  criarProduto, 
  atualizarProduto, 
  alternarProntaEntrega, 
  alternarAtivo,
  excluirProduto, 
  loginAdmin,
  getCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
  uploadImage,
  getConfig,
  updateConfig
} from '../services/api';
import styles from './AdminPanel.module.css';

const PRODUTO_VAZIO = {
  codigo: '',
  nome: '',
  categoria: 'blocos-estruturais',
  categoriaLabel: 'Blocos Estruturais',
  destaque: false,
  dimensoes: '',
  resistencia: '',
  peso: '',
  rendimento: '',
  paletizacao: '',
  norma: 'ABNT NBR 6136',
  unidade: 'un',
  qtdMinima: 10,
  incremento: 10,
  prontaEntrega: true,
  ativo: true,
  descricaoCurta: '',
  descricaoLonga: '',
  aplicacoes: ['Alvenaria estrutural', 'Obras residenciais e comerciais'],
  tipoIcone: 'bloco-padrao'
};

export default function AdminPanel({ onVoltarCatalogo }) {
  const [autenticado, setAutenticado] = useState(() => {
    return Boolean(localStorage.getItem('wd_admin_token'));
  });

  // Credenciais de Login
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  // Dados do Dashboard
  const [abaAtiva, setAbaAtiva] = useState('produtos'); // 'produtos' ou 'categorias'
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stats, setStats] = useState({ totalProdutos: 0, prontaEntrega: 0, sobEncomenda: 0 });
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // Paginação da Tabela Admin
  const [paginaTabela, setPaginaTabela] = useState(1);
  const [paginaCategorias, setPaginaCategorias] = useState(1);
  const [itensPorPaginaTabela, setItensPorPaginaTabela] = useState(8);

  // Estado do Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formDados, setFormDados] = useState(PRODUTO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);

  // Configurações da Loja
  const [configLoja, setConfigLoja] = useState({ telefone_whatsapp: '', telefone_exibicao: '' });
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Carrega dados do PostgreSQL
  const carregarDados = async () => {
    try {
      const lista = await getProdutos({ busca: termoBusca, categoria: categoriaFiltro, admin: true });
      setProdutos(lista);
      
      const listaCat = await getCategorias();
      setCategorias(listaCat);

      const metricas = await getStats();
      setStats(metricas);

      const config = await getConfig();
      setConfigLoja(config);
    } catch (e) {
      console.error('Erro ao carregar dados do admin:', e);
    }
  };

  useEffect(() => {
    if (autenticado) {
      carregarDados();
    }
  }, [autenticado, termoBusca, categoriaFiltro]);

  // Reseta para a primeira página ao filtrar ou buscar
  useEffect(() => {
    setPaginaTabela(1);
  }, [termoBusca, categoriaFiltro]);

  // Cálculos de paginação da tabela
  const totalPaginas = Math.max(1, Math.ceil(produtos.length / itensPorPaginaTabela));
  const indiceInicio = (paginaTabela - 1) * itensPorPaginaTabela;
  const produtosExibidos = produtos.slice(indiceInicio, indiceInicio + itensPorPaginaTabela);

  // Cálculos de paginação de categorias
  const totalPaginasCategorias = Math.max(1, Math.ceil(categorias.length / itensPorPaginaTabela));
  const indiceInicioCategorias = (paginaCategorias - 1) * itensPorPaginaTabela;
  const categoriasExibidas = categorias.slice(indiceInicioCategorias, indiceInicioCategorias + itensPorPaginaTabela);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErroLogin('');
    try {
      const res = await loginAdmin(usuario, senha);
      if (res.success) {
        localStorage.setItem('wd_admin_token', res.token);
        setAutenticado(true);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg === 'Failed to fetch' || msg.includes('fetch') || msg.includes('network') || msg.includes('NetworkError')) {
        setErroLogin('Servidor indisponível no momento. Verifique a conexão ou tente novamente em instantes.');
      } else if (msg.includes('401') || msg.toLowerCase().includes('senha') || msg.toLowerCase().includes('inválid')) {
        setErroLogin('Usuário ou senha incorretos. Verifique os dados e tente novamente.');
      } else {
        setErroLogin(msg || 'Não foi possível realizar o login. Tente novamente.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wd_admin_token');
    setAutenticado(false);
  };

  // Abrir Modal para Criar
  const handleNovoProduto = () => {
    setProdutoEditando(null);
    setFormDados(PRODUTO_VAZIO);
    setFazendoUpload(false);
    setModalAberto(true);
  };

  // Abrir Modal para Editar
  const handleEditar = (p) => {
    setProdutoEditando(p);
    setFormDados({
      ...p,
      aplicacoes: Array.isArray(p.aplicacoes) ? p.aplicacoes : []
    });
    setFazendoUpload(false);
    setModalAberto(true);
  };

  // Fazer Upload de Imagem
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validação básica do tamanho e tipo
    if (!file.type.startsWith('image/')) {
      alert('Selecione apenas arquivos de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. O limite é de 5MB para não sobrecarregar o servidor.');
      return;
    }

    setFazendoUpload(true);
    try {
      const res = await uploadImage(file);
      // Se houver uma URL na resposta (res.url), salvamos no form
      if (res.url) {
        setFormDados(prev => ({ ...prev, imagemUrl: res.url }));
      }
    } catch (err) {
      alert('Falha ao fazer o upload da imagem.');
    } finally {
      setFazendoUpload(false);
    }
  };

  // Alternar Disponibilidade (1 clique)
  const handleToggleDisponibilidade = async (id) => {
    try {
      await alternarProntaEntrega(id);
      await carregarDados();
    } catch (err) {
      alert('Erro ao alternar status do produto no banco.');
    }
  };

  const handleToggleAtivo = async (id) => {
    try {
      await alternarAtivo(id);
      await carregarDados();
    } catch (err) {
      alert('Erro ao alternar status do produto no banco.');
    }
  };

  // Excluir Produto
  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Deseja realmente remover o produto "${nome}" do banco de dados?`)) {
      try {
        await excluirProduto(id);
        await carregarDados();
      } catch (err) {
        alert('Erro ao excluir produto.');
      }
    }
  };

  // Salvar Produto (Insert ou Update)
  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (produtoEditando) {
        await atualizarProduto(produtoEditando.id, formDados);
      } else {
        await criarProduto(formDados);
      }
      setModalAberto(false);
      await carregarDados();
    } catch (err) {
      alert('Erro ao salvar produto no banco de dados.');
    } finally {
      setSalvando(false);
    }
  };

  // Estado do Modal de Categoria
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ id: '', label: '' });

  const handleNovaCategoria = () => {
    setCategoriaEditando(null);
    setFormCategoria({ id: '', label: '' });
    setModalCategoriaAberto(true);
  };

  const handleEditarCategoria = (cat) => {
    setCategoriaEditando(cat);
    setFormCategoria({ ...cat });
    setModalCategoriaAberto(true);
  };

  const handleExcluirCategoria = async (id, label) => {
    if (window.confirm(`Atenção: Deseja realmente excluir a categoria "${label}"? Certifique-se de que nenhum produto a esteja usando.`)) {
      try {
        await excluirCategoria(id);
        await carregarDados();
      } catch (err) {
        alert('Erro ao excluir categoria.');
      }
    }
  };

  const handleSalvarCategoria = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (categoriaEditando) {
        await atualizarCategoria(categoriaEditando.id, formCategoria);
      } else {
        // Gera um slug simples se não tiver id, ou usa o digitado
        const catData = {
          ...formCategoria,
          id: formCategoria.id || formCategoria.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        };
        await criarCategoria(catData);
      }
      setModalCategoriaAberto(false);
      await carregarDados();
    } catch (err) {
      alert('Erro ao salvar categoria no banco de dados.');
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarConfig = async (e) => {
    e.preventDefault();
    setSalvandoConfig(true);
    try {
      const novaConfig = await updateConfig(configLoja);
      setConfigLoja(novaConfig);
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setSalvandoConfig(false);
    }
  };

  // SE NÃO AUTENTICADO: Tela de Login
  if (!autenticado) {
    return (
      <div className={styles.adminWrapper}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <img src="/logo.svg" alt="WD Blocos" className={styles.loginLogo} />
            <h2 className={styles.loginTitle}>Painel Administrativo</h2>
            <p className={styles.loginSubtitle}>Gestão de Produtos & Catálogo WD Blocos</p>

            {erroLogin && <div className={styles.loginError}>{erroLogin}</div>}

            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Usuário</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Senha</label>
                <input 
                  type="password" 
                  className={styles.formInput} 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className={styles.btnLogin}>
                Entrar no Painel
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className={styles.btnReturnCatalog} 
                onClick={onVoltarCatalogo}
              >
                <ArrowLeft size={16} /> Voltar ao Catálogo Público
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SE AUTENTICADO: Dashboard Completo
  return (
    <div className={styles.adminWrapper}>
      {/* Top Header */}
      <header className={styles.adminHeader}>
        <div className={`container ${styles.adminHeaderContent}`}>
          <div className={styles.adminBrand}>
            <img src="/logo.svg" alt="WD Blocos" className={styles.adminLogo} />
            <div>
              <span className={styles.adminBrandTitle}>WD Blocos — Painel de Controle</span>
            </div>
          </div>

          <div className={styles.adminHeaderActions}>
            <button 
              type="button" 
              className={styles.btnReturnCatalog}
              onClick={onVoltarCatalogo}
            >
              <ArrowLeft size={16} /> Ver Catálogo Público
            </button>
            <button 
              type="button" 
              className={styles.btnLogout}
              onClick={handleLogout}
              title="Sair do painel"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Cards de Métricas / KPIs */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.blue}`}>
              <Package size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{stats.totalProdutos}</div>
              <div className={styles.statLabel}>Total de Produtos</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.orange}`}>
              <Layers size={24} />
            </div>
            <div>
              <div className={styles.statValue}>{categorias.length}</div>
              <div className={styles.statLabel}>Linhas / Categorias</div>
            </div>
          </div>
        </section>

        {/* Abas */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={abaAtiva === 'produtos' ? styles.btnSave : styles.btnCancel}
            onClick={() => setAbaAtiva('produtos')}
          >
            Gerenciar Produtos
          </button>
          <button 
            type="button" 
            className={abaAtiva === 'categorias' ? styles.btnSave : styles.btnCancel}
            onClick={() => setAbaAtiva('categorias')}
          >
            Gerenciar Categorias
          </button>
          <button 
            type="button" 
            className={abaAtiva === 'config' ? styles.btnSave : styles.btnCancel}
            onClick={() => setAbaAtiva('config')}
          >
            Configurações da Loja
          </button>
        </div>

        {abaAtiva === 'produtos' && (
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
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={p.ativo}
                            onChange={() => handleToggleAtivo(p.id)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
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
                            onClick={() => handleEditar(p)}
                            title="Editar informações do produto"
                          >
                            <Edit3 size={14} /> Editar
                          </button>
                          <button 
                            type="button" 
                            className={`${styles.btnAction} ${styles.delete}`}
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
        )}

        {abaAtiva === 'categorias' && (
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
                                onClick={() => handleEditarCategoria(cat)}
                              >
                                <Edit3 size={14} /> Editar
                              </button>
                              <button 
                                type="button" 
                                className={`${styles.btnAction} ${styles.delete}`}
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
            </div>
          </>
        )}

        {abaAtiva === 'config' && (
          <div className={styles.tableCard} style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#1E293B' }}>Configurações Gerais da Loja</h3>
            <form onSubmit={handleSalvarConfig}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>WhatsApp para Vendas (Somente números)</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={configLoja.telefone_whatsapp}
                  onChange={e => setConfigLoja({...configLoja, telefone_whatsapp: e.target.value.replace(/\D/g, '')})}
                  placeholder="Ex: 5511999999999"
                  required
                />
                <small style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>Inclua o 55 (Brasil) e o DDD. Ex: 5511999999999</small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Telefone para Exibição (Como aparece pro cliente)</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={configLoja.telefone_exibicao}
                  onChange={e => setConfigLoja({...configLoja, telefone_exibicao: e.target.value})}
                  placeholder="Ex: (11) 99999-9999"
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.btnSave} 
                style={{ width: '100%', marginTop: '12px' }}
                disabled={salvandoConfig}
              >
                {salvandoConfig ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Modal de Cadastro / Edição */}
      {modalAberto && (
        <div className={styles.modalBackdrop}>
          <div className={styles.formModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {produtoEditando ? `Editar Produto: ${produtoEditando.codigo || produtoEditando.nome}` : 'Cadastrar Novo Produto'}
              </h3>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => setModalAberto(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className={styles.modalForm}>
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

                {/* Foto Real do Produto */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Foto Real do Produto (Máx 5MB)</label>
                  
                  {formDados.imagemUrl ? (
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={formDados.imagemUrl.startsWith('http') ? formDados.imagemUrl : formDados.imagemUrl} 
                        alt="Preview" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button 
                        type="button" 
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setFormDados(prev => ({ ...prev, imagemUrl: null }))}
                      >
                        Remover Foto
                      </button>
                    </div>
                  ) : null}

                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={fazendoUpload}
                    style={{ fontSize: '0.85rem', padding: '6px' }}
                  />
                  {fazendoUpload && <span style={{ fontSize: '0.8rem', color: '#F97316', marginLeft: '8px' }}>Enviando...</span>}
                </div>

                {/* Quantidade Mínima */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Qtd. Mínima para Cotação</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={formDados.qtdMinima || 10}
                    min={1}
                    onChange={(e) => setFormDados({ ...formDados, qtdMinima: parseInt(e.target.value) || 1 })}
                  />
                </div>


              </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnCancel}
                  onClick={() => setModalAberto(false)}
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
      )}

      {/* Modal de Categoria */}
      {modalCategoriaAberto && (
        <div className={styles.modalBackdrop}>
          <div className={styles.formModal} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {categoriaEditando ? `Editar Categoria: ${categoriaEditando.label}` : 'Nova Categoria'}
              </h3>
              <button 
                type="button" 
                className={styles.modalCloseBtn}
                onClick={() => setModalCategoriaAberto(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarCategoria} className={styles.modalForm}>
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
                  onClick={() => setModalCategoriaAberto(false)}
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
      )}
    </div>
  );
}

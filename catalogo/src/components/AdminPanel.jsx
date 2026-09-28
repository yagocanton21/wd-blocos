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
  ChevronRight 
} from 'lucide-react';
import { 
  getProdutos, 
  getStats, 
  criarProduto, 
  atualizarProduto, 
  alternarProntaEntrega, 
  excluirProduto, 
  loginAdmin 
} from '../services/api';
import { CATEGORIAS } from '../data/produtos';
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
  const [produtos, setProdutos] = useState([]);
  const [stats, setStats] = useState({ totalProdutos: 0, prontaEntrega: 0, sobEncomenda: 0 });
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // Paginação da Tabela Admin
  const [paginaTabela, setPaginaTabela] = useState(1);
  const [itensPorPaginaTabela, setItensPorPaginaTabela] = useState(8);

  // Estado do Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formDados, setFormDados] = useState(PRODUTO_VAZIO);
  const [salvando, setSalvando] = useState(false);

  // Carrega produtos do PostgreSQL
  const carregarDados = async () => {
    try {
      const lista = await getProdutos({ busca: termoBusca, categoria: categoriaFiltro });
      setProdutos(lista);
      const metricas = await getStats();
      setStats(metricas);
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
    setModalAberto(true);
  };

  // Abrir Modal para Editar
  const handleEditar = (p) => {
    setProdutoEditando(p);
    setFormDados({
      ...p,
      aplicacoes: Array.isArray(p.aplicacoes) ? p.aplicacoes : []
    });
    setModalAberto(true);
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
              <div className={styles.statValue}>{CATEGORIAS.length - 1}</div>
              <div className={styles.statLabel}>Linhas / Categorias</div>
            </div>
          </div>
        </section>

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
              {CATEGORIAS.map(c => (
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
                  <th className={styles.colResistencia}>Resistência</th>
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
                        <strong style={{ color: 'var(--primary)' }}>{p.resistencia || '—'}</strong>
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

                {/* Código */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Código Técnico</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={formDados.codigo}
                    placeholder="Ex: BE-1439-4.5"
                    onChange={(e) => setFormDados({ ...formDados, codigo: e.target.value })}
                  />
                </div>

                {/* Categoria */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Categoria *</label>
                  <select 
                    className={styles.formSelect}
                    value={formDados.categoria}
                    onChange={(e) => {
                      const cat = CATEGORIAS.find(c => c.id === e.target.value);
                      setFormDados({ 
                        ...formDados, 
                        categoria: e.target.value,
                        categoriaLabel: cat ? cat.label : 'Material'
                      });
                    }}
                  >
                    {CATEGORIAS.filter(c => c.id !== 'todos').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Dimensões */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Dimensões (Medida)</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={formDados.dimensoes}
                    placeholder="Ex: 14 x 19 x 39 cm"
                    onChange={(e) => setFormDados({ ...formDados, dimensoes: e.target.value })}
                  />
                </div>

                {/* Resistência */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Resistência Mecânica (MPa)</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={formDados.resistencia}
                    placeholder="Ex: 4.5 MPa ou 35 MPa"
                    onChange={(e) => setFormDados({ ...formDados, resistencia: e.target.value })}
                  />
                </div>

                {/* Tipo de Visual */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ilustração do Produto</label>
                  <select 
                    className={styles.formSelect}
                    value={formDados.tipoIcone}
                    onChange={(e) => setFormDados({ ...formDados, tipoIcone: e.target.value })}
                  >
                    <option value="bloco-padrao">Bloco Estrutural Padrão (2 furos)</option>
                    <option value="bloco-largo">Bloco 19cm Largo</option>
                    <option value="meio-bloco">Meio Bloco</option>
                    <option value="bloco-fino">Bloco de Vedação Fino (9cm)</option>
                    <option value="canaleta-u">Canaleta U</option>
                    <option value="canaleta-j">Canaleta J</option>
                    <option value="paver-ret">Piso Paver Retangular</option>
                    <option value="paver-sex">Piso Paver Sextavado</option>
                    <option value="saco">Saco de Cimento</option>
                    <option value="agregado">Agregado (Areia / Brita)</option>
                    <option value="bisnaga">Argamassa Polimérica</option>
                    <option value="tela-aco">Tela Soldada de Aço</option>
                  </select>
                </div>

                {/* Unidade */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Unidade de Medida</label>
                  <select 
                    className={styles.formSelect}
                    value={formDados.unidade}
                    onChange={(e) => setFormDados({ ...formDados, unidade: e.target.value })}
                  >
                    <option value="un">un (Unidade / Peça)</option>
                    <option value="m²">m² (Metro quadrado)</option>
                    <option value="saco">saco (Saco 50kg)</option>
                    <option value="m³">m³ (Metro cúbico)</option>
                    <option value="painel">painel (Painel/Fardo)</option>
                    <option value="bisnaga">bisnaga (Bisnaga)</option>
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
                    onChange={(e) => setFormDados({ ...formDados, qtdMinima: parseInt(e.target.value) || 1 })}
                  />
                </div>

                {/* Passo / Incremento */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Passo / Incremento (+/-)</label>
                  <input 
                    type="number" 
                    className={styles.formInput} 
                    value={formDados.incremento || 10}
                    min={1}
                    onChange={(e) => setFormDados({ ...formDados, incremento: parseInt(e.target.value) || 1 })}
                  />
                </div>

                {/* Checkbox Destaque */}
                <div className={styles.formGridFull}>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '6px' }}>
                    <label className={styles.formCheckboxGroup}>
                      <input 
                        type="checkbox" 
                        checked={formDados.destaque}
                        onChange={(e) => setFormDados({ ...formDados, destaque: e.target.checked })}
                      />
                      <span>Item em Destaque no Catálogo</span>
                    </label>
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
    </div>
  );
}

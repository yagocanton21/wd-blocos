import { useState, useEffect } from 'react';
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
  updateConfig,
  getConfig,
  logoutAdmin,
  checkAuth
} from '../services/api';

export const PRODUTO_VAZIO = {
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

export function useAdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  // Credenciais de Login
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [manterConectado, setManterConectado] = useState(false);

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
  const [modoFoto, setModoFoto] = useState('upload'); // 'upload' ou 'url'
  const [erroCarregarUrl, setErroCarregarUrl] = useState(false);

  // Configurações da Loja
  const [configLoja, setConfigLoja] = useState({ telefone_whatsapp: '', telefone_exibicao: '' });
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [processandoIds, setProcessandoIds] = useState(new Set());

  // Estado do Modal de Categoria
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ id: '', label: '' });

  const isProcessando = (id) => processandoIds.has(id);
  const setItemProcessando = (id, status) => {
    setProcessandoIds(prev => {
      const next = new Set(prev);
      if (status) next.add(id);
      else next.delete(id);
      return next;
    });
  };

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
    const initAuth = async () => {
      try {
        await checkAuth();
        setAutenticado(true);
        carregarDados();
      } catch (err) {
        setAutenticado(false);
      } finally {
        setVerificandoAuth(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (autenticado) {
      carregarDados();
    }
  }, [termoBusca, categoriaFiltro]);

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
      const res = await loginAdmin(usuario, senha, manterConectado);
      if (res.success) {
        setAutenticado(true);
        carregarDados();
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

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (e) {}
    setAutenticado(false);
  };

  // Abrir Modal para Criar
  const handleNovoProduto = () => {
    setProdutoEditando(null);
    setFormDados(PRODUTO_VAZIO);
    setFazendoUpload(false);
    setModoFoto('upload');
    setErroCarregarUrl(false);
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
    setModoFoto(p.imagemUrl && (p.imagemUrl.startsWith('http://') || p.imagemUrl.startsWith('https://')) ? 'url' : 'upload');
    setErroCarregarUrl(false);
    setModalAberto(true);
  };

  // Fazer Upload de Imagem
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    if (isProcessando(id)) return;
    setItemProcessando(id, true);
    try {
      await alternarProntaEntrega(id);
      await carregarDados();
    } catch (err) {
      alert('Erro ao alternar status do produto no banco.');
    } finally {
      setItemProcessando(id, false);
    }
  };

  const handleToggleAtivo = async (id, novoValor) => {
    if (isProcessando(id)) return;
    setItemProcessando(id, true);
    try {
      await alternarAtivo(id, novoValor);
      await carregarDados();
    } catch (err) {
      alert('Erro ao alternar status do produto no banco.');
    } finally {
      setItemProcessando(id, false);
    }
  };

  // Excluir Produto
  const handleExcluir = async (id, nome) => {
    if (isProcessando(id)) return;
    if (window.confirm(`Deseja realmente remover o produto "${nome}" do banco de dados?`)) {
      setItemProcessando(id, true);
      try {
        await excluirProduto(id);
        await carregarDados();
      } catch (err) {
        alert('Erro ao excluir produto.');
      } finally {
        setItemProcessando(id, false);
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
    if (isProcessando(`cat-${id}`)) return;
    if (window.confirm(`Atenção: Deseja realmente excluir a categoria "${label}"?`)) {
      setItemProcessando(`cat-${id}`, true);
      try {
        await excluirCategoria(id);
        await carregarDados();
      } catch (err) {
        alert(err.message || 'Erro ao excluir categoria.');
      } finally {
        setItemProcessando(`cat-${id}`, false);
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

  return {
    autenticado,
    verificandoAuth,
    usuario,
    setUsuario,
    senha,
    setSenha,
    erroLogin,
    manterConectado,
    setManterConectado,
    abaAtiva,
    setAbaAtiva,
    produtos,
    categorias,
    stats,
    termoBusca,
    setTermoBusca,
    categoriaFiltro,
    setCategoriaFiltro,
    paginaTabela,
    setPaginaTabela,
    paginaCategorias,
    setPaginaCategorias,
    itensPorPaginaTabela,
    setItensPorPaginaTabela,
    modalAberto,
    setModalAberto,
    produtoEditando,
    formDados,
    setFormDados,
    salvando,
    fazendoUpload,
    modoFoto,
    setModoFoto,
    erroCarregarUrl,
    setErroCarregarUrl,
    configLoja,
    setConfigLoja,
    salvandoConfig,
    modalCategoriaAberto,
    setModalCategoriaAberto,
    categoriaEditando,
    formCategoria,
    setFormCategoria,
    isProcessando,
    produtosExibidos,
    categoriasExibidas,
    totalPaginas,
    totalPaginasCategorias,
    indiceInicio,
    indiceInicioCategorias,
    handleLogin,
    handleLogout,
    handleNovoProduto,
    handleEditar,
    handleFileChange,
    handleToggleDisponibilidade,
    handleToggleAtivo,
    handleExcluir,
    handleSalvarProduto,
    handleNovaCategoria,
    handleEditarCategoria,
    handleExcluirCategoria,
    handleSalvarCategoria,
    handleSalvarConfig
  };
}


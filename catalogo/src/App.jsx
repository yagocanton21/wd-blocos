import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import QuoteDrawer from './components/QuoteDrawer';
import Pagination from './components/Pagination';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { getProdutos, getCategorias, getConfig } from './services/api';

import { SlidersHorizontal, PackageOpen, Layers } from 'lucide-react';
import styles from './App.module.css';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');
  const [ordenacao, setOrdenacao] = useState('destaque');

  // Modo Administrador
  const [modoAdmin, setModoAdmin] = useState(() => {
    return window.location.search.includes('admin') || window.location.hash.includes('admin');
  });

  // Sincroniza o modo admin com o botão "Voltar" do navegador
  useEffect(() => {
    const handlePopState = () => {
      setModoAdmin(window.location.search.includes('admin') || window.location.hash.includes('admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Estados de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(12);

  const catalogoRef = useRef(null);

  // Estado do Carrinho / Lista de Cotação
  const [itensCotacao, setItensCotacao] = useState(() => {
    try {
      const salvo = localStorage.getItem('wd_cotacao_itens');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const [drawerAberto, setDrawerAberto] = useState(false);
  const [toast, setToast] = useState({ visivel: false, mensagem: '' });
  const [configLoja, setConfigLoja] = useState({ telefone_whatsapp: '5511942440440', telefone_exibicao: '(11) 94244-0440' });
  
  const mostrarToast = (mensagem) => {
    setToast({ visivel: true, mensagem });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visivel: false }));
    }, 3000);
  };

  // Carrega produtos e categorias do PostgreSQL
  const carregarDados = async () => {
    setCarregando(true);
    try {
      const cfg = await getConfig();
      setConfigLoja(cfg);
      
      const listaProdutos = await getProdutos({
        categoria: categoriaAtiva,
        busca: termoBuscaDebounced,
        ordenacao
      });
      setProdutos(listaProdutos);
      
      const listaCategorias = await getCategorias();
      setCategorias(listaCategorias);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  // Debounce: aguarda 350ms sem digitar antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      setTermoBuscaDebounced(termoBusca.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [termoBusca]);

  useEffect(() => {
    if (!modoAdmin) {
      carregarDados();
    }
  }, [categoriaAtiva, termoBuscaDebounced, ordenacao, modoAdmin]);

  // Persiste a lista de cotação no navegador
  useEffect(() => {
    try {
      localStorage.setItem('wd_cotacao_itens', JSON.stringify(itensCotacao));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }, [itensCotacao]);

  // Reseta para a página 1 ao alterar filtros, busca ou ordenação
  useEffect(() => {
    setPaginaAtual(1);
  }, [categoriaAtiva, termoBuscaDebounced, ordenacao]);

  // Contagem de produtos por categoria
  const contagemPorCategoria = useMemo(() => {
    const counts = { todos: produtos.length };
    categorias.forEach(cat => {
      counts[cat.id] = produtos.filter(p => p.categoria === cat.id).length;
    });
    return counts;
  }, [produtos, categorias]);

  // Paginação dos Itens Filtrados
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina) || 1;

  const produtosPaginados = useMemo(() => {
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    return produtos.slice(indiceInicio, indiceInicio + itensPorPagina);
  }, [produtos, paginaAtual, itensPorPagina]);

  const handleMudarPagina = (novaPagina) => {
    setPaginaAtual(novaPagina);
    if (catalogoRef.current) {
      catalogoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Manipulação do Carrinho de Cotação
  const handleAdicionarCotacao = (produto, quantidade) => {
    setItensCotacao(prev => {
      const index = prev.findIndex(item => item.produto.id === produto.id);
      if (index > -1) {
        const novos = [...prev];
        novos[index] = {
          ...novos[index],
          quantidade: novos[index].quantidade + quantidade
        };
        return novos;
      } else {
        return [...prev, { produto, quantidade }];
      }
    });
    mostrarToast(`✅ ${produto.nome} adicionado à lista!`);
  };

  const handleAtualizarQuantidade = (produtoId, novaQuantidade) => {
    setItensCotacao(prev => 
      prev.map(item => 
        item.produto.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const handleRemoverItem = (produtoId) => {
    setItensCotacao(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const handleLimparCotacao = () => {
    if (window.confirm('Deseja realmente esvaziar todos os itens da cotação?')) {
      setItensCotacao([]);
    }
  };

  // Mapeamento de quantidades para exibir no card
  const mapQuantidades = useMemo(() => {
    const mapa = {};
    itensCotacao.forEach(item => {
      mapa[item.produto.id] = item.quantidade;
    });
    return mapa;
  }, [itensCotacao]);

  const totalItens = itensCotacao.length;
  const totalVolumes = itensCotacao.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);

  // SE ESTIVER NO MODO ADMINISTRADOR:
  if (modoAdmin) {
    return (
      <AdminPanel 
        onVoltarCatalogo={() => {
          window.history.pushState(null, '', window.location.pathname);
          setModoAdmin(false);
          carregarDados();
        }} 
      />
    );
  }

  // MODO CATÁLOGO PÚBLICO
  return (
    <div className={styles.appRoot}>
      {/* Toast Notification */}
      {toast.visivel && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#22c55e',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideDown 0.3s ease-out',
          textAlign: 'center'
        }}>
          {toast.mensagem}
        </div>
      )}

      {/* Cabeçalho */}
      <Header 
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
        totalItensCotacao={totalItens}
        onAbrirCotacao={() => setDrawerAberto(true)}
        onAbrirAdmin={() => {
          window.history.pushState(null, '', '#admin');
          setModoAdmin(true);
        }}
        configLoja={configLoja}
      />

      {/* Conteúdo Principal do Catálogo */}
      <main className={styles.catalogContentSection} ref={catalogoRef}>
        <div className="container">
          {/* Barra de Controles e Ordenação */}
          <div className={styles.catalogHeaderRow}>
            <div className={styles.catalogTitleGroup}>
              <h2>
                {categoriaAtiva === 'todos' 
                  ? 'Catálogo Técnico Completo' 
                  : categorias.find(c => c.id === categoriaAtiva)?.label || 'Categoria'}
              </h2>
              <span className={styles.catalogCountInfo}>
                {carregando ? (
                  'Carregando catálogo...'
                ) : produtos.length === 0 ? (
                  'Nenhum produto encontrado'
                ) : (
                  `Mostrando ${produtosPaginados.length} de ${produtos.length} materiais cadastrados`
                )}
                {termoBusca && ` para a busca "${termoBusca}"`}
              </span>
            </div>

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
                    setPaginaAtual(1);
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
          </div>

          {/* Grid de Cards dos Produtos Paginados */}
          {produtos.length === 0 && !carregando ? (
            <div className={styles.emptySearchBox}>
              <PackageOpen size={48} className={styles.emptySearchIcon} style={{ marginBottom: '16px', color: '#94a3b8' }} />
              <h3>Poxa, não encontramos o que você procura...</h3>
              <p>
                Ainda não temos <strong>"{termoBusca}"</strong> cadastrado nesta categoria. 
                Mas não se preocupe! Mande um WhatsApp para a nossa equipe que nós conferimos o estoque ou fazemos sob encomenda!
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
                <button 
                  className={styles.btnClearFilters}
                  onClick={() => { setTermoBusca(''); setCategoriaAtiva('todos'); }}
                >
                  Limpar Filtros
                </button>
                <a 
                  href={`https://wa.me/${configLoja.telefone_whatsapp}?text=${encodeURIComponent(`Olá, tentei procurar por "${termoBusca}" no site de vocês mas não encontrei. Vocês trabalham com esse material?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Perguntar no WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.productsGrid}>
                {produtosPaginados.map((produto) => (
                  <ProductCard 
                    key={produto.id}
                    produto={produto}
                    onAdicionarCotacao={handleAdicionarCotacao}
                    quantidadeNoCarrinho={mapQuantidades[produto.id] || 0}
                  />
                ))}
              </div>

              {/* Componente de Paginação */}
              <Pagination 
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                totalItens={produtos.length}
                itensPorPagina={itensPorPagina}
                setItensPorPagina={setItensPorPagina}
                onMudarPagina={handleMudarPagina}
              />
            </>
          )}
        </div>
      </main>

      {/* Gaveta Lateral de Cotação */}
      <QuoteDrawer 
        aberto={drawerAberto}
        onClose={() => setDrawerAberto(false)}
        itensCotacao={itensCotacao}
        onAtualizarQuantidade={handleAtualizarQuantidade}
        onRemoverItem={handleRemoverItem}
        onLimparCotacao={handleLimparCotacao}
        configLoja={configLoja}
      />

      {/* Rodapé */}
      <Footer configLoja={configLoja} />
    </div>
  );
}

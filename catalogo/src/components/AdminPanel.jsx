import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAdminPanel } from '../hooks/useAdminPanel';
import AdminLogin from './admin/AdminLogin';
import AdminStatsCards from './admin/AdminStatsCards';
import AdminStoreConfig from './admin/AdminStoreConfig';
import ProductsTable from './admin/ProductsTable';
import CategoriesTable from './admin/CategoriesTable';
import ProductModal from './admin/ProductModal';
import CategoryModal from './admin/CategoryModal';
import styles from './AdminPanel.module.css';

export default function AdminPanel({ onVoltarCatalogo }) {
  const admin = useAdminPanel();

  if (admin.verificandoAuth) {
    return (
      <div className={styles.adminWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  if (!admin.autenticado) {
    return (
      <AdminLogin 
        usuario={admin.usuario}
        setUsuario={admin.setUsuario}
        senha={admin.senha}
        setSenha={admin.setSenha}
        manterConectado={admin.manterConectado}
        setManterConectado={admin.setManterConectado}
        erroLogin={admin.erroLogin}
        onSubmit={admin.handleLogin}
        onVoltarCatalogo={onVoltarCatalogo}
        styles={styles}
      />
    );
  }

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
              onClick={admin.handleLogout}
              title="Sair do painel"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Cards de Métricas / KPIs */}
        <AdminStatsCards 
          stats={admin.stats} 
          categoriasCount={admin.categorias.length} 
          styles={styles} 
        />

        {/* Abas */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={admin.abaAtiva === 'produtos' ? styles.btnSave : styles.btnCancel}
            onClick={() => admin.setAbaAtiva('produtos')}
          >
            Gerenciar Produtos
          </button>
          <button 
            type="button" 
            className={admin.abaAtiva === 'categorias' ? styles.btnSave : styles.btnCancel}
            onClick={() => admin.setAbaAtiva('categorias')}
          >
            Gerenciar Categorias
          </button>
          <button 
            type="button" 
            className={admin.abaAtiva === 'config' ? styles.btnSave : styles.btnCancel}
            onClick={() => admin.setAbaAtiva('config')}
          >
            Configurações da Loja
          </button>
        </div>

        {admin.abaAtiva === 'produtos' && (
          <ProductsTable 
            produtos={admin.produtos}
            produtosExibidos={admin.produtosExibidos}
            categorias={admin.categorias}
            termoBusca={admin.termoBusca}
            setTermoBusca={admin.setTermoBusca}
            categoriaFiltro={admin.categoriaFiltro}
            setCategoriaFiltro={admin.setCategoriaFiltro}
            handleNovoProduto={admin.handleNovoProduto}
            handleEditar={admin.handleEditar}
            handleExcluir={admin.handleExcluir}
            handleToggleAtivo={admin.handleToggleAtivo}
            isProcessando={admin.isProcessando}
            paginaTabela={admin.paginaTabela}
            setPaginaTabela={admin.setPaginaTabela}
            itensPorPaginaTabela={admin.itensPorPaginaTabela}
            setItensPorPaginaTabela={admin.setItensPorPaginaTabela}
            totalPaginas={admin.totalPaginas}
            indiceInicio={admin.indiceInicio}
            styles={styles}
          />
        )}

        {admin.abaAtiva === 'categorias' && (
          <CategoriesTable 
            categorias={admin.categorias}
            categoriasExibidas={admin.categoriasExibidas}
            handleNovaCategoria={admin.handleNovaCategoria}
            handleEditarCategoria={admin.handleEditarCategoria}
            handleExcluirCategoria={admin.handleExcluirCategoria}
            isProcessando={admin.isProcessando}
            paginaCategorias={admin.paginaCategorias}
            setPaginaCategorias={admin.setPaginaCategorias}
            totalPaginasCategorias={admin.totalPaginasCategorias}
            indiceInicioCategorias={admin.indiceInicioCategorias}
            itensPorPaginaTabela={admin.itensPorPaginaTabela}
            styles={styles}
          />
        )}

        {admin.abaAtiva === 'config' && (
          <AdminStoreConfig 
            configLoja={admin.configLoja}
            setConfigLoja={admin.setConfigLoja}
            onSubmit={admin.handleSalvarConfig}
            salvandoConfig={admin.salvandoConfig}
            styles={styles}
          />
        )}
      </main>

      {/* Modal de Cadastro / Edição de Produto */}
      <ProductModal 
        aberto={admin.modalAberto}
        onClose={() => admin.setModalAberto(false)}
        produtoEditando={admin.produtoEditando}
        formDados={admin.formDados}
        setFormDados={admin.setFormDados}
        categorias={admin.categorias}
        modoFoto={admin.modoFoto}
        setModoFoto={admin.setModoFoto}
        fazendoUpload={admin.fazendoUpload}
        erroCarregarUrl={admin.erroCarregarUrl}
        setErroCarregarUrl={admin.setErroCarregarUrl}
        handleFileChange={admin.handleFileChange}
        onSubmit={admin.handleSalvarProduto}
        salvando={admin.salvando}
        styles={styles}
      />

      {/* Modal de Cadastro / Edição de Categoria */}
      <CategoryModal 
        aberto={admin.modalCategoriaAberto}
        onClose={() => admin.setModalCategoriaAberto(false)}
        categoriaEditando={admin.categoriaEditando}
        formCategoria={admin.formCategoria}
        setFormCategoria={admin.setFormCategoria}
        onSubmit={admin.handleSalvarCategoria}
        salvando={admin.salvando}
        styles={styles}
      />
    </div>
  );
}

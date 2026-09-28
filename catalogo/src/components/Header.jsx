import React from 'react';
import { Search, ShoppingCart, MessageCircle, Clock, Shield } from 'lucide-react';
import { INFO_EMPRESA } from '../data/produtos';
import styles from './Header.module.css';

export default function Header({ 
  termoBusca, 
  setTermoBusca, 
  totalItensCotacao, 
  onAbrirCotacao,
  onAbrirAdmin,
  configLoja
}) {
  const linkWhatsApp = `https://wa.me/${configLoja?.telefone_whatsapp || INFO_EMPRESA.telefoneWhatsapp}?text=${encodeURIComponent('Olá! Acessei o catálogo digital da WD Blocos e gostaria de tirar uma dúvida.')}`;

  return (
    <header className={styles.siteHeader}>
      {/* Top bar de aviso rápido */}
      <div className={styles.topBanner}>
        <div className={`container ${styles.topBannerContent}`}>
          <div className={styles.topBannerItem}>
            <Clock size={14} className={styles.bannerIcon} />
            <span>{INFO_EMPRESA.horario}</span>
          </div>
          <button 
            type="button" 
            onClick={onAbrirAdmin}
            className={styles.btnAdminTop}
            title="Acessar painel administrativo"
          >
            <Shield size={13} className={styles.adminShieldIcon} />
            <span>Painel Lojista</span>
          </button>
        </div>
      </div>

      {/* Barra Principal */}
      <div className={styles.mainHeader}>
        <div className={`container ${styles.headerContainer}`}>
          {/* Logo e Identidade */}
          <div className={styles.brandGroup}>
            <a href="/" className={styles.brandLink}>
              <img src="/logo.svg" alt="WD Blocos Logo" className={styles.brandLogo} />
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>WD BLOCOS</span>
                <span className={styles.brandSubtitle}>CATÁLOGO TÉCNICO & FÁBRICA</span>
              </div>
            </a>
          </div>

          {/* Campo de Busca Rápida Instantânea */}
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por bloco, canaleta, paver, cimento ou medida (ex: 14x19x39)..."
              value={termoBusca}
              maxLength={80}
              onChange={(e) => setTermoBusca(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {termoBusca && (
              <button 
                className={styles.clearSearchBtn}
                onClick={() => setTermoBusca('')}
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          {/* Ações: WhatsApp Direto + Botão Carrinho de Cotação */}
          <div className={styles.headerActions}>
            <a 
              href={linkWhatsApp} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.btnWhatsappHeader}
              title="Falar direto no WhatsApp"
            >
              <MessageCircle size={18} />
              <span className={styles.btnLabelDesktop}>Falar com Especialista</span>
            </a>

            <button 
              className={`${styles.btnCartHeader} ${totalItensCotacao > 0 ? styles.active : ''}`}
              onClick={onAbrirCotacao}
              title="Ver Lista de Cotação"
            >
              <div className={styles.cartIconWrapper}>
                <ShoppingCart size={20} />
                {totalItensCotacao > 0 && (
                  <span className={styles.cartBadgeCount}>{totalItensCotacao}</span>
                )}
              </div>
              <div className={styles.cartTextWrapper}>
                <span className={styles.cartTitle}>Minha Cotação</span>
                <span className={styles.cartSubtitle}>
                  {totalItensCotacao === 0 ? 'Vazia' : `${totalItensCotacao} ${totalItensCotacao === 1 ? 'item' : 'itens'}`}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

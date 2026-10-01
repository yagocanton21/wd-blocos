import React from 'react';
import { MapPin, ExternalLink, Truck, Clock } from 'lucide-react';
import { INFO_EMPRESA } from '../data/produtos';
import styles from './Footer.module.css';

const REGIOES_ATENDIDAS = [
  'Bom Jesus dos Perdões',
  'Atibaia',
  'Nazaré Paulista',
  'Piracaia'
];

export default function Footer({ configLoja }) {
  const zapNumero = configLoja?.telefone_whatsapp || INFO_EMPRESA.telefoneWhatsapp;
  const zapUrl = `https://wa.me/${zapNumero}?text=${encodeURIComponent('Olá! Gostaria de consultar o frete e a entrega para a minha obra.')}`;

  return (
    <footer className={styles.siteFooter}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Informações de Contato e Endereço */}
          <div className={styles.infoCol}>
            <div className={styles.footerLogoGroup}>
              <img src="/logo.svg" alt="WD Blocos" className={styles.footerLogo} />
              <div>
                <h3 className={styles.footerBrandName}>WD BLOCOS</h3>
                <span className={styles.footerBrandDesc}>Indústria de Blocos e Materiais de Construção</span>
              </div>
            </div>

            <div className={styles.contactCards}>
              {/* Endereço da Fábrica */}
              <div className={styles.contactCard}>
                <div className={styles.contactIconMap}>
                  <MapPin size={20} />
                </div>
                <div className={styles.contactCardContent}>
                  <span className={styles.contactLabel}>Fábrica & Retirada de Material</span>
                  <address className={styles.addressText}>
                    {INFO_EMPRESA.endereco}
                  </address>
                  <a 
                    href={INFO_EMPRESA.linkGoogleMaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.btnOpenMaps}
                  >
                    <ExternalLink size={13} /> Abrir no Google Maps / Traçar Rota GPS
                  </a>
                </div>
              </div>

              {/* Horário de Atendimento */}
              <div className={styles.contactCard}>
                <div className={styles.contactIconClock}>
                  <Clock size={20} />
                </div>
                <div className={styles.contactCardContent}>
                  <span className={styles.contactLabel}>Horário de Funcionamento</span>
                  <span className={styles.scheduleText}>{INFO_EMPRESA.horario}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regiões Atendidas & Logística (Foco em SEO Local e Vendas) */}
          <div className={styles.deliveryCol}>
            <div className={styles.deliveryCard}>
              <div className={styles.deliveryHeader}>
                <div className={styles.deliveryHeaderIcon}>
                  <Truck size={22} />
                </div>
                <div>
                  <h4 className={styles.deliveryTitle}>Entregas Rápidas na sua Obra</h4>
                  <p className={styles.deliverySubtitle}>
                    Frota própria com pontualidade e descarga ágil na sua obra.
                  </p>
                </div>
              </div>

              <div className={styles.regionSection}>
                <span className={styles.regionLabel}>Cidades & Regiões Atendidas com Frete Facilitado:</span>
                <div className={styles.regionTags}>
                  {REGIOES_ATENDIDAS.map((regiao) => (
                    <span key={regiao} className={styles.regionTag}>
                      <MapPin size={11} className={styles.tagPin} />
                      {regiao}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.deliveryNotice}>
                <p className={styles.noticeText}>
                  Sua obra é em outra localidade?{' '}
                  <a 
                    href={zapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.noticeLink}
                  >
                    Consulte frete e rota pelo WhatsApp →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} WD Blocos — Todos os direitos reservados. Catálogo Técnico Digital.</p>
          <p>Av. Tiradentes, nº 21 - Centro, Bom Jesus dos Perdões - SP</p>
        </div>
      </div>
    </footer>
  );
}

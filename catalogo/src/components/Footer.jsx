import React from 'react';
import { MessageSquare, MapPin, ExternalLink } from 'lucide-react';
import { INFO_EMPRESA } from '../data/produtos';
import styles from './Footer.module.css';

export default function Footer({ configLoja }) {
  const telefoneWhatsapp = configLoja?.telefone_whatsapp || INFO_EMPRESA.telefoneWhatsapp;
  const telefoneExibicao = configLoja?.telefone_exibicao || INFO_EMPRESA.telefoneExibicao;

  const linkWhatsApp = `https://wa.me/${telefoneWhatsapp}?text=${encodeURIComponent('Olá! Acessei o catálogo digital da WD Blocos e gostaria de solicitar um orçamento.')}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent('Av. Tiradentes, 21 - Centro, Bom Jesus dos Perdões - SP, 12955-025')}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

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
              {/* WhatsApp */}
              <div className={styles.contactCard}>
                <div className={styles.contactIconZap}>
                  <MessageSquare size={20} />
                </div>
                <div className={styles.contactCardContent}>
                  <span className={styles.contactLabel}>Telefone / WhatsApp</span>
                  <a 
                    href={linkWhatsApp} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.zapNumber}
                  >
                    {telefoneExibicao}
                    <span className={styles.clickHint}>(Clique para conversar)</span>
                  </a>
                </div>
              </div>

              {/* Endereço */}
              <div className={styles.contactCard}>
                <div className={styles.contactIconMap}>
                  <MapPin size={20} />
                </div>
                <div className={styles.contactCardContent}>
                  <span className={styles.contactLabel}>Localização da Fábrica</span>
                  <address className={styles.addressText}>
                    {INFO_EMPRESA.endereco}
                  </address>
                  <a 
                    href={INFO_EMPRESA.linkGoogleMaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.btnOpenMaps}
                  >
                    <ExternalLink size={13} /> Abrir no Google Maps / Traçar Rota
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa do Google Maps */}
          <div className={styles.mapCol}>
            <div className={styles.mapHeader}>
              <MapPin size={16} className={styles.mapHeaderIcon} />
              <span>Como Chegar — Bom Jesus dos Perdões / SP</span>
            </div>
            <div className={styles.mapContainer}>
              <iframe
                title="Localização WD Blocos no Google Maps"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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

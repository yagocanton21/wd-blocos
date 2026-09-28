import React from 'react';
import { ShieldCheck, Truck, Layers } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot}></span>
          <span>PRODUÇÃO PRÓPRIA & ALTA RESISTÊNCIA</span>
        </div>

        <h1 className={styles.heroTitle}>
          Materiais de Construção & Blocos Estruturais <span className={styles.highlightText}>Direto da Fábrica</span>
        </h1>

        <p className={styles.heroDescription}>
          Fornecimento de alta precisão para obras residenciais, mestres de obra e construtoras. 
          Selecione os materiais técnicos abaixo, adicione as quantidades da sua obra e envie para cotação direta em um único clique.
        </p>

        <div className={styles.heroTrustCards}>
          <div className={styles.trustCard}>
            <div className={styles.trustIcon}>
              <ShieldCheck size={22} />
            </div>
            <div className={styles.trustInfo}>
              <strong>Conformidade ABNT</strong>
              <span>NBR 6136 e NBR 9781 com laudos técnicos</span>
            </div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIcon}>
              <Truck size={22} />
            </div>
            <div className={styles.trustInfo}>
              <strong>Logística com Munck</strong>
              <span>Carga 100% paletizada e descarregamento ágil</span>
            </div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIcon}>
              <Layers size={22} />
            </div>
            <div className={styles.trustInfo}>
              <strong>Linha Completa</strong>
              <span>Blocos, canaletas, pavers, cimento e aço</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

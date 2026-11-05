import React from 'react';
import { Package, Layers } from 'lucide-react';

export default function AdminStatsCards({ stats, categoriasCount, styles }) {
  return (
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
          <div className={styles.statValue}>{categoriasCount}</div>
          <div className={styles.statLabel}>Linhas / Categorias</div>
        </div>
      </div>
    </section>
  );
}


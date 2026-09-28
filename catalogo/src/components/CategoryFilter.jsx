import React from 'react';
import { 
  Layers, 
  Boxes, 
  Grid3X3, 
  Square, 
  LayoutGrid, 
  Package, 
  Wrench 
} from 'lucide-react';
import { CATEGORIAS } from '../data/produtos';
import styles from './CategoryFilter.module.css';

const ICON_MAP = {
  Layers,
  Boxes,
  Grid3X3,
  Square,
  LayoutGrid,
  Package,
  Wrench
};

export default function CategoryFilter({ 
  categoriaAtiva, 
  setCategoriaAtiva, 
  contagemPorCategoria 
}) {
  return (
    <div className={styles.categoryFilterWrapper}>
      <div className="container">
        <div className={styles.categoryScrollContainer}>
          {CATEGORIAS.map((cat) => {
            const IconComponent = ICON_MAP[cat.icone] || Layers;
            const isAtivo = categoriaAtiva === cat.id;
            const count = contagemPorCategoria[cat.id] || 0;

            return (
              <button
                key={cat.id}
                className={`${styles.categoryPillBtn} ${isAtivo ? styles.active : ''}`}
                onClick={() => setCategoriaAtiva(cat.id)}
              >
                <IconComponent size={16} />
                <span className={styles.pillLabel}>{cat.label}</span>
                <span className={styles.pillCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

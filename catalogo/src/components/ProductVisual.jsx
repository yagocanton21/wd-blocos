import React from 'react';
import styles from './ProductVisual.module.css';

export default function ProductVisual({ tipo, dimensao, nome }) {
  // Cores técnicas com alto contraste
  const strokeColor = '#334155';
  const fillColor = '#E2E8F0';
  const highlightColor = '#FF6600';
  const innerColor = '#CBD5E1';

  const renderIcon = () => {
    switch (tipo) {
      case 'bloco-padrao':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="30,50 80,25 130,50 80,75" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="30,50 80,75 80,105 30,80" fill={innerColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,75 130,50 130,80 80,105" fill="#94A3B8" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="55,42 75,32 75,40 55,50" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="85,42 105,32 105,40 85,50" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="25" y1="52" x2="25" y2="78" stroke={highlightColor} strokeWidth="1.5" strokeDasharray="3,2" />
          </svg>
        );

      case 'bloco-largo':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="25,52 80,22 135,52 80,82" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="25,52 80,82 80,110 25,80" fill={innerColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,82 135,52 135,80 80,110" fill="#94A3B8" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="50,46 72,34 72,46 50,58" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="88,46 110,34 110,46 88,58" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );

      case 'meio-bloco':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="45,50 80,32 115,50 80,68" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="45,50 80,68 80,98 45,80" fill={innerColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,68 115,50 115,80 80,98" fill="#94A3B8" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="65,46 95,36 95,46 65,56" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );

      case 'bloco-fino':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="40,48 80,35 120,48 80,61" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="40,48 80,61 80,95 40,82" fill={innerColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,61 120,48 120,82 80,95" fill="#94A3B8" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="56,47 74,40 74,47 56,54" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="86,47 104,40 104,47 86,54" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );

      case 'canaleta-u':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="30,50 80,25 130,50 80,75" fill="#1E293B" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="30,50 80,75 80,105 30,80" fill={innerColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,75 130,50 130,80 80,105" fill="#94A3B8" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="45,47 80,32 115,47 80,62" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
            <line x1="80" y1="62" x2="80" y2="85" stroke={strokeColor} strokeWidth="2" />
            <line x1="45" y1="47" x2="45" y2="70" stroke={strokeColor} strokeWidth="2" />
            <line x1="115" y1="47" x2="115" y2="70" stroke={strokeColor} strokeWidth="2" />
          </svg>
        );

      case 'canaleta-j':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="30,50 80,25 130,50 80,75" fill="#1E293B" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="30,50 80,75 80,105 30,80" fill={innerColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,75 130,50 130,80 80,105" fill="#94A3B8" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="42,50 80,34 118,50 80,66" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
            <polygon points="42,50 80,66 80,78 42,62" fill="#CBD5E1" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );

      case 'paver-ret':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="45,45 85,25 125,45 85,65" fill="#FDA4AF" stroke="#BE123C" strokeWidth="2.5" />
            <polygon points="45,45 85,65 85,85 45,65" fill="#F43F5E" stroke="#BE123C" strokeWidth="2.5" />
            <polygon points="85,65 125,45 125,65 85,85" fill="#E11D48" stroke="#BE123C" strokeWidth="2.5" />
            <circle cx="85" cy="45" r="3" fill="#FFE4E6" />
            <circle cx="70" cy="40" r="2" fill="#FFE4E6" />
            <circle cx="100" cy="50" r="2" fill="#FFE4E6" />
          </svg>
        );

      case 'paver-sex':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="80,25 115,40 115,75 80,90 45,75 45,40" fill="#CBD5E1" stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="80,35 105,48 105,75 80,88 55,75 55,48" fill="#94A3B8" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="80" cy="62" r="5" fill="#64748B" />
          </svg>
        );

      case 'saco':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <rect x="45" y="30" width="70" height="70" rx="8" fill="#CBD5E1" stroke={strokeColor} strokeWidth="2.5" />
            <rect x="52" y="38" width="56" height="54" rx="4" fill="#94A3B8" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="58" y="55" width="44" height="20" fill={highlightColor} rx="3" />
            <text x="80" y="69" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">CP II 50KG</text>
            <line x1="55" y1="35" x2="105" y2="35" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="4,2" />
          </svg>
        );

      case 'agregado':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <polygon points="80,30 125,90 35,90" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
            <circle cx="65" cy="70" r="4" fill="#D97706" />
            <circle cx="85" cy="65" r="5" fill="#B45309" />
            <circle cx="95" cy="78" r="3" fill="#D97706" />
            <circle cx="50" cy="82" r="3" fill="#B45309" />
            <circle cx="78" cy="80" r="4" fill="#F59E0B" />
          </svg>
        );

      case 'bisnaga':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <rect x="25" y="45" width="85" height="30" rx="10" fill={highlightColor} stroke="#C2410C" strokeWidth="2.5" />
            <polygon points="110,50 135,60 110,70" fill="#FFFFFF" stroke="#C2410C" strokeWidth="2" />
            <text x="67" y="63" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" letterSpacing="0.5">MASSA POLIMÉRICA</text>
          </svg>
        );

      case 'tela-aco':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <rect x="35" y="25" width="90" height="70" fill="none" stroke="#0284C7" strokeWidth="2" />
            <line x1="55" y1="25" x2="55" y2="95" stroke="#0284C7" strokeWidth="2" />
            <line x1="75" y1="25" x2="75" y2="95" stroke="#0284C7" strokeWidth="2" />
            <line x1="95" y1="25" x2="95" y2="95" stroke="#0284C7" strokeWidth="2" />
            <line x1="115" y1="25" x2="115" y2="95" stroke="#0284C7" strokeWidth="2" />
            <line x1="35" y1="42" x2="125" y2="42" stroke="#0284C7" strokeWidth="2" />
            <line x1="35" y1="60" x2="125" y2="60" stroke="#0284C7" strokeWidth="2" />
            <line x1="35" y1="78" x2="125" y2="78" stroke="#0284C7" strokeWidth="2" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full">
            <rect x="40" y="35" width="80" height="50" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
            <circle cx="80" cy="60" r="12" fill={highlightColor} />
          </svg>
        );
    }
  };

  return (
    <div className={styles.productVisualWrapper}>
      <div className={styles.productVisualCanvas}>
        {renderIcon()}
      </div>
      {dimensao && (
        <div className={styles.productSpecBadge}>
          <span>{dimensao}</span>
        </div>
      )}
    </div>
  );
}

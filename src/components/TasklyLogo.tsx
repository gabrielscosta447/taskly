/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Logotipo Oficial em SVG (Estilo Slate & Teal)
 * Design vetorial moderno representando foco, listas e conclusão de tarefas.
 */

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const TasklyLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 38, text: 'text-2xl' },
    lg: { icon: 50, text: 'text-3xl' },
    xl: { icon: 64, text: 'text-4xl' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Símbolo Vetorial SVG Exclusivo Taskly */}
      <svg
        width={current.icon}
        height={current.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="Logotipo Taskly"
      >
        <defs>
          {/* Gradiente principal com Teal (#0D9488) e Azul Royal (#2563EB) */}
          <linearGradient id="tasklyIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="65%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Gradiente do checkmark com Verde Vivo (#16A34A) */}
          <linearGradient id="tasklyCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>

          <filter id="tasklyGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0D9488" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Fundo do emblema com cantos arredondados */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="22"
          fill="url(#tasklyIconGrad)"
          filter="url(#tasklyGlow)"
        />

        {/* Traços horizontais simulando uma folha de tarefas organizada */}
        <rect x="26" y="30" width="34" height="4.5" rx="2.25" fill="#FFFFFF" fillOpacity="0.45" />
        <rect x="26" y="44" width="24" height="4.5" rx="2.25" fill="#FFFFFF" fillOpacity="0.4" />
        <rect x="26" y="58" width="18" height="4.5" rx="2.25" fill="#FFFFFF" fillOpacity="0.3" />

        {/* Checkmark dinâmico em destaque verde com borda branca */}
        <path
          d="M40 68L29 57C27.5 55.5 27.5 53 29 51.5C30.5 50 33 50 34.5 51.5L41.5 58.5L70.5 29.5C72 28 74.5 28 76 29.5C77.5 31 77.5 33.5 76 35L44 67C43 68 41.5 68.5 40 68Z"
          fill="url(#tasklyCheckGrad)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Nome da Marca com tipografia refinada */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-extrabold">
            <span className={`${current.text}`} style={{ color: 'var(--text-main)' }}>
              Task
            </span>
            <span className={`${current.text}`} style={{ color: 'var(--color-brand)' }}>
              ly
            </span>
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-app-muted">
            Organizador Inteligente
          </span>
        </div>
      )}
    </div>
  );
};

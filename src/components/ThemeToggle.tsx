/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Botão de Alternância de Tema (Light / Dark)
 * Adiciona e remove a classe ".dark" diretamente na tag <body> para acionar
 * as CSS Variables espelhadas com transição fluida.
 */

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Inicializa o tema verificando preferência salva ou do sistema operacional
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskly_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if (shouldBeDark) {
      document.body.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.body.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  // Manipulador de clique para alternar o modo
  const toggleTheme = () => {
    // Adiciona ou remove a classe ".dark" diretamente na tag <body>
    const isNowDark = document.body.classList.toggle('dark');
    setIsDarkMode(isNowDark);
    
    // Salva a preferência para persistência no navegador
    localStorage.setItem('taskly_theme', isNowDark ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
      title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
      className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
        isDarkMode
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      } shadow-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${className}`}
    >
      {isDarkMode ? (
        <Sun size={20} className="transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={20} className="transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
};

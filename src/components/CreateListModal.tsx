/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Modal para Criação de Nova Lista
 * Permite definir título, descrição e escolher ícones temáticos
 * (mercado, farmácia, estudo, trabalho, finanças, etc.).
 */

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { CategoryIconType, TaskList } from '../types.ts';
import { CATEGORY_DEFINITIONS, CategoryIcon } from './CategoryIcon.tsx';

interface CreateListModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (newList: TaskList) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  userId,
  isOpen,
  onClose,
  onListCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<CategoryIconType>('study');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe um título para a lista.');
      return;
    }

    const categoryDef = CATEGORY_DEFINITIONS.find((c) => c.id === selectedIcon);

    const newList: TaskList = {
      id: `list-${Date.now()}`,
      userId,
      title: title.trim(),
      description: description.trim() || undefined,
      icon: selectedIcon,
      categoryName: categoryDef?.label || 'Geral',
      createdAt: Date.now(),
      tasks: [],
    };

    onListCreated(newList);
    setTitle('');
    setDescription('');
    setSelectedIcon('study');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl bg-app-card transition-all"
        style={{
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-app">
          <div>
            <h3 className="text-lg font-bold text-app-main">Criar Nova Lista</h3>
            <p className="text-xs text-app-muted">Organize seus objetivos em categorias visuais</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-app-muted hover:text-app-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            className="mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold border"
            style={{
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              borderColor: 'var(--color-warning)',
              color: 'var(--color-warning)',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nome da Lista */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Nome da Lista *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Projetos de TI, Supermercado, Metas do Mês..."
              className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Descrição Opcional */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Descrição (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Tarefas prioritárias e prazos desta semana"
              className="w-full px-4 py-2 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Seletor de Ícones Simples das Categorias */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">
              Escolha um Ícone para a Lista
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {CATEGORY_DEFINITIONS.map((cat) => {
                const isSelected = selectedIcon === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedIcon(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center cursor-pointer bg-white dark:bg-slate-800/80 ${
                      isSelected
                        ? 'border-2 border-[var(--color-brand)] shadow-sm'
                        : 'border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`mb-1 transition-colors ${
                        isSelected
                          ? 'text-[var(--color-brand)]'
                          : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      <CategoryIcon type={cat.id} size={24} />
                    </div>
                    <span
                      className={`text-xs truncate w-full ${
                        isSelected ? 'font-bold text-[var(--color-brand)]' : 'font-medium text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ações do Modal */}
          <div className="pt-3 border-t border-app flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-app-muted hover:text-app-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-brand px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus size={16} />
              <span>Criar Lista</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

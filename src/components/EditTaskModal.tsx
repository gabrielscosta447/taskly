/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Modal para Edição Completa de Tarefas
 * Permite alterar o título, nível de prioridade (Baixa, Média, Alta),
 * data limite e observações adicionais.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, FileText, AlertCircle } from 'lucide-react';
import { TaskItem, TaskPriority } from '../types.ts';

interface EditTaskModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: TaskItem) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sincroniza estado com a tarefa selecionada
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority || (task.isUrgent ? 'high' : 'medium'));
      setDueDate(task.dueDate || '');
      setNote(task.note || '');
      setError(null);
    }
  }, [task, isOpen]);

  // Fecha com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('O título da tarefa não pode ficar vazio.');
      return;
    }

    onSave({
      ...task,
      title: trimmedTitle,
      priority,
      isUrgent: priority === 'high',
      dueDate: dueDate || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 bg-app-card shadow-2xl transition-all"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-app">
          <div>
            <h3 className="text-lg font-bold text-app-main">Editar Tarefa</h3>
            <p className="text-xs text-app-muted">Ajuste detalhes, prazo e prioridade</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
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
          {/* Título da Tarefa */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Título da Tarefa *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="O que precisa ser feito?"
              className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Seletor de Prioridade: Baixa, Média, Alta */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">
              Nível de Prioridade
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Baixa */}
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-800 ${
                  priority === 'low'
                    ? 'border-2 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
                style={
                  priority === 'low'
                    ? {
                        borderColor: 'var(--color-tag)',
                        color: 'var(--color-tag)',
                      }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-tag)',
                    opacity: priority === 'low' ? 1 : 0.35,
                  }}
                />
                <span>Baixa</span>
              </button>

              {/* Média */}
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-800 ${
                  priority === 'medium'
                    ? 'border-2 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
                style={
                  priority === 'medium'
                    ? {
                        borderColor: 'var(--color-brand)',
                        color: 'var(--color-brand)',
                      }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    opacity: priority === 'medium' ? 1 : 0.35,
                  }}
                />
                <span>Média</span>
              </button>

              {/* Alta */}
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-800 ${
                  priority === 'high'
                    ? 'border-2 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
                style={
                  priority === 'high'
                    ? {
                        borderColor: 'var(--color-warning)',
                        color: 'var(--color-warning)',
                      }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-warning)',
                    opacity: priority === 'high' ? 1 : 0.35,
                  }}
                />
                <span>Alta</span>
              </button>
            </div>
          </div>

          {/* Prazo de Conclusão (Data limite) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Prazo de Conclusão (Opcional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Observações / Notas Adicionais */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5 flex items-center gap-1.5">
              <FileText size={14} />
              <span>Observações ou Detalhes (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Link de referência, local ou instruções..."
              className="w-full px-3.5 py-2 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--border-color)' }}
            />
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
              <Check size={16} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

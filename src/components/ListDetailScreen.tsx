/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Tela 3: Visualização e Gerenciamento da Lista
 * Inclui:
 * 1. Reordenação interativa Drag and Drop para organizar tarefas.
 * 2. Seleção de prioridade (Baixa, Média, Alta) com mudança dinâmica de cores ao clicar.
 * 3. Modal de edição completa, feedback sonoro e filtros.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Calendar,
  Edit2,
  CheckCircle2,
  ListFilter,
  Volume2,
  VolumeX,
  GripVertical,
} from 'lucide-react';
import { TaskList, TaskItem, TaskFilter, TaskSortMode, TaskPriority } from '../types.ts';
import { TasklyLogo } from './TasklyLogo.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { CategoryIcon } from './CategoryIcon.tsx';
import { EditTaskModal } from './EditTaskModal.tsx';
import { playTaskDoneSound } from '../utils/audio.ts';

interface ListDetailScreenProps {
  list: TaskList;
  onBack: () => void;
  onUpdateList: (updatedList: TaskList) => void;
}

export const ListDetailScreen: React.FC<ListDetailScreenProps> = ({
  list,
  onBack,
  onUpdateList,
}) => {
  // Estados para inserção de nova tarefa
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estados de visualização e filtros
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sortMode, setSortMode] = useState<TaskSortMode>('custom');

  // Estados para Drag and Drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Estado para o modal de edição de tarefa
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. INSERÇÃO DE NOVO ITEM
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrimmed = newTitle.trim();
    if (!titleTrimmed) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: titleTrimmed,
      completed: false,
      priority: newPriority,
      isUrgent: newPriority === 'high',
      dueDate: newDueDate || undefined,
      createdAt: Date.now(),
      order: list.tasks.length + 1,
    };

    const updatedTasks = [...list.tasks, newTask];
    onUpdateList({
      ...list,
      tasks: updatedTasks,
    });

    // Reseta o formulário mantendo prioridade média como padrão
    setNewTitle('');
    setNewPriority('medium');
    setNewDueDate('');
  };

  // 2. MARCAR / DESMARCAR ITEM (com feedback sonoro)
  const handleToggleTask = (taskId: string) => {
    const task = list.tasks.find((t) => t.id === taskId);
    const willBeCompleted = task ? !task.completed : false;

    if (willBeCompleted && soundEnabled) {
      playTaskDoneSound();
    }

    const updatedTasks = list.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: willBeCompleted };
      }
      return t;
    });

    onUpdateList({
      ...list,
      tasks: updatedTasks,
    });
  };

  // 3. ALTERNAR PRIORIDADE RÁPIDA NO ITEM (Baixa -> Média -> Alta -> Baixa)
  const handleCyclePriority = (task: TaskItem) => {
    const nextPriorityMap: Record<TaskPriority, TaskPriority> = {
      low: 'medium',
      medium: 'high',
      high: 'low',
    };
    const current = task.priority || (task.isUrgent ? 'high' : 'medium');
    const next = nextPriorityMap[current];

    const updatedTasks = list.tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          priority: next,
          isUrgent: next === 'high',
        };
      }
      return t;
    });

    onUpdateList({
      ...list,
      tasks: updatedTasks,
    });
  };

  // 4. EXCLUIR ITEM
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = list.tasks.filter((t) => t.id !== taskId);
    onUpdateList({
      ...list,
      tasks: updatedTasks,
    });
  };

  // 5. DRAG AND DROP HANDLERS
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTaskId !== targetId) {
      setDragOverTaskId(targetId);
    }
  };

  const handleDragLeave = (targetId: string) => {
    if (dragOverTaskId === targetId) {
      setDragOverTaskId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const currentTasks = [...list.tasks];
    const fromIndex = currentTasks.findIndex((t) => t.id === draggedTaskId);
    const toIndex = currentTasks.findIndex((t) => t.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedTask] = currentTasks.splice(fromIndex, 1);
      currentTasks.splice(toIndex, 0, movedTask);

      // Reorganiza a numeração de ordem
      const reordered = currentTasks.map((t, idx) => ({
        ...t,
        order: idx + 1,
      }));

      onUpdateList({
        ...list,
        tasks: reordered,
      });

      // Ativa o modo personalizado para manter a ordem definida pelo usuário
      if (sortMode !== 'custom') {
        setSortMode('custom');
      }
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  // 6. ORGANIZAR: MOVER ITEM PARA CIMA / BAIXO (Botoes acessiveis)
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newTasks = [...list.tasks];
    const temp = newTasks[index - 1];
    newTasks[index - 1] = newTasks[index];
    newTasks[index] = temp;

    newTasks.forEach((t, i) => {
      t.order = i + 1;
    });

    onUpdateList({
      ...list,
      tasks: newTasks,
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= list.tasks.length - 1) return;
    const newTasks = [...list.tasks];
    const temp = newTasks[index + 1];
    newTasks[index + 1] = newTasks[index];
    newTasks[index] = temp;

    newTasks.forEach((t, i) => {
      t.order = i + 1;
    });

    onUpdateList({
      ...list,
      tasks: newTasks,
    });
  };

  // 7. ABRIR MODAL DE EDIÇÃO
  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedTask = (updatedTask: TaskItem) => {
    const updatedTasks = list.tasks.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    );

    onUpdateList({
      ...list,
      tasks: updatedTasks,
    });
    setEditingTask(null);
  };

  // 8. LIMPAR TODAS AS CONCLUÍDAS
  const handleClearCompleted = () => {
    const updatedTasks = list.tasks.filter((t) => !t.completed);
    onUpdateList({
      ...list,
      tasks: updatedTasks,
    });
  };

  // 9. FILTRAGEM & ORDENAÇÃO DOS ITENS
  const tasksFiltered = list.tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const priorityScore: Record<TaskPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = [...tasksFiltered].sort((a, b) => {
    if (sortMode === 'priority') {
      const pDiff = (priorityScore[b.priority || 'medium']) - (priorityScore[a.priority || 'medium']);
      if (pDiff !== 0) return pDiff;
      return a.order - b.order;
    }
    if (sortMode === 'pending') {
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      return 0;
    }
    if (sortMode === 'newest') {
      return b.createdAt - a.createdAt;
    }
    if (sortMode === 'alphabetical') {
      return a.title.localeCompare(b.title, 'pt-BR');
    }
    return a.order - b.order;
  });

  // Métricas da lista
  const totalItems = list.tasks.length;
  const completedCount = list.tasks.filter((t) => t.completed).length;
  const highPriorityCount = list.tasks.filter(
    (t) => !t.completed && (t.priority === 'high' || t.isUrgent)
  ).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Renderizador do Badge de Prioridade com cores dinâmicas e clique para alternar
  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all select-none"
            style={{
              borderColor: 'var(--color-warning)',
              color: 'var(--color-warning)',
              backgroundColor: 'transparent',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
            <span>Alta</span>
          </span>
        );
      case 'medium':
        return (
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all select-none"
            style={{
              borderColor: 'var(--color-brand)',
              color: 'var(--color-brand)',
              backgroundColor: 'transparent',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span>Média</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all select-none"
            style={{
              borderColor: 'var(--color-tag)',
              color: 'var(--color-tag)',
              backgroundColor: 'transparent',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-tag)' }} />
            <span>Baixa</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-main transition-colors duration-300">
      {/* 1. CABEÇALHO SUPERIOR */}
      <header
        className="w-full border-b sticky top-0 z-30 bg-app-card/95 backdrop-blur-md transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              title="Voltar para todas as listas"
              aria-label="Voltar para todas as listas"
              className="p-2 rounded-xl border border-app text-app-muted hover:text-app-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline text-xs font-bold">Listas</span>
            </button>
            <TasklyLogo size="sm" showText={false} />
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle de som sutil */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Efeitos sonoros ativados' : 'Efeitos sonoros desativados'}
              className="p-2 rounded-xl border border-app text-app-muted hover:text-app-main transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Alternador de Tema Light / Dark */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* BANNER COM INFORMAÇÕES DA LISTA SELECIONADA */}
        <section
          className="rounded-2xl border p-5 sm:p-6 bg-app-card shadow-sm transition-all"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2"
                style={{
                  borderColor: 'var(--color-brand)',
                  color: 'var(--color-brand)',
                  backgroundColor: 'transparent',
                }}
              >
                <CategoryIcon type={list.icon} size={26} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-tag)' }}
                  >
                    {list.categoryName || 'Lista'}
                  </span>
                  {highPriorityCount > 0 && (
                    <>
                      <span className="text-app-muted">·</span>
                      <span
                        className="text-xs font-bold flex items-center gap-1"
                        style={{ color: 'var(--color-warning)' }}
                      >
                        <AlertTriangle size={13} />
                        {highPriorityCount} prioridade alta
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-app-main tracking-tight mt-0.5">
                  {list.title}
                </h1>
                {list.description && (
                  <p className="text-xs text-app-muted mt-1">{list.description}</p>
                )}
              </div>
            </div>

            {/* Contador de Conclusão */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="block text-sm font-bold font-mono tabular-nums text-app-main">
                  {completedCount} / {totalItems}
                </span>
                <span className="text-[11px] text-app-muted">tarefas feitas</span>
              </div>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-mono font-extrabold text-xs border-2"
                style={{
                  borderColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-brand)',
                  color: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-brand)',
                  backgroundColor: 'transparent',
                }}
              >
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 mt-5">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-brand)',
              }}
            />
          </div>
        </section>

        {/* FORMULÁRIO PARA ADICIONAR NOVO ITEM À LISTA COM PRIORIDADES QUE MUDAM DE COR */}
        <section
          className="rounded-2xl border p-4 sm:p-5 bg-app-card shadow-sm transition-all"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Campo do Nome da Tarefa */}
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Adicionar nova tarefa (pressione Enter)..."
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-color)' }}
              />

              {/* Botão de Adicionar */}
              <button
                type="submit"
                className="btn-brand px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Adicionar</span>
              </button>
            </div>

            {/* SELETORES DE PRIORIDADE QUE MUDAM DE COR DINAMICAMENTE */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-app-muted mr-1">Prioridade:</span>
                  
                  {/* Botão Prioridade BAIXA (Muda de cor para Ciano ao selecionar) */}
                  <button
                    type="button"
                    onClick={() => setNewPriority('low')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-800 ${
                      newPriority === 'low'
                        ? 'border-2 shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                    style={
                      newPriority === 'low'
                        ? {
                            borderColor: 'var(--color-tag)',
                            color: 'var(--color-tag)',
                          }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-tag)',
                        opacity: newPriority === 'low' ? 1 : 0.4,
                      }}
                    />
                    <span>Baixa</span>
                  </button>

                  {/* Botão Prioridade MÉDIA (Muda de cor para Roxo Índigo ao selecionar) */}
                  <button
                    type="button"
                    onClick={() => setNewPriority('medium')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-800 ${
                      newPriority === 'medium'
                        ? 'border-2 shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                    style={
                      newPriority === 'medium'
                        ? {
                            borderColor: 'var(--color-brand)',
                            color: 'var(--color-brand)',
                          }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-brand)',
                        opacity: newPriority === 'medium' ? 1 : 0.4,
                      }}
                    />
                    <span>Média</span>
                  </button>

                  {/* Botão Prioridade ALTA (Muda de cor para Laranja ao selecionar) */}
                  <button
                    type="button"
                    onClick={() => setNewPriority('high')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-800 ${
                      newPriority === 'high'
                        ? 'border-2 shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                    style={
                      newPriority === 'high'
                        ? {
                            borderColor: 'var(--color-warning)',
                            color: 'var(--color-warning)',
                          }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-warning)',
                        opacity: newPriority === 'high' ? 1 : 0.4,
                      }}
                    />
                    <span>Alta</span>
                  </button>
                </div>

                {/* Prazo de entrega opcional */}
                <div className="flex items-center gap-1.5 text-xs text-app-muted">
                  <Calendar size={14} />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    title="Data limite / Prazo"
                    className="px-2 py-1 rounded-lg border border-app text-xs bg-app-main text-app-main focus:outline-none"
                  />
                </div>
              </div>

              <span className="text-[11px] text-app-muted hidden md:inline">
                💡 Dica: Arraste os itens pelo ícone ⋮⋮ para reordenar
              </span>
            </div>
          </form>
        </section>

        {/* BARRA DE FILTROS E ORGANIZAÇÃO */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Control de Filtros */}
          <div
            className="flex p-1 rounded-xl border bg-app-card"
            style={{
              borderColor: 'var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${
                filter === 'all'
                  ? 'border-[var(--color-brand)] bg-white text-[var(--color-brand)] dark:bg-slate-800 dark:border-[var(--color-brand)] dark:text-white shadow-xs'
                  : 'border-transparent text-app-muted hover:text-app-main'
              }`}
            >
              Todas ({totalItems})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${
                filter === 'pending'
                  ? 'border-[var(--color-brand)] bg-white text-[var(--color-brand)] dark:bg-slate-800 dark:border-[var(--color-brand)] dark:text-white shadow-xs'
                  : 'border-transparent text-app-muted hover:text-app-main'
              }`}
            >
              Tarefas Pendentes ({totalItems - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${
                filter === 'completed'
                  ? 'border-[var(--color-success)] bg-white text-[var(--color-success)] dark:bg-slate-800 dark:border-[var(--color-success)] dark:text-white shadow-xs'
                  : 'border-transparent text-app-muted hover:text-app-main'
              }`}
            >
              Tarefas Concluídas ({completedCount})
            </button>
          </div>

          {/* Seletor de Ordenação e Limpeza */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-app-muted bg-app-card px-2.5 py-1.5 rounded-xl border border-app">
              <ListFilter size={14} />
              <label htmlFor="sortSelect" className="font-medium">Ordenar:</label>
              <select
                id="sortSelect"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as TaskSortMode)}
                className="bg-transparent text-app-main font-semibold text-xs focus:outline-none cursor-pointer"
              >
                <option value="custom">Minha Ordem (Arraste / Mover)</option>
                <option value="priority">Prioridade (Alta → Baixa)</option>
                <option value="pending">Tarefas Pendentes Primeiro</option>
                <option value="newest">Mais Recentes</option>
                <option value="alphabetical">Alfabética (A-Z)</option>
              </select>
            </div>

            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleClearCompleted}
                title="Remover todas as tarefas já concluídas"
                className="px-3 py-1.5 text-xs font-semibold text-app-muted hover:text-red-500 rounded-xl border border-app bg-app-card transition-colors cursor-pointer"
              >
                Limpar Tarefas Concluídas
              </button>
            )}
          </div>
        </div>

        {/* LISTA DE TAREFAS COM DRAG AND DROP */}
        <section className="space-y-2.5">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task, index) => {
              const currentPriority = task.priority || (task.isUrgent ? 'high' : 'medium');
              const isDragging = draggedTaskId === task.id;
              const isDragOver = dragOverTaskId === task.id;

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDragLeave={() => handleDragLeave(task.id)}
                  onDrop={(e) => handleDrop(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`group rounded-xl border p-3.5 sm:p-4 bg-app-card transition-all duration-150 flex items-center justify-between gap-3 select-none ${
                    task.completed ? 'opacity-70' : ''
                  } ${
                    isDragging
                      ? 'opacity-40 scale-[0.98] border-dashed border-[var(--color-brand)] bg-teal-50/20'
                      : ''
                  } ${
                    isDragOver
                      ? 'border-t-2 border-[var(--color-brand)] shadow-md translate-y-0.5'
                      : ''
                  }`}
                  style={{ borderColor: isDragOver ? 'var(--color-brand)' : 'var(--border-color)' }}
                >
                  {/* Lado Esquerdo: Handle Drag & Drop + Checkbox + Conteúdo */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    {/* Alça Drag & Drop (Grip) */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-slate-300 dark:text-slate-600 hover:text-[var(--color-brand)] transition-colors shrink-0"
                      title="Clique e arraste para reordenar"
                    >
                      <GripVertical size={16} />
                    </div>

                    {/* Botão de Checkbox Personalizado: apenas borda verde e check */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      aria-label={task.completed ? 'Desmarcar tarefa' : 'Marcar tarefa como concluída'}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'border-[var(--color-success)] bg-white dark:bg-emerald-500/20 text-[var(--color-success)] shadow-xs'
                          : 'border-slate-300 dark:border-slate-600 bg-app-main hover:border-[var(--color-brand)]'
                      }`}
                    >
                      {task.completed && <Check size={16} strokeWidth={3} />}
                    </button>

                    {/* Conteúdo textual da tarefa */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          onClick={() => handleToggleTask(task.id)}
                          className={`text-sm font-semibold transition-all cursor-pointer ${
                            task.completed
                              ? 'line-through text-app-muted font-normal'
                              : 'text-app-main'
                          }`}
                        >
                          {task.title}
                        </p>

                        {/* Badge de Prioridade Interativo: muda de cor ao clicar para alternar */}
                        <div
                          onClick={() => handleCyclePriority(task)}
                          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                          title="Clique para alternar entre Baixa, Média e Alta"
                        >
                          {renderPriorityBadge(currentPriority)}
                        </div>
                      </div>

                      {/* Metadados: Prazo e Notas */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-app-muted">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={12} />
                            Prazo: {task.dueDate.split('-').reverse().join('/')}
                          </span>
                        )}
                        {task.note && (
                          <span className="truncate max-w-xs">· {task.note}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Ações (Subir/Descer rápido, Editar via Modal, Deletar) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Botões de Organizar (Subir / Descer) acessíveis */}
                    {sortMode === 'custom' && (
                      <div className="hidden sm:flex items-center mr-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Mover para cima"
                          aria-label="Mover para cima"
                          className="p-1 rounded text-app-muted hover:text-app-main disabled:opacity-20 disabled:hover:text-app-muted cursor-pointer transition-colors"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === sortedTasks.length - 1}
                          title="Mover para baixo"
                          aria-label="Mover para baixo"
                          className="p-1 rounded text-app-muted hover:text-app-main disabled:opacity-20 disabled:hover:text-app-muted cursor-pointer transition-colors"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    )}

                    {/* Botão de Editar Tarefa (ABRE O MODAL) */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(task)}
                      title="Editar tarefa (abrir modal)"
                      aria-label={`Editar tarefa ${task.title}`}
                      className="p-1.5 rounded-lg text-app-muted hover:text-app-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Botão de Deletar Tarefa */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Excluir tarefa da lista"
                      aria-label={`Excluir tarefa ${task.title}`}
                      className="p-1.5 rounded-lg text-app-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            /* Estado quando não há itens */
            <div
              className="rounded-2xl border p-10 text-center bg-app-card flex flex-col items-center justify-center"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--color-brand)',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-app-main">
                {filter === 'completed'
                  ? 'Nenhuma tarefa concluída ainda'
                  : filter === 'pending'
                  ? 'Nenhuma tarefa pendente! Tudo em dia.'
                  : 'Sua lista está vazia'}
              </h3>
              <p className="text-xs text-app-muted mt-1 max-w-xs">
                {filter === 'all'
                  ? 'Digite o nome de uma tarefa acima e clique em Adicionar.'
                  : 'Alterne os filtros acima para ver todas as tarefas da lista.'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE EDIÇÃO DE TAREFA */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEditedTask}
      />
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Tela 2: Visão Geral de Todas as Listas
 * Apresenta todas as listas criadas, métricas de produtividade,
 * opção de criar novas listas com ícones e exclusão de listas existentes.
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  LogOut, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FolderPlus,
  HelpCircle
} from 'lucide-react';
import { User, TaskList } from '../types.ts';
import { TasklyLogo } from './TasklyLogo.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { CategoryIcon } from './CategoryIcon.tsx';
import { CreateListModal } from './CreateListModal.tsx';

interface ListsOverviewScreenProps {
  user: User;
  lists: TaskList[];
  onSelectList: (listId: string) => void;
  onCreateList: (newList: TaskList) => void;
  onDeleteList: (listId: string) => void;
  onLogout: () => void;
}

export const ListsOverviewScreen: React.FC<ListsOverviewScreenProps> = ({
  user,
  lists,
  onSelectList,
  onCreateList,
  onDeleteList,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<TaskList | null>(null);

  // Filtra as listas com base no termo de busca
  const filteredLists = lists.filter((list) =>
    list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (list.categoryName && list.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cálculos globais de métricas de tarefas
  const totalTasks = lists.reduce((acc, l) => acc + l.tasks.length, 0);
  const completedTasks = lists.reduce(
    (acc, l) => acc + l.tasks.filter((t) => t.completed).length,
    0
  );
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = lists.reduce(
    (acc, l) => acc + l.tasks.filter((t) => !t.completed && (t.priority === 'high' || t.isUrgent)).length,
    0
  );
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-app-main transition-colors duration-300">
      {/* 1. TOPO DA APLICAÇÃO */}
      <header
        className="w-full border-b sticky top-0 z-30 bg-app-card/95 backdrop-blur-md transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logotipo Taskly em SVG */}
          <TasklyLogo size="sm" />

          {/* Área do Usuário, Tema e Logout */}
          <div className="flex items-center gap-3">
            {/* Identificação do Usuário */}
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-app object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono"
                  style={{
                    backgroundColor: 'rgba(13, 148, 136, 0.12)',
                    color: 'var(--color-brand)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-app-main truncate max-w-[160px]">
                  {user.name}
                </span>
                <span className="text-[11px] text-app-muted truncate max-w-[160px]">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Botão de Tema Discreto (Sol/Lua que manipula classe .dark no body) */}
            <ThemeToggle />

            {/* Botão de Sair */}
            <button
              type="button"
              onClick={onLogout}
              title="Encerrar sessão"
              aria-label="Sair da conta"
              className="p-2 rounded-xl border border-app text-app-muted hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Painel de Boas-Vindas e Resumo de Produtividade */}
        <section
          className="rounded-2xl border p-5 sm:p-6 bg-app-card shadow-sm transition-all"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--color-brand)' }}>
                  Painel de Controle
                </span>
                <span className="text-app-muted">·</span>
                <span className="text-xs text-app-muted">Organização Pessoal & Profissional</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-app-main mt-1 tracking-tight">
                Olá, {user.name.split(' ')[0]}! Suas Listas Ativas
              </h1>
              <p className="text-xs sm:text-sm text-app-muted mt-1">
                Acompanhe o andamento de projetos, tarefas, compras e rotina em tempo real.
              </p>
            </div>

            {/* Resumo Numérico Rápido */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
              <div className="p-3 rounded-xl border border-app bg-app-main text-center">
                <span className="block text-xl font-bold font-mono tabular-nums text-app-main">
                  {lists.length}
                </span>
                <span className="text-[11px] text-app-muted font-medium">Listas</span>
              </div>

              <div className="p-3 rounded-xl border border-app bg-app-main text-center">
                <span className="block text-xl font-bold font-mono tabular-nums" style={{ color: 'var(--color-warning)' }}>
                  {pendingTasks}
                </span>
                <span className="text-[11px] text-app-muted font-medium">Tarefas Pendentes</span>
              </div>

              <div className="p-3 rounded-xl border border-app bg-app-main text-center">
                <span className="block text-xl font-bold font-mono tabular-nums" style={{ color: 'var(--color-success)' }}>
                  {completedTasks}
                </span>
                <span className="text-[11px] text-app-muted font-medium">Tarefas Concluídas</span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso Global */}
          {totalTasks > 0 && (
            <div className="mt-5 pt-4 border-t border-app">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-app-muted">Progresso geral de execução</span>
                <span className="font-mono tabular-nums font-bold text-app-main">
                  {overallPercentage}% ({completedTasks}/{totalTasks} tarefas)
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${overallPercentage}%`,
                    backgroundColor: 'var(--color-brand)',
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 3. BARRA DE AÇÕES (Busca e Botão de Criar Lista) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar lista por nome ou categoria..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium bg-app-card text-app-main focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Botão de Criação de Nova Lista */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-brand px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={18} />
            <span>Nova Lista</span>
          </button>
        </div>

        {/* 4. GRID DE LISTAS */}
        {filteredLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredLists.map((list) => {
              const total = list.tasks.length;
              const done = list.tasks.filter((t) => t.completed).length;
              const highCount = list.tasks.filter((t) => !t.completed && (t.priority === 'high' || t.isUrgent)).length;
              const percent = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div
                  key={list.id}
                  onClick={() => onSelectList(list.id)}
                  className="group relative rounded-2xl border p-5 bg-app-card hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div>
                    {/* Linha Superior: Ícone da categoria, tag e botão de exclusão */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{
                            backgroundColor: 'rgba(13, 148, 136, 0.12)',
                            color: 'var(--color-brand)',
                          }}
                        >
                          <CategoryIcon type={list.icon} size={22} />
                        </div>
                        <div>
                          <span
                            className="text-[11px] font-bold tracking-wide uppercase"
                            style={{ color: 'var(--color-tag)' }}
                          >
                            {list.categoryName || 'Geral'}
                          </span>
                          <span className="block text-[11px] text-app-muted">
                            {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Botão de Deletar Lista (com parada de propagação para não abrir a lista) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setListToDelete(list);
                        }}
                        title="Excluir esta lista"
                        aria-label={`Excluir lista ${list.title}`}
                        className="p-1.5 rounded-lg text-app-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Título da Lista */}
                    <h2 className="text-base sm:text-lg font-bold text-app-main group-hover:text-[var(--color-brand)] transition-colors line-clamp-1">
                      {list.title}
                    </h2>

                    {/* Descrição opcional */}
                    {list.description && (
                      <p className="text-xs text-app-muted mt-1 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                  </div>

                  {/* Rodapé do Card com Progresso */}
                  <div className="mt-5 pt-3 border-t border-app">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-app-muted font-medium">
                        {total === 0 ? 'Sem itens ainda' : `${done} de ${total} tarefas`}
                      </span>
                      <span className="font-mono font-bold tabular-nums text-app-main">
                        {percent}%
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: percent === 100 ? 'var(--color-success)' : 'var(--color-brand)',
                        }}
                      />
                    </div>

                    {/* Indicador de prioridade alta */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      {highCount > 0 ? (
                        <div
                          className="flex items-center gap-1 font-semibold"
                          style={{ color: 'var(--color-warning)' }}
                        >
                          <AlertTriangle size={13} />
                          <span>{highCount} prioridade alta</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-app-muted">Em dia</span>
                      )}

                      <div className="flex items-center gap-1 text-app-muted group-hover:text-app-main group-hover:translate-x-0.5 transition-all font-semibold">
                        <span>Gerenciar</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Estado Vazio de Busca ou Sem Listas */
          <div
            className="rounded-2xl border p-12 text-center bg-app-card flex flex-col items-center justify-center max-w-md mx-auto"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--color-brand)',
              }}
            >
              <FolderPlus size={28} />
            </div>
            <h3 className="text-base font-bold text-app-main">
              {searchQuery ? 'Nenhuma lista encontrada' : 'Nenhuma lista cadastrada'}
            </h3>
            <p className="text-xs text-app-muted mt-1.5 max-w-xs">
              {searchQuery
                ? `Não encontramos nenhuma lista com o termo "${searchQuery}". Tente outra busca.`
                : 'Crie sua primeira lista para organizar compras, projetos, rotina ou objetivos.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-5 btn-brand px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                <span>Criar Primeira Lista</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: CRIAÇÃO DE NOVA LISTA COM ÍCONES */}
      <CreateListModal
        userId={user.id}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={(newList) => {
          onCreateList(newList);
        }}
      />

      {/* MODAL 2: CONFIRMAÇÃO DE EXCLUSÃO DE LISTA */}
      {listToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-2xl border p-6 bg-app-card shadow-2xl transition-all"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-red-500 bg-red-100 dark:bg-red-950/40"
            >
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-app-main">Excluir lista?</h3>
            <p className="text-xs text-app-muted mt-1.5 leading-relaxed">
              Você tem certeza que deseja excluir a lista <strong>"{listToDelete.title}"</strong> e todas as suas tarefas? Esta ação não pode ser desfeita.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setListToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-app-muted hover:text-app-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteList(listToDelete.id);
                  setListToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm cursor-pointer transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

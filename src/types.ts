/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Definições de Tipos e Modelos de Dados
 */

export type CategoryIconType = 
  | 'study'      // Estudos / Cursos / Leitura
  | 'market'     // Mercado / Supermercado / Compras
  | 'pharmacy'   // Farmácia / Remédios / Saúde
  | 'work'       // Trabalho / Reuniões / Projetos
  | 'finance'    // Finanças / Pagamentos / Contas
  | 'health'     // Exercícios / Academia / Bem-estar
  | 'home'       // Casa / Manutenção / Afazeres
  | 'personal'   // Metas Pessoais / Hábitos
  | 'travel'     // Viagens / Roteiros
  | 'tech';      // Tecnologia / Software / Gadgets

export type TaskPriority = 'low' | 'medium' | 'high'; // Baixa, Média, Alta

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;  // Prioridade: 'low' (Baixa), 'medium' (Média), 'high' (Alta)
  isUrgent?: boolean;      // Compatibilidade retroativa
  dueDate?: string;        // Data limite opcional
  note?: string;           // Detalhe ou observação adicional
  createdAt: number;       // Timestamp de criação
  order: number;           // Posição para reordenação manual
}

export interface TaskList {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: CategoryIconType;
  categoryName?: string;
  createdAt: number;
  tasks: TaskItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoURL?: string;
}

export type ViewScreen = 'login' | 'register' | 'lists' | 'list_detail';
export type TaskFilter = 'all' | 'pending' | 'completed';
export type TaskSortMode = 'custom' | 'priority' | 'pending' | 'newest' | 'alphabetical';

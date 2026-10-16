/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Gerenciador de Armazenamento Local e Dados Iniciais
 * Inicializa a conta de teste eu@eu.com / 1234 e fornece persistência segura.
 */

import { User, TaskList, TaskItem, TaskPriority } from '../types.ts';

const STORAGE_KEYS = {
  USERS: 'taskly_users',
  ACTIVE_USER: 'taskly_active_user',
  LISTS_PREFIX: 'taskly_lists_',
};

// Usuário padrão de testes solicitado pelo usuário
export const INITIAL_TEST_USER: User = {
  id: 'usr-default',
  name: 'Carlos Silva',
  email: 'eu@eu.com',
  password: '1234',
};

// Listas de exemplo com categorias variadas (estudo, mercado, farmácia, trabalho, etc.)
export const INITIAL_SAMPLE_LISTS: TaskList[] = [
  {
    id: 'list-work-1',
    userId: 'usr-default',
    title: 'Projetos de Trabalho & TI',
    description: 'Demandas da semana, entregas e reuniões com a equipe',
    icon: 'work',
    categoryName: 'Trabalho',
    createdAt: Date.now() - 86400000 * 2,
    tasks: [
      {
        id: 'w-1',
        title: 'Apresentar protótipo funcional para a diretoria',
        completed: false,
        priority: 'high',
        isUrgent: true,
        dueDate: '2026-10-19',
        note: 'Revisar métricas de performance antes do alinhamento',
        createdAt: Date.now() - 3600000 * 5,
        order: 1,
      },
      {
        id: 'w-2',
        title: 'Documentar endpoints da nova API REST',
        completed: true,
        priority: 'medium',
        isUrgent: false,
        dueDate: '2026-10-18',
        note: 'Gerar documentação interativa com Swagger',
        createdAt: Date.now() - 3600000 * 12,
        order: 2,
      },
      {
        id: 'w-3',
        title: 'Revisar pull requests e testes unitários pendentes',
        completed: false,
        priority: 'medium',
        isUrgent: false,
        dueDate: '2026-10-22',
        createdAt: Date.now() - 3600000 * 8,
        order: 3,
      },
      {
        id: 'w-4',
        title: 'Organizar backlog e sprints no quadro kanban',
        completed: false,
        priority: 'low',
        isUrgent: false,
        createdAt: Date.now() - 3600000 * 4,
        order: 4,
      },
    ],
  },
  {
    id: 'list-market-2',
    userId: 'usr-default',
    title: 'Supermercado da Semana',
    description: 'Itens essenciais para a despensa e refeições',
    icon: 'market',
    categoryName: 'Compras',
    createdAt: Date.now() - 86400000 * 3,
    tasks: [
      {
        id: 'm-1',
        title: 'Café em grãos 100% arábica',
        completed: true,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 10,
        order: 1,
      },
      {
        id: 'm-2',
        title: 'Leite integral e iogurte natural',
        completed: true,
        priority: 'low',
        createdAt: Date.now() - 3600000 * 9,
        order: 2,
      },
      {
        id: 'm-3',
        title: 'Ovos caipiras frescos (2 dúzias)',
        completed: false,
        priority: 'high',
        isUrgent: true,
        createdAt: Date.now() - 3600000 * 8,
        order: 3,
      },
      {
        id: 'm-4',
        title: 'Frutas da estação: banana, maçã e abacate',
        completed: false,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 7,
        order: 4,
      },
      {
        id: 'm-5',
        title: 'Azeite de oliva extra virgem e especiarias',
        completed: false,
        priority: 'low',
        createdAt: Date.now() - 3600000 * 6,
        order: 5,
      },
    ],
  },
  {
    id: 'list-pharmacy-3',
    userId: 'usr-default',
    title: 'Farmácia & Cuidados',
    description: 'Medicamentos, vitaminas e higiene diária',
    icon: 'pharmacy',
    categoryName: 'Saúde',
    createdAt: Date.now() - 86400000 * 4,
    tasks: [
      {
        id: 'p-1',
        title: 'Vitamina C com Zinco efervescente',
        completed: true,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 24,
        order: 1,
      },
      {
        id: 'p-2',
        title: 'Colírio lubrificante oftálmico para tela',
        completed: false,
        priority: 'high',
        isUrgent: true,
        dueDate: '2026-10-18',
        createdAt: Date.now() - 3600000 * 20,
        order: 2,
      },
      {
        id: 'p-3',
        title: 'Protetor solar facial toque seco FPS 50',
        completed: false,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 18,
        order: 3,
      },
      {
        id: 'p-4',
        title: 'Curativos adesivos impermeáveis',
        completed: false,
        priority: 'low',
        createdAt: Date.now() - 3600000 * 15,
        order: 4,
      },
    ],
  },
  {
    id: 'list-study-4',
    userId: 'usr-default',
    title: 'Estudos & Leitura',
    description: 'Livros, artigos técnicos e aperfeiçoamento contínuo',
    icon: 'study',
    categoryName: 'Cursos',
    createdAt: Date.now() - 86400000 * 5,
    tasks: [
      {
        id: 's-1',
        title: 'Ler artigo de Arquitetura de Software e Microsserviços',
        completed: false,
        priority: 'high',
        dueDate: '2026-10-21',
        createdAt: Date.now() - 3600000 * 14,
        order: 1,
      },
      {
        id: 's-2',
        title: 'Fazer curso de TypeScript Avançado',
        completed: true,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 10,
        order: 2,
      },
      {
        id: 's-3',
        title: 'Resumir anotações do livro de Produtividade',
        completed: false,
        priority: 'low',
        createdAt: Date.now() - 3600000 * 6,
        order: 3,
      },
    ],
  },
  {
    id: 'list-personal-5',
    userId: 'usr-default',
    title: 'Metas Pessoais & Rotina',
    description: 'Hábitos saudáveis, casa e bem-estar',
    icon: 'personal',
    categoryName: 'Hábitos',
    createdAt: Date.now() - 86400000 * 6,
    tasks: [
      {
        id: 'pe-1',
        title: 'Caminhada ou corrida matinal de 30 minutos',
        completed: true,
        priority: 'high',
        createdAt: Date.now() - 3600000 * 5,
        order: 1,
      },
      {
        id: 'pe-2',
        title: 'Organizar mesa de trabalho e arquivos digitais',
        completed: false,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 3,
        order: 2,
      },
      {
        id: 'pe-3',
        title: 'Beber ao menos 2,5 litros de água hoje',
        completed: false,
        priority: 'high',
        createdAt: Date.now() - 3600000 * 1,
        order: 3,
      },
    ],
  },
];

// Normaliza tarefas para garantir que todas possuam priority válida ('low' | 'medium' | 'high')
function normalizeTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks.map((t) => {
    let priority: TaskPriority = t.priority;
    if (!priority) {
      priority = t.isUrgent ? 'high' : 'medium';
    }
    return {
      ...t,
      priority,
      isUrgent: priority === 'high',
    };
  });
}

// Obtém a lista de usuários cadastrados
export function getRegisteredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([INITIAL_TEST_USER]));
      return [INITIAL_TEST_USER];
    }
    const users = JSON.parse(raw);
    if (!users.some((u: User) => u.email.toLowerCase() === INITIAL_TEST_USER.email.toLowerCase())) {
      users.push(INITIAL_TEST_USER);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return users;
  } catch {
    return [INITIAL_TEST_USER];
  }
}

// Salva um novo usuário
export function registerNewUser(user: User): boolean {
  try {
    const users = getRegisteredUsers();
    const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) return false;

    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

// Obtém o usuário atualmente logado
export function getActiveUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Define o usuário ativo na sessão
export function setActiveUser(user: User | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    }
  } catch {
    // Falha silenciosa
  }
}

// Obtém todas as listas do usuário
export function getUserLists(userId: string): TaskList[] {
  try {
    const key = `${STORAGE_KEYS.LISTS_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId === INITIAL_TEST_USER.id || userId === 'usr-default') {
        localStorage.setItem(key, JSON.stringify(INITIAL_SAMPLE_LISTS));
        return INITIAL_SAMPLE_LISTS;
      }
      return [];
    }
    const parsed: TaskList[] = JSON.parse(raw);
    return parsed.map((list) => ({
      ...list,
      tasks: normalizeTasks(list.tasks || []),
    }));
  } catch {
    return [];
  }
}

// Salva as listas do usuário
export function saveUserLists(userId: string, lists: TaskList[]): void {
  try {
    const key = `${STORAGE_KEYS.LISTS_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(lists));
  } catch {
    // Falha silenciosa de quota
  }
}

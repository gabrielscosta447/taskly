/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Aplicação Principal de Gerenciamento de Listas e Tarefas
 * Estrutura:
 * 1 - Tela de Login & Cadastro (com Firebase Auth e Google)
 * 2 - Tela de Verificação de E-mail Obrigatória (bloqueia acesso até validar o e-mail)
 * 3 - Tela de Visão Geral de Listas (com métricas, criação de lista com ícones e exclusão)
 * 4 - Tela de Detalhes da Lista (tarefas, reordenação drag & drop, som, prioridades dinâmicas)
 * 
 * Estilização rigorosa via CSS Variables com alternância de classes no <body> para Light/Dark mode.
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { User, TaskList, ViewScreen } from './types.ts';
import { auth, isFirebaseConfigured } from './firebaseconfig.js';
import { AuthScreen } from './components/AuthScreen.tsx';
import { EmailVerificationScreen } from './components/EmailVerificationScreen.tsx';
import { ListsOverviewScreen } from './components/ListsOverviewScreen.tsx';
import { ListDetailScreen } from './components/ListDetailScreen.tsx';
import {
  getActiveUser,
  setActiveUser,
  getUserLists,
  saveUserLists,
} from './utils/storage.ts';

export default function App() {
  // Estado do usuário autenticado no Taskly
  const [user, setUser] = useState<User | null>(() => getActiveUser());

  // Estado para usuário do Firebase que ainda não validou o e-mail
  const [unverifiedFirebaseUser, setUnverifiedFirebaseUser] = useState<FirebaseUser | null>(null);

  // Estado das listas do usuário ativo
  const [lists, setLists] = useState<TaskList[]>([]);

  // Controle de tela atual ('lists' ou 'list_detail')
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('lists');

  // ID da lista em exibição detalhada
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Monitora alterações na sessão do Firebase Auth em tempo real
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Contas do Google já vêm validadas pelo próprio Google
        const isGoogleProvider = fbUser.providerData.some((p) => p.providerId === 'google.com');
        const isVerified = fbUser.emailVerified || isGoogleProvider;

        if (isVerified) {
          const appUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
          };
          setActiveUser(appUser);
          setUser(appUser);
          setUnverifiedFirebaseUser(null);
        } else {
          // E-mail NÃO verificado: bloqueia acesso ao app e exibe a tela de confirmação
          setUnverifiedFirebaseUser(fbUser);
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Carrega as listas salvas sempre que o usuário ativo mudar
  useEffect(() => {
    if (user) {
      const storedLists = getUserLists(user.id);
      setLists(storedLists);
    } else {
      setLists([]);
      setSelectedListId(null);
      setCurrentScreen('login');
    }
  }, [user]);

  // Manipulador de sucesso de autenticação
  const handleLoginSuccess = (authenticatedUser: User) => {
    setActiveUser(authenticatedUser);
    setUser(authenticatedUser);
    setUnverifiedFirebaseUser(null);
    setCurrentScreen('lists');
  };

  // Manipulador para quando for necessária verificação de e-mail
  const handleEmailVerificationRequired = (fbUser: FirebaseUser) => {
    setUnverifiedFirebaseUser(fbUser);
    setUser(null);
  };

  // Manipulador de logout (encerramento de sessão no Firebase e local)
  const handleLogout = async () => {
    if (isFirebaseConfigured()) {
      try {
        await signOut(auth);
      } catch {
        // ignora erros de logout
      }
    }
    setActiveUser(null);
    setUser(null);
    setUnverifiedFirebaseUser(null);
    setCurrentScreen('login');
    setSelectedListId(null);
  };

  // Criação de nova lista
  const handleCreateList = (newList: TaskList) => {
    if (!user) return;
    const updated = [newList, ...lists];
    setLists(updated);
    saveUserLists(user.id, updated);
  };

  // Exclusão de lista existente
  const handleDeleteList = (listId: string) => {
    if (!user) return;
    const updated = lists.filter((l) => l.id !== listId);
    setLists(updated);
    saveUserLists(user.id, updated);

    // Se a lista excluída estava aberta, retorna para a visão geral
    if (selectedListId === listId) {
      setSelectedListId(null);
      setCurrentScreen('lists');
    }
  };

  // Atualização de uma lista existente (tarefas adicionadas, alteradas ou reordenadas)
  const handleUpdateList = (updatedList: TaskList) => {
    if (!user) return;
    const updated = lists.map((l) => (l.id === updatedList.id ? updatedList : l));
    setLists(updated);
    saveUserLists(user.id, updated);
  };

  // Abertura de uma lista para gerenciar suas tarefas
  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
    setCurrentScreen('list_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retorno à tela de visão geral das listas
  const handleBackToLists = () => {
    setSelectedListId(null);
    setCurrentScreen('lists');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // RENDERIZAÇÃO CONDICIONAL DAS TELAS PRINCIPAIS
  // =========================================================================

  // 1. TELA DE VERIFICAÇÃO OBRIGATÓRIA DE E-MAIL
  // Se o usuário fez login ou cadastro com e-mail/senha no Firebase e não validou,
  // NÃO PERMITE que prossiga no app até clicar no link do e-mail.
  if (unverifiedFirebaseUser) {
    return (
      <EmailVerificationScreen
        user={unverifiedFirebaseUser}
        onVerified={async () => {
          await unverifiedFirebaseUser.reload();
          const refreshed = auth.currentUser;
          if (refreshed && refreshed.emailVerified) {
            const appUser: User = {
              id: refreshed.uid,
              name: refreshed.displayName || refreshed.email?.split('@')[0] || 'Usuário',
              email: refreshed.email || '',
              photoURL: refreshed.photoURL || undefined,
            };
            handleLoginSuccess(appUser);
          }
        }}
        onLogout={() => {
          setUnverifiedFirebaseUser(null);
          handleLogout();
        }}
      />
    );
  }

  // 2. TELA INICIAL DE LOGIN / CADASTRO
  if (!user) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        onEmailVerificationRequired={handleEmailVerificationRequired}
      />
    );
  }

  // Encontra os dados da lista ativa quando na tela de detalhes
  const activeList = lists.find((l) => l.id === selectedListId);

  // 4. Quarta Tela: Visualização e Gestão dos Itens da Lista Selecionada
  if (currentScreen === 'list_detail' && activeList) {
    return (
      <ListDetailScreen
        list={activeList}
        onBack={handleBackToLists}
        onUpdateList={handleUpdateList}
      />
    );
  }

  // 3. Terceira Tela: Visão Geral de Todas as Listas Criadas
  return (
    <ListsOverviewScreen
      user={user}
      lists={lists}
      onSelectList={handleSelectList}
      onCreateList={handleCreateList}
      onDeleteList={handleDeleteList}
      onLogout={handleLogout}
    />
  );
}

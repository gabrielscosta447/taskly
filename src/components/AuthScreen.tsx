/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Tela 1: Autenticação (Login & Cadastro)
 * Integração com Firebase Auth (E-mail/Senha com Verificação Obrigatória e Conta Google).
 * Arquivo de configuração: firebaseconfig.js
 */

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Info,
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { User } from '../types.ts';
import { auth, googleProvider, isFirebaseConfigured } from '../firebaseconfig.js';
import { TasklyLogo } from './TasklyLogo.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
import { getRegisteredUsers, registerNewUser } from '../utils/storage.ts';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  onEmailVerificationRequired: (user: FirebaseUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onEmailVerificationRequired,
}) => {
  // Alternar entre aba 'login' e 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Campos do formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos do formulário de cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Estados de feedback e carregamento
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Tradutor amigável de erros do Firebase Auth
  const parseFirebaseError = (error: unknown): string => {
    const err = error as { code?: string; message?: string };
    const code = err?.code || '';

    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outra conta. Faça login ou utilize outro.';
      case 'auth/invalid-email':
        return 'O endereço de e-mail informado é inválido.';
      case 'auth/weak-password':
        return 'A senha é muito fraca. Ela deve conter no mínimo 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'A janela do Google foi fechada antes de completar a autenticação.';
      case 'auth/popup-blocked':
        return 'O navegador bloqueou a janela pop-up do Google. Permita pop-ups para este site.';
      case 'auth/operation-not-allowed':
        return 'Provedor de autenticação não ativado no Firebase Console. Ative em Authentication -> Sign-in method.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas consecutivas. Aguarde alguns instantes e tente novamente.';
      case 'auth/network-request-failed':
        return 'Falha de conexão com os servidores. Verifique sua conexão com a internet.';
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid':
        return 'Chave de API do Firebase inválida. Verifique o arquivo firebaseconfig.js.';
      default:
        return err?.message || 'Ocorreu um erro na autenticação. Tente novamente.';
    }
  };

  // 1. AUTENTICAÇÃO COM A CONTA DO GOOGLE
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Se o Firebase ainda estiver com as chaves padrão
    if (!isFirebaseConfigured()) {
      setErrorMessage(
        'Para autenticar com o Google, adicione suas credenciais do Firebase no arquivo "firebaseconfig.js".'
      );
      return;
    }

    setIsGoogleLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;

      const appUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário Google',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
      };

      onLoginSuccess(appUser);
    } catch (err) {
      setErrorMessage(parseFirebaseError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Preenche dados da conta de teste rápida para facilitar testes locais
  const handleAutofillTestAccount = () => {
    setLoginEmail('eu@eu.com');
    setLoginPassword('1234');
    setErrorMessage(null);
  };

  // 2. SUBMISSÃO DE LOGIN (E-MAIL E SENHA)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (!emailTrim || !passTrim) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true);

    // Se o Firebase estiver configurado, autentica via Firebase Auth
    if (isFirebaseConfigured()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailTrim, passTrim);
        const fbUser = userCredential.user;

        // REGRA CRÍTICA: Não permitir que prossiga no APP enquanto não houver validação do e-mail
        if (!fbUser.emailVerified) {
          // Bloqueia e envia para a tela de verificação
          onEmailVerificationRequired(fbUser);
          return;
        }

        // E-mail já validado: permite o acesso normalmente
        const appUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
        };

        onLoginSuccess(appUser);
      } catch (err) {
        setErrorMessage(parseFirebaseError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Fallback: Se as chaves do Firebase ainda não foram inseridas no firebaseconfig.js,
    // permite teste com a conta local pré-configurada eu@eu.com / 1234
    setTimeout(() => {
      const users = getRegisteredUsers();
      const matched = users.find(
        (u) => u.email.toLowerCase() === emailTrim && u.password === passTrim
      );

      if (matched) {
        onLoginSuccess(matched);
      } else {
        setErrorMessage(
          'Credenciais incorretas ou Firebase não configurado. Para testar sem Firebase use eu@eu.com e 1234, ou insira suas chaves em firebaseconfig.js.'
        );
      }
      setIsLoading(false);
    }, 400);
  };

  // 3. SUBMISSÃO DE CADASTRO COM ENVIO DE E-MAIL PADRÃO DO FIREBASE
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword.trim();
    const confirm = regConfirmPassword.trim();

    if (!name || !email || !password || !confirm) {
      setErrorMessage('Todos os campos são obrigatórios para o cadastro.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres para o Firebase.');
      return;
    }

    if (password !== confirm) {
      setErrorMessage('A senha e a confirmação de senha não coincidem.');
      return;
    }

    setIsLoading(true);

    // Se o Firebase estiver configurado, cria conta no Firebase e envia e-mail de verificação
    if (isFirebaseConfigured()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Atualiza o nome de exibição no Firebase Auth
        await updateProfile(fbUser, { displayName: name });

        // SISTEMA DE ENVIO DE E-MAIL PADRÃO DO FIREBASE
        await sendEmailVerification(fbUser);

        // Bloqueia acesso ao app e redireciona para a tela de verificação
        onEmailVerificationRequired(fbUser);
      } catch (err) {
        setErrorMessage(parseFirebaseError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Fallback: Modo local caso as credenciais do Firebase ainda não estejam no firebaseconfig.js
    setTimeout(() => {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        password,
      };

      const success = registerNewUser(newUser);
      if (!success) {
        setErrorMessage('Este e-mail já está cadastrado localmente. Tente fazer login.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(newUser);
      setIsLoading(false);
    }, 400);
  };

  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-app-main transition-colors duration-300">
      {/* Barra superior com logotipo e alternador de tema */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <TasklyLogo size="md" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Conteúdo Central: Card de Autenticação */}
      <main className="flex-1 flex items-center justify-center py-4">
        <div
          className="w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-xl transition-all duration-300 bg-app-card"
          style={{
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Alerta de Status da Configuração do Firebase */}
          {!firebaseReady ? (
            <div
              className="mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/40"
            >
              <Info size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold">Arquivo <code className="font-mono">firebaseconfig.js</code> criado!</p>
                <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                  Insira suas credenciais do Firebase no arquivo <code className="font-mono font-semibold">firebaseconfig.js</code> para ativar a validação de e-mail e login do Google. Enquanto isso, o acesso de teste abaixo está liberado.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="mb-5 py-2 px-3 rounded-xl border text-[11px] font-semibold flex items-center justify-between bg-teal-50/60 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/40"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>Firebase Auth Ativo & Conectado</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-75">Online</span>
            </div>
          )}

          {/* Alternador de Abas (Login / Cadastro) */}
          <div
            className="flex p-1 rounded-xl mb-5 border"
            style={{
              backgroundColor: 'var(--bg-main)',
              borderColor: 'var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                mode === 'login'
                  ? 'border-2 border-[var(--color-brand)] bg-white text-[var(--color-brand)] dark:bg-slate-800 dark:text-white dark:border-[var(--color-brand)] shadow-xs'
                  : 'border-2 border-transparent text-app-muted hover:text-app-main'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                mode === 'register'
                  ? 'border-2 border-[var(--color-brand)] bg-white text-[var(--color-brand)] dark:bg-slate-800 dark:text-white dark:border-[var(--color-brand)] shadow-xs'
                  : 'border-2 border-transparent text-app-muted hover:text-app-main'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* BOTÃO OFICIAL DE LOGIN COM A CONTA DO GOOGLE */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-3 transition-all cursor-pointer bg-white dark:bg-slate-800 text-app-main hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs disabled:opacity-60"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {isGoogleLoading ? (
                <Loader2 size={18} className="animate-spin text-[var(--color-brand)]" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isGoogleLoading
                  ? 'Conectando ao Google...'
                  : mode === 'login'
                  ? 'Entrar com a conta do Google'
                  : 'Cadastrar com a conta do Google'}
              </span>
            </button>

            {/* Separador visual */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-app" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                <span className="px-3 bg-app-card text-app-muted">ou continue com e-mail</span>
              </div>
            </div>
          </div>

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div
              className="mb-4 p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold border"
              style={{
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                borderColor: 'var(--color-warning)',
                color: 'var(--color-warning)',
              }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              className="mb-4 p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold border"
              style={{
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                borderColor: 'var(--color-success)',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORMULÁRIO 1: LOGIN (E-MAIL E SENHA) */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-app-muted">
                  E-mail de acesso
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-app-card text-app-main focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-app-muted">
                    Sua Senha
                  </label>
                  {!firebaseReady && (
                    <span className="text-[11px] text-app-muted">
                      Teste: <strong className="font-mono text-app-main">1234</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
                  />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-app-card text-app-main focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              {/* Botão Principal de Login */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 btn-brand shadow-md cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verificando credenciais...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar o Taskly</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Card de Destaque: Conta de Teste Inicial */}
              {!firebaseReady && (
                <div
                  className="mt-6 p-3.5 rounded-xl border transition-all text-left"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} style={{ color: 'var(--color-tag)' }} />
                      <span className="text-xs font-bold text-app-main">Acesso Rápido de Teste</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutofillTestAccount}
                      className="text-xs font-semibold hover:underline cursor-pointer"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      Preencher rápido
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-app-muted flex flex-col gap-0.5">
                    <span>
                      E-mail: <code className="font-mono font-bold text-app-main">eu@eu.com</code>
                    </span>
                    <span>
                      Senha: <code className="font-mono font-bold text-app-main">1234</code>
                    </span>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* FORMULÁRIO 2: CADASTRO DE NOVO USUÁRIO COM ENVIO DE E-MAIL FIREBASE */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-app-muted">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Maria"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-app-card text-app-main focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-app-muted">
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-app-card text-app-main focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-app-muted">
                  Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
                  />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Crie sua senha segura"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-app-card text-app-main focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-app-muted">
                  Confirmação de Senha
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none"
                  />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-app-card text-app-main focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              {/* Botão de Criação de Conta */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 btn-brand shadow-md cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enviando confirmação...</span>
                  </>
                ) : (
                  <>
                    <span>Cadastrar e Verificar E-mail</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-app-muted mt-2">
                ✉️ Um e-mail de ativação será enviado pelo Firebase para validar sua conta.
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Rodapé institucional */}
      <footer className="text-center py-4 text-xs text-app-muted">
        <p>
          Taskly &copy; {new Date().getFullYear()} &mdash; Organizador com Autenticação Firebase Auth
        </p>
      </footer>
    </div>
  );
};

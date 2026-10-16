/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Tela de Verificação Obrigatória de E-mail (Firebase Auth)
 * Impede que o usuário acesse o aplicativo até que confirme o link recebido por e-mail.
 */

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, RefreshCw, Send, LogOut, AlertCircle, ExternalLink } from 'lucide-react';
import { sendEmailVerification, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebaseconfig.js';
import { TasklyLogo } from './TasklyLogo.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';

interface EmailVerificationScreenProps {
  user: FirebaseUser;
  onVerified: () => void;
  onLogout: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  user,
  onVerified,
  onLogout,
}) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Controle de contagem regressiva para reenviar
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Função para verificar se o usuário já validou o link
  const handleCheckVerification = async () => {
    setChecking(true);
    setFeedback(null);
    try {
      // Recarrega os dados do usuário a partir do servidor do Firebase
      await auth.currentUser?.reload();
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.emailVerified) {
        setFeedback({
          type: 'success',
          message: 'E-mail validado com sucesso! Redirecionando para suas listas...',
        });
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: 'Seu e-mail ainda não foi validado. Por favor, clique no link de ativação enviado para sua caixa de entrada e tente novamente.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Não foi possível verificar o status agora. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setChecking(false);
    }
  };

  // Função para reenviar o e-mail de verificação padrão do Firebase
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setFeedback(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setFeedback({
          type: 'success',
          message: 'Novo e-mail de verificação enviado! Confira sua caixa de entrada e a pasta de spam.',
        });
        setResendCooldown(60); // 60 segundos de cooldown
      } else {
        setFeedback({
          type: 'error',
          message: 'Sessão expirada. Por favor, faça login novamente.',
        });
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'auth/too-many-requests') {
        setFeedback({
          type: 'error',
          message: 'Muitas solicitações recentes. Aguarde um minuto antes de solicitar novamente.',
        });
        setResendCooldown(60);
      } else {
        setFeedback({
          type: 'error',
          message: 'Erro ao enviar e-mail. Tente novamente em alguns instantes.',
        });
      }
    } finally {
      setResending(false);
    }
  };

  // Deslogar
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } finally {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-app-main transition-colors duration-300">
      {/* Topo com Logo e Theme Toggle */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <TasklyLogo size="md" />
        <ThemeToggle />
      </header>

      {/* Card Central de Verificação de E-mail */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div
          className="w-full max-w-lg rounded-2xl border p-6 sm:p-8 shadow-xl bg-app-card text-center transition-all animate-in fade-in"
          style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
        >
          {/* Ícone de Envelope com Efeito de Destaque */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md"
              style={{
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                color: 'var(--color-brand)',
                borderColor: 'var(--border-color)',
              }}
            >
              <Mail size={38} className="animate-pulse" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-800"
              style={{ backgroundColor: 'var(--color-warning)' }}
              title="Aguardando confirmação"
            >
              <AlertCircle size={16} />
            </div>
          </div>

          {/* Título & Mensagem */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-app-main tracking-tight mb-2">
            Verifique seu E-mail
          </h1>
          <p className="text-sm text-app-muted max-w-md mx-auto leading-relaxed">
            Para garantir a segurança da sua conta no <strong>Taskly</strong>, enviamos um link de confirmação para:
          </p>

          {/* Endereço de e-mail do usuário em destaque */}
          <div
            className="my-4 py-2.5 px-4 rounded-xl border font-mono text-sm font-bold inline-block max-w-full truncate bg-white dark:bg-slate-800"
            style={{
              borderColor: 'var(--color-brand)',
              color: 'var(--color-brand)',
            }}
          >
            {user.email}
          </div>

          {/* Mensagens de Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold mb-5 flex items-start gap-2.5 text-left border ${
                feedback.type === 'success'
                  ? 'border-[var(--color-success)] text-[var(--color-success)] bg-white dark:bg-emerald-950/20'
                  : 'border-[var(--color-warning)] text-[var(--color-warning)] bg-white dark:bg-orange-950/20'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Passo a passo rápido */}
          <div
            className="p-4 rounded-xl border text-left text-xs space-y-2 mb-6 bg-app-main"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="font-bold text-app-main flex items-center gap-1.5">
              <span>Como ativar sua conta:</span>
            </div>
            <ol className="list-decimal list-inside text-app-muted space-y-1 pl-1">
              <li>Abra o e-mail enviado pelo Firebase em sua caixa de entrada.</li>
              <li>Procure também na pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.</li>
              <li>Clique no link de confirmação contido na mensagem.</li>
              <li>Retorne a esta tela e clique em <strong>"Já validei meu e-mail"</strong>.</li>
            </ol>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            {/* Botão Principal: Confirmar */}
            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 btn-brand shadow-md cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={17} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Verificando com o Firebase...' : 'Já validei meu e-mail'}</span>
            </button>

            {/* Botão Secundário: Reenviar e-mail de validação */}
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resending || resendCooldown > 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-app-main hover:border-teal-600 transition-all cursor-pointer disabled:opacity-50"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Send size={14} />
              <span>
                {resendCooldown > 0
                  ? `Aguarde ${resendCooldown}s para reenviar`
                  : resending
                  ? 'Enviando e-mail...'
                  : 'Reenviar e-mail de confirmação'}
              </span>
            </button>

            {/* Opção para Sair e tentar outra conta */}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-app-muted hover:text-red-500 flex items-center justify-center gap-1.5 mx-auto pt-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sair ou entrar com outra conta</span>
            </button>
          </div>
        </div>
      </main>

      {/* Rodapé sutil */}
      <footer className="text-center text-xs text-app-muted pt-4">
        Taskly · Autenticação Segura via Firebase Auth & Proteção de Contas
      </footer>
    </div>
  );
};

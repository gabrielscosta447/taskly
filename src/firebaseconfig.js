
      /**
       * @license
       * SPDX-License-Identifier: Apache-2.0
       *
       * TASKLY - Configuração do Firebase Auth
       * Arquivo: firebaseconfig.js
       */

      import { initializeApp, getApps, getApp } from 'firebase/app';
      import { getAuth, GoogleAuthProvider } from 'firebase/auth';

      // Configuração carregada do arquivo .env
      export const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      // Verifica se as configurações obrigatórias estão preenchidas
      export const isFirebaseConfigured = () => {
        return Boolean(
          firebaseConfig.apiKey &&
          firebaseConfig.authDomain &&
          firebaseConfig.projectId &&
          firebaseConfig.appId
        );
      };

      // Inicializa o Firebase apenas se ainda não existir uma instância
      export const app = getApps().length
        ? getApp()
        : initializeApp(firebaseConfig);

      // Instância do Firebase Authentication
      export const auth = getAuth(app);

      // Provedor de autenticação com Google
      export const googleProvider = new GoogleAuthProvider();

      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });

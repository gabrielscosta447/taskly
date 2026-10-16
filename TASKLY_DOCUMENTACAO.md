# Taskly — Documentação e Guia de Execução

Bem-vindo à documentação oficial do **Taskly**, um aplicativo web moderno, intuitivo e responsivo desenvolvido para organizar projetos profissionais, tarefas diárias, compras de supermercado, farmácia, estudos e metas pessoais com alta eficiência.

---

## 1. Identidade Visual e Logotipo em SVG

O **Taskly** possui um logotipo vetorial exclusivo desenvolvido em SVG puro:
- **Símbolo**: Base com gradiente nos tons Teal (`#0D9488`), Verde Escuro (`#0F766E`) e Azul Royal (`#2563EB`), combinada com traços sutis de checklist e um dinâmico checkmark em Verde Vivo (`#16A34A`) com relevo e sombra projetada.
- **Arquivos**:
  - `/public/taskly-logo.svg`: Arquivo vetorial estático usado como ícone de aba (favicon) e insumos da marca.
  - `/src/components/TasklyLogo.tsx`: Componente React/SVG interativo e responsivo (`sm`, `md`, `lg`, `xl`), integrado à tipografia *Plus Jakarta Sans*.

---

## 2. Paleta de Cores e Variáveis CSS (Custom Properties - Estilo Slate & Teal)

O aplicativo é rigorosamente estilizado utilizando as **CSS Variables** espelhadas:

```css
/* Cores Estáticas (Comuns a ambos os modos) */
--color-brand: #0D9488;     /* Teal / Verde-esmeralda escuro para botões principais e marca */
--color-warning: #EA580C;   /* Laranja Coral para prazos e tarefas urgentes */
--color-success: #16A34A;   /* Verde Vivo para tarefas finalizadas e checks */
--color-tag: #2563EB;       /* Azul Royal para tags, categorias e matérias */

/* ☀️ 1. Configuração do Modo Claro (Padrão - Light Mode) */
--bg-main: #F8FAFC;         /* Fundo da tela (Cinza ardósia muito claro) */
--bg-card: #FFFFFF;         /* Fundo dos blocos, cards e inputs (Branco puro) */
--text-main: #1E293B;       /* Texto principal (Azul escuro profundo) */
--text-muted: #64748B;      /* Subtextos e prazos secundários (Cinza médio) */
--border-color: #E2E8F0;    /* Divisores e bordas sutis (Cinza claro) */

/* 🌙 2. Configuração do Modo Escuro (Acionado via classe .dark no body) */
--bg-main: #0F172A;         /* Fundo da tela (Slate escuro profundo) */
--bg-card: #1E293B;         /* Fundo dos blocos, cards e inputs (Cinza azulado escuro) */
--text-main: #F8FAFC;       /* Texto principal (Branco gelo / Slate suave) */
--text-muted: #94A3B8;      /* Subtextos e prazos secundários (Cinza claro fosco) */
--border-color: #334155;    /* Divisores e bordas sutis (Cinza grafite) */
```

### Alternância de Tema (Light / Dark) & Estilo de Seleção
- Implementada no componente `ThemeToggle.tsx`.
- O clique no botão discreto com ícone sol (☀️) / lua (🌙) manipula diretamente a classe `.dark` na tag `<body>` (`document.body.classList.toggle('dark')`).
- **Seleção Outline no Modo Light**: Conforme solicitado, no modo claro as caixas selecionadas (checkboxes de tarefas, seletores de prioridade e categorias) não recebem preenchimento pesado com fundo sólido; em vez disso, mantêm fundo limpo e recebem a **borda colorida de 2px** (`border-2`) com o ícone/texto da respectiva cor (Verde Esmeralda para tarefas concluídas, Laranja para Alta, Roxo para Média e Ciano para Baixa).
- Transição fluida de cores com `cubic-bezier(0.16, 1, 0.3, 1)`.
- Persistência automática da preferência do usuário via `localStorage`.

---

## 3. Estrutura e Novas Funcionalidades das Telas

### Tela 1: Autenticação com Firebase Auth & Google (`firebaseconfig.js`)
- **Autenticação Oficial do Firebase**:
  - Arquivo de configuração: `firebaseconfig.js` (presente na raiz e em `/src/firebaseconfig.js` para fácil edição).
  - Suporte completo a **E-mail/Senha** e **Conta Google** (`GoogleAuthProvider` com pop-up moderno).
- **Botão Oficial de Login com o Google**:
  - Permite login instantâneo com 1 clique utilizando a conta do Google (`signInWithPopup`).
- **Verificação de E-mail Padrão do Firebase Obrigatória (`EmailVerificationScreen.tsx`)**:
  - No cadastro ou login via E-mail e Senha, o sistema dispara o e-mail de ativação oficial do Firebase (`sendEmailVerification`).
  - **Bloqueio de Acesso**: O usuário **não pode avançar para o aplicativo** enquanto não validar seu e-mail (`emailVerified === true`).
  - Tela dedicada com passo a passo, reenvio com proteção contra spam (cooldown de 60s), e verificação em tempo real (`auth.currentUser.reload()`).
- **Acesso Local de Teste**:
  - Caso o arquivo `firebaseconfig.js` ainda esteja com as chaves padrão, a tela exibe instruções claras e mantém o acesso à conta demo rápida `eu@eu.com` / `1234`.

### Tela 2: Visão Geral de Todas as Listas
- **Painel de Resumo e Métricas**:
  - Indicador de listas ativas, tarefas pendentes, tarefas concluídas, contador de tarefas com prioridade alta e barra de progresso geral.
- **Categorização Visual com Ícones Simples**:
  - Modal de criação de lista com seletor de ícones:
    - 💼 **Trabalho** (Projetos, reuniões e entregas)
    - 🛒 **Mercado** (Supermercado, feira e compras)
    - 💊 **Farmácia** (Medicamentos, vitaminas e saúde)
    - 📚 **Estudo** (Cursos, livros e aperfeiçoamento)
    - 💰 **Finanças** (Contas, boletos e orçamento)
    - 🏃 **Saúde & Fitness** (Treinos, bem-estar e consultas)
    - 🏠 **Casa** (Afazeres domésticos e manutenção)
    - 🎯 **Pessoal** (Metas e hábitos)
    - ✈️ **Viagem** (Roteiros e passagens)
    - 💻 **Tecnologia** (Desenvolvimento e setup)
  - **Exclusão Segura**: Modal de confirmação para prevenir exclusões acidentais.

### Tela 3: Visualização e Gestão Detalhada da Lista
- **Sistema de Prioridades de 3 Níveis**:
  - **Alta**: Destaque com `--color-warning` (`#EA580C`) e ícone de alerta.
  - **Média**: Destaque com `--color-brand` (`#0D9488`).
  - **Baixa**: Destaque com `--color-tag` (`#2563EB`).
  - Selecionável durante a criação rápida da tarefa e ajustável a qualquer momento.
- **Modal de Edição Completa (`EditTaskModal.tsx`)**:
  - Ao clicar no ícone de lápis ou no badge de prioridade, um modal abre com backdrop suave.
  - Permite alterar: **Título da Tarefa**, **Nível de Prioridade** (Baixa, Média ou Alta com botões interativos), **Prazo de Conclusão** e **Observações/Notas**.
  - Suporte ao atalho de teclado `Esc` para fechar.
- **Reordenação Inteligente com Drag and Drop (Arrastar e Soltar)**:
  - Cada item da lista possui uma alça vetorial `GripVertical` (⋮⋮) que permite **arrastar e soltar** para qualquer posição desejada na lista, com linha de indicação e animação visual suave.
  - Botões complementares de subir (↑) e descer (↓) permanecem disponíveis para máxima acessibilidade.
- **Mudança Dinâmica de Cores nas Prioridades**:
  - Tanto na barra de adição rápida quanto no modal de edição, selecionar uma prioridade altera a borda, texto e indicador imediatamente para a cor correspondente:
    - **Baixa**: Azul Royal (`--color-tag: #2563EB`)
    - **Média**: Teal / Verde-esmeralda (`--color-brand: #0D9488`)
    - **Alta**: Laranja Coral (`--color-warning: #EA580C`)
  - No card de cada tarefa, clicar diretamente no badge de prioridade alterna em tempo real entre Baixa, Média e Alta com feedback instantâneo de cor.
- **Ordenação por Prioridade e Filtros**:
  - Filtros: *Todas*, *Tarefas Pendentes* e *Tarefas Concluídas*.
  - Seletor de ordenação: *Minha Ordem (Arraste / Mover)*, *Prioridade (Alta → Baixa)*, *Tarefas Pendentes Primeiro*, *Mais Recentes* e *Alfabética (A-Z)*.
- **Checklist com Efeito Sonoro**:
  - Ao marcar tarefas, um áudio sintético relaxante é emitido pela Web Audio API nativa.

---

## 4. Arquitetura Técnica e Arquivos

```text
/
├── public/
│   └── taskly-logo.svg           # Logotipo SVG isolado
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx        # Tela 1: Login e Cadastro com Login Automático
│   │   ├── CategoryIcon.tsx      # Catálogo de ícones para as categorias
│   │   ├── CreateListModal.tsx   # Modal de criação de lista com seletor de ícones
│   │   ├── EditTaskModal.tsx     # Modal de edição completa de tarefa e prioridades
│   │   ├── ListDetailScreen.tsx  # Tela 3: Gerenciamento detalhado de tarefas
│   │   ├── ListsOverviewScreen.tsx # Tela 2: Visão geral das listas e métricas
│   │   ├── TasklyLogo.tsx        # Logotipo SVG vetorial em componente
│   │   └── ThemeToggle.tsx       # Alternador do modo Light / Dark na tag <body>
│   ├── utils/
│   │   ├── audio.ts              # Sintetizador Web Audio API para feedback sonoro
│   │   └── storage.ts            # Persistência localStorage e dados eu@eu.com
│   ├── types.ts                  # Definições completas TypeScript (TaskPriority, etc.)
│   ├── App.tsx                   # Roteamento e estado reativo principal
│   ├── index.css                 # CSS Variables, tema Light/Dark e utilitários
│   └── main.tsx                  # Ponto de entrada React
├── index.html                    # Documento HTML com metatags e Google Fonts
├── metadata.json                 # Metadados do applet
└── TASKLY_DOCUMENTACAO.md        # Documentação detalhada de execução
```

---

## 5. Como Executar e Testar as Novas Funcionalidades

1. **Conta de Teste ou Novo Cadastro**:
   - Faça login com `eu@eu.com` / `1234` usando o botão *"Preencher rápido"*, **OU** clique na aba *"Criar Conta"*, preencha seus dados e note que ao submeter o cadastro você já entra logado diretamente no aplicativo.
2. **Prioridades (Baixa, Média e Alta)**:
   - Abra qualquer lista (ex: "Projetos de Trabalho & TI" ou "Supermercado da Semana").
   - No topo, selecione a prioridade desejada antes de adicionar a tarefa.
   - Veja o badge colorido correspondente em cada tarefa (Laranja para Alta, Roxo para Média, Ciano para Baixa).
3. **Modal de Edição**:
   - Clique no ícone de lápis em qualquer tarefa. O modal se abrirá para editar o texto, alterar a prioridade e definir notas ou data limite.
4. **Ordenação por Prioridade**:
   - No menu suspenso *"Ordenar:"*, selecione *"Prioridade (Alta → Baixa)"* para reorganizar instantaneamente todas as tarefas.
5. **Tema Claro / Escuro**:
   - Alterne o modo a qualquer instante no ícone de sol/lua no topo para verificar a fluidez das variáveis CSS.

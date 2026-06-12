# Gerador de O.S — Plataforma operacional MZ NET

Plataforma de apoio operacional para o suporte técnico da **MZ NET**. O sistema
nasceu como um gerador de Ordens de Serviço (padronização de textos/protocolos),
mas evoluiu para uma plataforma usada diariamente pela equipe: hub de demandas do
suporte, chamados internos (estilo GLPI), escala de trabalho, registro de
upgrades, agenda de visitas técnicas, gestão de condomínios, avisos e
administração de usuários.

> **Produção:** https://gerador-de-os-3ba02.web.app
> **Projeto Firebase:** `gerador-de-os-3ba02` (região das functions: `southamerica-east1`)

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Configuração de ambiente](#configuração-de-ambiente)
- [Rodando localmente](#rodando-localmente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Módulos da plataforma](#módulos-da-plataforma)
- [Modelo de acesso (setores, hierarquia e papéis)](#modelo-de-acesso-setores-hierarquia-e-papéis)
- [Backend (Firebase)](#backend-firebase)
- [Notificações (sininho)](#notificações-sininho)
- [Deploy](#deploy)
- [Testes e qualidade](#testes-e-qualidade)
- [Pasta `legado-exemplo`](#pasta-legado-exemplo)
- [Convenções](#convenções)

---

## Visão geral

A aplicação é um SPA em React + TypeScript, servido pelo Firebase Hosting, com
backend serverless no Firebase (Authentication, Cloud Firestore, Storage e Cloud
Functions). Todo o conteúdo fica atrás de autenticação por e-mail/senha; o acesso
a cada módulo é controlado por setor, hierarquia e papéis especiais.

## Stack

**Frontend (`web/`)**

- React 19 + TypeScript + Vite
- Material UI (MUI) v9 + Emotion
- React Router v7
- Lucide React (ícones) e MUI Icons
- Recharts (gráficos), jsPDF (geração de PDF)
- `xlsx` (importação de planilhas), `react-easy-crop` (recorte de foto de perfil)
- `date-fns` / `dayjs` / `@mui/x-date-pickers`

**Backend (`functions/`)**

- Cloud Functions (2ª geração, Node.js 20)
- `firebase-admin` + `firebase-functions`

**Infra / Firebase**

- Authentication (e-mail e senha)
- Cloud Firestore (regras em `firestore.rules`, índices em `firestore.indexes.json`)
- Storage (regras em `storage.rules`)
- Hosting (SPA com rewrites para as callable functions)

**Qualidade**

- ESLint + Prettier
- Vitest + Testing Library (unit)
- Playwright (e2e)

## Estrutura do repositório

```
gerador-os/
├─ web/                     # Aplicação React (frontend)
│  ├─ src/
│  │  ├─ pages/             # Telas (Home, Suporte, Chamados, Agenda, ...)
│  │  ├─ components/        # AppLayout, RequireAuth, guards de acesso, etc.
│  │  ├─ contexts/          # AuthContext, ColorModeContext, tema
│  │  ├─ hooks/             # useNotices, useHelpdeskNotifications, ...
│  │  ├─ lib/               # Firebase + acesso a Firestore por domínio
│  │  ├─ data/              # Modelos/textos das O.S (suporte, mudEnd, ...)
│  │  ├─ types/             # Tipos de domínio (profile, ticket, agenda, ...)
│  │  └─ config/            # navItems e configuração de navegação
│  └─ public/               # Assets estáticos (ilustrações, seeds)
├─ functions/               # Cloud Functions (gestão de usuários, contadores)
├─ scripts/                 # Scripts utilitários (inventário de legados)
├─ legado-exemplo/          # HTML/legado de referência para a refatoração das O.S
├─ firebase.json            # Hosting, Functions, Firestore, Storage, emuladores
├─ firestore.rules          # Regras de segurança do Firestore
├─ firestore.indexes.json   # Índices compostos
├─ storage.rules            # Regras do Storage
└─ package.json             # Scripts de orquestração (raiz)
```

## Pré-requisitos

- **Node.js 20** (mesma versão usada pelas Cloud Functions)
- npm
- Firebase CLI (já incluso como devDependency: `npx firebase ...`)

## Configuração de ambiente

O frontend lê a configuração do Firebase de variáveis `VITE_*`. Crie um arquivo
`web/.env.local` (não versionado) com:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=gerador-de-os-3ba02
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...            # opcional (Analytics)

# Região das callable functions (padrão já é southamerica-east1)
VITE_FIREBASE_FUNCTIONS_REGION=southamerica-east1

# Use os emuladores locais (true) em vez do projeto real
VITE_USE_FIREBASE_EMULATORS=false
```

Esses valores vêm do Console do Firebase em **Configurações do projeto → Seus apps**.

## Rodando localmente

Instale as dependências (raiz, `web/` e `functions/`):

```bash
npm install
npm install --prefix web
npm install --prefix functions
```

Servidor de desenvolvimento do frontend:

```bash
npm run dev          # na raiz (encaminha para web/)
# ou
npm run dev --prefix web
```

Com emuladores do Firebase (Auth, Firestore, Functions, Storage, Hosting):

```bash
# defina VITE_USE_FIREBASE_EMULATORS=true em web/.env.local
npm run emulators    # compila functions e sobe os emuladores
```

Portas dos emuladores: Auth `9099`, Functions `5001`, Firestore `8080`,
Hosting `5000`, Storage `9199`, UI habilitada.

## Scripts disponíveis

Na **raiz** (`package.json`):

| Script | Descrição |
| --- | --- |
| `npm run dev` | Sobe o Vite do frontend |
| `npm run build` | Build de produção do frontend |
| `npm run lint` | ESLint do frontend |
| `npm run format` | Prettier (escrita) |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes end-to-end (Playwright) |
| `npm run emulators` | Compila functions e inicia os emuladores |
| `npm run deploy` | Build (web + functions) e `firebase deploy` completo |
| `npm run deploy:functions` | Build das functions e deploy apenas das functions |
| `npm run inventory:suporte` | Gera inventário dos modelos legados do suporte |

Em **`web/`** há ainda: `preview`, `format:check`, `test:watch`,
`test:coverage`, `test:e2e:ui`.

## Módulos da plataforma

As rotas ficam em `web/src/App.tsx` e a navegação em `web/src/config/navItems.ts`.

- **Início** (`/`) — hub de acesso rápido aos módulos disponíveis ao usuário.
- **Suporte** (`/suporte`) — hub de demandas do suporte técnico; gera textos/O.S
  padronizados (Alteração de Plano, Mudança de Endereço, etc.).
- **Gerar O.S** (`/gerar-os`) — gerador a partir de modelos (`web/src/data`).
- **Escala** (`/escala`) — organização de turnos da equipe.
- **Upgrades** (`/upgrades`, `/upgrades/comissoes`) — registro operacional de
  upgrades e comissões.
- **Chamados** (`/chamados`, `/chamados/:id`) — chamados internos estilo GLPI
  (abertura, resgate, atribuição, comentários e encerramento com parecer).
- **Agenda** (`/agenda`) — agenda de visitas técnicas (equipes de instalação/mudança
  de endereço e de manutenção), com células coloridas por status.
- **Condomínios** (`/condominios`) — consulta/edição da base de condomínios.
- **Usuários** (`/admin/usuarios`) — gestão de contas, perfis e permissões.
- **Avisos** (`/avisos`) — comunicados internos (alimentam o sininho).
- **Perfil** (`/perfil`) — dados do usuário e foto.
- **Sobre** (`/sobre`) — história e visão geral da plataforma.

## Modelo de acesso (setores, hierarquia e papéis)

Definido em `web/src/types/profile.ts` e aplicado tanto no frontend (guards
`RequireAuth`, `RequireSupport`, `RequireUserManager`, `RequireCondominios`,
`RequireUpgradeCommissions`) quanto nas regras do Firestore e nas Cloud Functions.

- **Setores:** `suporte`, `instalacao`, `financeiro`, `comercial`, `cadastro`.
- **Hierarquia:** `gerente`, `supervisor`, `operador`.
- **Papéis especiais (flags):**
  - `isDev` — acesso técnico total; só outro dev pode conceder.
  - `isAdmin` — papel administrativo (concedido por dev/admin).
  - `isTi` — função T.I; gerencia o ambiente de chamados (GLPI), independente do setor.
  - `active` — quando `false`, bloqueia o acesso.

Gerentes/supervisores administram usuários apenas do próprio setor; dev/admin
enxergam todos. Há uma conta protegida que só pode ser alterada por um dev.

## Backend (Firebase)

Cloud Functions em `functions/src/index.ts` (2ª geração, região
`southamerica-east1`):

- `manageUsersList` — lista usuários respeitando o escopo do solicitante.
- `manageUsersCreate` — cria usuário no Auth + documento de perfil.
- `manageUsersUpdate` — atualiza Auth + perfil (com validação de papéis/escopo).
- `sectorRoster` — lista e-mail/nome do próprio setor (usado p.ex. pela Escala).
- `noticeReadOnCreate` — trigger Firestore que incrementa o contador de leitura
  de um aviso quando o usuário o marca como lido.

As callable são expostas no Hosting via rewrites `/fbfunctions/*` (ver
`firebase.json`). As regras de segurança ficam em `firestore.rules` e
`storage.rules`.

## Notificações (sininho)

O sininho no topo agrega dois tipos de notificação, derivadas em tempo real no
cliente (sem push/e-mail):

- **Avisos** — comunicados internos (`useNotices` + coleção `notices`).
- **Chamados** (`useHelpdeskNotifications`):
  - Quem tem a função **T.I** recebe os **chamados recém-abertos**.
  - O **autor** de um chamado recebe quando o **T.I responde** (comentário ou
    encerramento). O documento do chamado guarda a última resposta em
    `lastReplyAt` / `lastReplyRole` / `lastReplyByUid`.

O "visto" é por usuário e por canal (armazenado em `localStorage`); visitar a tela
de Chamados marca as pendências como vistas.

## Deploy

Deploy completo (frontend + functions + regras + índices):

```bash
npm run deploy
```

No PowerShell, para condicionar o deploy ao sucesso do build:

```powershell
npm run build; if ($LASTEXITCODE -eq 0) { npx firebase deploy }
```

Apenas hosting ou apenas functions:

```bash
npx firebase deploy --only hosting
npm run deploy:functions
```

> **Observação:** o runtime Node.js 20 das Functions está marcado como
> depreciado pelo Google; planejar atualização futura do runtime e do
> `firebase-functions`.

## Testes e qualidade

```bash
npm run test         # unitários (Vitest)
npm run test:e2e     # end-to-end (Playwright)
npm run lint         # ESLint
npm run format       # Prettier
```

## Pasta `legado-exemplo`

Contém os HTML/CSS/JS originais (modelos de O.S, fluxos de suporte, telas
antigas) usados como **referência** durante a refatoração para o novo sistema de
templates em TypeScript. É material de consulta — não faz parte do build da
aplicação. O inventário pode ser regenerado com `npm run inventory:suporte`.

## Convenções

- Mensagens de commit seguem o padrão *Conventional Commits* (`feat:`, `fix:`,
  `chore:`, ...), como no histórico do projeto.
- Componentes e telas em React + TypeScript; estilo via MUI (`sx`) e tema
  centralizado com suporte a modo claro/escuro.
- Acesso a dados isolado por domínio em `web/src/lib/*Firestore.ts`.

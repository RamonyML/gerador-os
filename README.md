# Gerador de O.S — Plataforma Operacional MZ NET

Plataforma de apoio operacional para o suporte técnico da **MZ NET** (provedor de internet fibra óptica — Uberlândia/MG). O sistema nasceu como um gerador de Ordens de Serviço (padronização de textos e protocolos), mas evoluiu para uma plataforma usada diariamente pela equipe: hub de demandas do suporte, chamados internos, escala de trabalho, registro de upgrades, agenda de visitas técnicas, gestão de condomínios, relatório de bugs, avisos e administração de usuários.

**Diferencial técnico atual:** integração bidirecional completa com o ERP MK Solutions — cada formulário de suporte abre automaticamente o atendimento, insere os comentários em sequência e cria a Ordem de Serviço no MK ERP, eliminando o copiar-e-colar manual dos operadores.

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
- [Modelo de acesso](#modelo-de-acesso)
- [Integração MK Solutions](#integração-mk-solutions)
- [Backend Firebase](#backend-firebase)
- [Notificações](#notificações)
- [Deploy](#deploy)
- [Testes e qualidade](#testes-e-qualidade)
- [Convenções](#convenções)

---

## Visão geral

SPA em React + TypeScript, servido pelo Firebase Hosting, com backend serverless no Firebase (Authentication, Cloud Firestore, Storage e Cloud Functions). Todo o conteúdo fica atrás de autenticação por e-mail/senha; o acesso a cada módulo é controlado por setor, hierarquia e papéis especiais.

---

## Stack

### Frontend (`web/`)

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| UI | Material UI (MUI) v9 + Emotion |
| Roteamento | React Router v7 |
| Ícones | Lucide React + MUI Icons |
| Gráficos | Recharts |
| PDF | jsPDF |
| Planilhas | xlsx |
| Imagem | react-easy-crop (foto de perfil) |
| Datas | date-fns / dayjs / @mui/x-date-pickers |

### Backend (`functions/`)

| Camada | Tecnologia |
|---|---|
| Runtime | Cloud Functions 2ª geração, Node.js 20 |
| SDK | firebase-admin + firebase-functions v2 |
| Secrets | Google Cloud Secret Manager (`defineSecret`) |
| Região | `southamerica-east1` |

### Infra / Firebase

- **Authentication** — e-mail e senha
- **Cloud Firestore** — banco de dados principal; regras em `firestore.rules`, índices em `firestore.indexes.json`
- **Storage** — regras em `storage.rules`
- **Hosting** — SPA com rewrites para as callable functions

### Qualidade

- ESLint + Prettier
- Vitest + Testing Library (unit)
- Playwright (e2e)

---

## Estrutura do repositório

```
gerador-os/
├─ web/                          # Aplicação React (frontend)
│  ├─ src/
│  │  ├─ pages/                  # Telas
│  │  │  ├─ HomePage.tsx
│  │  │  ├─ OsGeneratorPage.tsx  # Gerador de O.S. + painel MK
│  │  │  ├─ AdminUsersPage.tsx
│  │  │  ├─ BugReportsPage.tsx   # Relatório de bugs (usuários)
│  │  │  ├─ DevHomePage.tsx      # Hub do dev (isDev)
│  │  │  └─ DevBugsPage.tsx      # Triagem de bugs (isDev)
│  │  ├─ components/
│  │  │  ├─ AppLayout.tsx        # Layout + sininho + menu lateral
│  │  │  ├─ MkProtocolCards.tsx  # Painel MK: cards sequenciais de protocolo e O.S.
│  │  │  ├─ MkFeedbackCards.tsx  # Painel MK: inserção de comentário em atendimento existente
│  │  │  ├─ PausaWidget.tsx      # Widget de pausa por equipe
│  │  │  └─ OsTemplateFieldsForm.tsx
│  │  ├─ features/
│  │  │  └─ bugs/                # Componentes do sistema de Bug Reports
│  │  │     ├─ NewBugReportDialog.tsx
│  │  │     ├─ BugReportDetailDialog.tsx
│  │  │     ├─ BugStatusChip.tsx
│  │  │     └─ BugModuleChip.tsx
│  │  ├─ contexts/               # AuthContext, ColorModeContext, tema
│  │  ├─ hooks/                  # useNotices, useHelpdeskNotifications, ...
│  │  ├─ lib/
│  │  │  ├─ firebase.ts          # Inicialização + roteamento emulador/produção
│  │  │  ├─ bugReportFirestore.ts
│  │  │  ├─ macMask.ts           # Máscara hexadecimal para endereço MAC
│  │  │  ├─ pausaFirestore.ts
│  │  │  └─ *Firestore.ts        # Acesso a dados por domínio
│  │  ├─ data/                   # Modelos de O.S. e builders de segmentos MK
│  │  │  ├─ mkProtocolRegistry.ts  # Registry central slug → config MK
│  │  │  ├─ manutencao/          # 15 formulários (luzVermelha, ontQueimada, ...)
│  │  │  ├─ altplan/             # 6 formulários de alteração de plano
│  │  │  ├─ wifiExtend/          # ZTE, TP-Link, Ponto adicional
│  │  │  ├─ midiaTv/             # Roku (padrão + presencial)
│  │  │  ├─ senhaRede/           # Alteração de SSID/Senha Wi-Fi
│  │  │  ├─ feedback/            # 8 formulários de feedback pós-O.S.
│  │  │  └─ termoDocs/           # Termo de responsabilidade
│  │  ├─ types/                  # Tipos de domínio (profile, ticket, agenda, bugReport, ...)
│  │  └─ config/                 # navItems e configuração de navegação
│  └─ public/                    # Assets estáticos (ilustrações, seeds)
├─ functions/
│  └─ src/
│     ├─ index.ts                # Exporta todas as callable functions
│     └─ mk-suporte.ts           # Toda a lógica de integração MK Solutions
├─ scripts/
│  ├─ build-legacy-suporte-inventory.mjs
│  └─ migrate-mk-login.js        # Migra MK_USER_MAP para campo mkLogin no Firestore
├─ docs/
│  ├─ mk/                        # Documentos de progresso da integração MK (partes 1–6)
│  ├─ codigos_mk/                # CODIGOS_MK_REFERENCIA.md — tabela canônica de IDs do MK
│  └─ documentacao_mk/           # Documentação oficial MK Solutions
├─ legado-exemplo/               # HTML/legado de referência (não entra no build)
├─ firebase.json
├─ firestore.rules
├─ firestore.indexes.json
└─ storage.rules
```

---

## Pré-requisitos

- **Node.js 20** (mesma versão das Cloud Functions)
- npm
- Firebase CLI (`npx firebase ...` — incluso como devDependency)

---

## Configuração de ambiente

### Frontend — `web/.env.local` (não versionado)

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=gerador-de-os-3ba02
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...          # opcional (Analytics)
VITE_FIREBASE_FUNCTIONS_REGION=southamerica-east1

# false = produção | true = emulador local (só Functions)
VITE_USE_FUNCTIONS_EMULATOR=false
```

> `web/.env.production` força `VITE_USE_FUNCTIONS_EMULATOR=false` e `VITE_USE_FIREBASE_EMULATORS=false` no build de produção, evitando que o Vite carregue `.env.local` sobre o build de produção.

### Cloud Functions — `functions/.env` (versionado — sem segredos)

```bash
MK_BASE_URL=https://sistema.mznet.com.br
MK_MODE=real   # 'real' | 'shadow'
```

### Secrets sensíveis — Google Cloud Secret Manager

`MK_TOKEN` e `MK_WEBSERVICE_PASSWORD` são gerenciados exclusivamente via Secret Manager (`defineSecret()`). **Nunca** colocar esses valores em arquivos versionados.

Para atualizar uma secret em produção:
```powershell
# printf evita o \n que o echo do PowerShell adiciona
printf 'valor_sem_newline' | gcloud secrets versions add NOME_DA_SECRET --data-file=-
```

> ⚠️ **Nunca usar `echo "valor" | gcloud secrets versions add`** — o PowerShell adiciona `\n` ao final, corrompendo a secret e quebrando a autenticação MK silenciosamente.

---

## Rodando localmente

```bash
# Instalar dependências (raiz, web/, functions/)
npm install
npm install --prefix web
npm install --prefix functions

# Frontend (Auth e Firestore em produção, Functions em produção)
npm run dev

# Emuladores (compila functions + sobe todos os emuladores)
# defina VITE_USE_FUNCTIONS_EMULATOR=true em web/.env.local
npm run emulators
```

Portas dos emuladores: Auth `9099` · Functions `5001` · Firestore `8080` · Hosting `5000` · Storage `9199` · UI habilitada.

> ⚠️ O emulador de Functions **não recompila automaticamente**. Após qualquer mudança em `functions/src/`, executar `npm run build --prefix functions` antes de reiniciar o emulador.

---

## Scripts disponíveis

Na **raiz** (`package.json`):

| Script | Descrição |
|---|---|
| `npm run dev` | Vite dev server do frontend |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes end-to-end (Playwright) |
| `npm run emulators` | Compila functions + inicia emuladores Firebase |
| `npm run deploy` | Build + `firebase deploy` completo |
| `npm run deploy:functions` | Build + deploy apenas das functions |
| `npm run inventory:suporte` | Gera inventário dos modelos legados |

---

## Módulos da plataforma

Rotas definidas em [web/src/App.tsx](web/src/App.tsx) e navegação em [web/src/config/navItems.ts](web/src/config/navItems.ts).

| Módulo | Rota | Guard | Descrição |
|---|---|---|---|
| Início | `/` | Auth | Hub com acesso rápido por módulo e turno ativo |
| Suporte | `/suporte` | Auth + setor | Hub de demandas do suporte (manutenção, altplan, etc.) |
| Gerar O.S. | `/gerar-os` | Auth | Gerador de formulários com painel MK integrado |
| Escala | `/escala` | Auth | Organização de turnos da equipe |
| Upgrades | `/upgrades` | Auth | Registro de upgrades e comissões |
| Chamados | `/chamados` | Auth | Chamados internos estilo GLPI |
| Agenda | `/agenda` | Auth | Agenda de visitas técnicas |
| Condomínios | `/condominios` | Auth | Base de condomínios |
| Usuários | `/admin/usuarios` | RequireUserManager | Gestão de contas e permissões |
| Avisos | `/avisos` | Auth | Comunicados internos |
| Bug Reports | `/bug-reports` | Auth | Abertura e acompanhamento de bugs pelo operador |
| Perfil | `/perfil` | Auth | Dados do usuário e foto |
| Dev Hub | `/dev` | RequireDev | Hub do ambiente de desenvolvimento |
| Dev Bugs | `/dev/bugs` | RequireDev | Triagem e gestão de bugs (isDev) |
| Dev MK | `/dev/mk` | RequireDev | Página de testes da integração MK |

---

## Modelo de acesso

Definido em [web/src/types/profile.ts](web/src/types/profile.ts) e aplicado no frontend (guards de rota), nas regras do Firestore e nas Cloud Functions.

**Setores:** `suporte` · `instalacao` · `financeiro` · `comercial` · `cadastro`

**Hierarquia:** `gerente` → `supervisor` → `operador`

**Papéis especiais (flags booleanos):**

| Flag | Descrição |
|---|---|
| `isDev` | Acesso técnico total; `/dev/*`; só outro dev pode conceder |
| `isAdmin` | Papel administrativo (concedido por dev/admin) |
| `isTi` | Acesso ao ambiente de chamados (GLPI), independente do setor |
| `active` | Quando `false`, bloqueia login e acesso |
| `mkLogin` | Login no MK ERP (ex.: `mz.ramony`); usado como `op_abertura` nos atendimentos |

Gerentes/supervisores administram usuários apenas do próprio setor; dev/admin enxergam todos. Há uma conta protegida que só pode ser alterada por um dev.

---

## Integração MK Solutions

Esta é a feature central do sistema desde junho de 2026. Cada formulário de suporte **abre automaticamente o atendimento no MK ERP, insere os comentários em sequência e cria a Ordem de Serviço** — eliminando o trabalho manual de copiar e colar dos operadores.

### Arquitetura geral

```
React (web/) ──httpsCallable──▶ Cloud Function mkSuporte (functions/src/mk-suporte.ts)
                                         │
                                         ▼
                               MK Solutions API (HTTPS)
                               sistema.mznet.com.br/mk/
```

- **Credenciais MK** ficam exclusivamente no Google Cloud Secret Manager (`MK_TOKEN`, `MK_WEBSERVICE_PASSWORD`). Nunca no bundle React nem em arquivos versionados.
- **Shadow mode** (`MK_MODE=shadow`): a função loga o payload no Firestore (`mk_integration_log`) sem chamar o MK. Seguro para testar o fluxo de UI.
- **Real mode** (`MK_MODE=real`): chama o MK de verdade. Estado atual em produção.

### Endpoints utilizados

Todos os endpoints usam `GET` (exceto `WSMKAtendimentoComentario` que usa `POST`). Base: `https://sistema.mznet.com.br/mk/`.

| Endpoint | Ação | Campos-chave de resposta |
|---|---|---|
| `WSAutenticacao.rule` | Autenticação — obtém `sessionToken` e `JSESSIONID` | `Token` (PascalCase; doc. antiga estava errada) |
| `WSMKConsultaDoc.rule` | Busca cliente por CPF/CNPJ | `CodigoPessoa` (flat, sem objeto aninhado) |
| `WSMKConexoesPorCliente.rule` | Lista conexões ativas do cliente | `codconexao` (lowercase; doc. diz `CodigoConexao`) |
| `WSMKContratosPorCliente.rule` | Lista contratos do cliente | — |
| `WSMKListaPlanoAcesso.rule` | Lista planos de acesso disponíveis | — |
| `WSMKNovoAtendimento.rule` | Cria atendimento (protocolo) | `CodigoAtendimento` (doc. antiga: `cd_atendimento`) |
| `WSMKAtendimentoComentario.rule` | Insere comentário em atendimento existente | POST + Cookie JSESSIONID + `tipo: 1` |
| `WSMKCriarOrdemServico.rule` | Cria Ordem de Serviço vinculada ao atendimento | Requer `CodigoConexao`, `CodigoTipoOS`, `CodigoGrupoServico`, `CodicoTecnico`, `categoria` |

### Ações da Cloud Function `mkSuporte`

A callable `mkSuporte` aceita um campo `action` no payload e executa o fluxo correspondente:

| Action | Fluxo |
|---|---|
| `criar_protocolo` | auth → busca cliente → busca conexão → cria atendimento → (comentários via ação separada) |
| `inserir_comentario` | auth → insere comentário no atendimento existente (chunking automático) |
| `buscar_conexao` | auth → busca conexões pelo `CodigoPessoa` (ou `clienteCodigo` override) |
| `criar_os_vinculada` | Sessão A: auth + busca conexão. Sessão B: auth + cria OS. Duas sessões independentes para evitar contaminação de contexto MK. |

### Mapeamento de operador (`op_abertura`)

Cada operador tem seu login MK registrado no campo `mkLogin` do documento de usuário no Firestore. A Cloud Function consulta esse campo via `db.collection('users').doc(uid).get()` antes de abrir o atendimento. Se ausente, o campo `op_abertura` simplesmente não é enviado (não quebra o fluxo).

> O campo `mkLogin` substituiu o `MK_USER_MAP` estático (hardcoded na CF). A migração é feita via `scripts/migrate-mk-login.js`.

### Limitações técnicas conhecidas do MK

| Limitação | Impacto | Solução adotada |
|---|---|---|
| `WSMKAtendimentoComentario`: `varchar(300)` no campo comentário | Comentários longos trocam caracteres | Chunking automático com `mkEstimatedLength` que contabiliza overhead de HTML-encoding (não-ASCII: +8; ASCII especiais `()/\$#&<>"'`: +5; demais: 1). `contentMax=244` (descontado o overhead do wrapper HTML) |
| Servidor Tomcat decodifica form-body como Windows-1252 por padrão | Acentos aparecem como `NAVEGAÃ‡ÃƒO` | Header `Content-Type: application/x-www-form-urlencoded; charset=UTF-8` instrui o Tomcat a usar UTF-8 |
| Busca de atendimento por número de protocolo (ex.: `2606.28765`) não existe | Operador precisa copiar o ID interno do MK ERP manualmente para usar feedbacks | Nenhum endpoint disponível; confirmado como roadmap sem prazo pelo suporte MK |
| `Op. abertura` na O.S. sempre exibe "master" | Rastreabilidade do operador na O.S. comprometida | As credenciais no Secret Manager pertencem à conta "master". Correção futura: trocar por credenciais de operador real |

### Registry central — `MK_PROTOCOL_REGISTRY`

Arquivo: [web/src/data/mkProtocolRegistry.ts](web/src/data/mkProtocolRegistry.ts)

Mapa `slug → MkProtocolEntry` com discriminated union por `mode`:

```typescript
type MkProtocolNewEntry = {
  mode: 'new'               // cria atendimento + comentários + O.S.
  processoId: number        // código do processo no MK ERP
  classificacaoId: number   // código da classificação do atendimento
  buildSegmentos: (v) => {
    info: string            // campo info do WSMKNovoAtendimento (texto puro, preto)
    comentarios: string[]   // comentários subsequentes (wrapper HTML vermelho)
    osDescricao?: string    // campo DescricaoProblema no WSMKCriarOrdemServico
    osIndicacoes?: string   // campo Indicacoes no WSMKCriarOrdemServico
    avisoCard?: string      // card laranja exibido ao operador — NÃO enviado ao MK
    avisoObservacao?: string // texto copyável para inserir em Obs./Pessoas MK
    clienteTexto?: string   // aba extra "Termo para o cliente"
  }
  tipoOS?: number           // CodigoTipoOS — se ausente, botão "Criar O.S." não aparece
  grupoServico?: number     // CodigoGrupoServico (10 = EQUIPE MZ NET)
  tecnicoId?: number        // CodicoTecnico (1 para grupoServico 10)
}

type MkProtocolCommentEntry = {
  mode: 'comment'           // insere comentário em atendimento existente (feedback)
  buildText: (v) => string
}
```

### Formulários integrados (status em 2026-06-29)

| Categoria | Formulários | Mode | O.S. | tipoOS |
|---|---|---|---|---|
| Manutenção | 15 formulários (luzVermelha PF/PJ/isento, fibraExterna, ocasConector, ocasFibra, sinalAlto, realocFibra, mudPontoInt, visitaTestes, fonteQueimada, roteadorQueimado, ontQueimada, onuQueimada, roteadorReset) | `new` | ✅ | 3 (MANUTENCAO); isento → 22 (RETORNO GARANTIA 7 DIAS) |
| Alteração de Plano | 6 formulários (remoto, presencial, semTrocaIsenta, semTrocaPaga, trocaIsenta, trocaPaga) | `new` | ✅ | 7 (ALTERAÇÃO DE PLANO) |
| Wi-Fi Extend | ZTE H-199A, TP-Link, Ponto adicional | `new` | ✅ | 18 (ALT. PLANO + WI-FI EXTEND); ponto → 13 (OS DE PONTO ADICIONAL) |
| Mídia/TV | Roku padrão, Roku presencial | `new` | ✅ | 21 (ROKU TV) |
| Termo de Resp. | Padrão | `new` | — | — (sem O.S.) |
| Senha de Rede | Alteração SSID/Senha Wi-Fi | `new` | — | — (sem O.S.) |
| Feedback | 8 formulários (semSucesso, manExterna, manOcasionado, mudancaPonto, trocaEquip, altplan, stbRoku, wifiExtend) | `comment` | — | — |

> **grupoServico: 10 (EQUIPE MZ NET) e tecnicoId: 1** em todos os formulários com O.S. — confirmado pelo admin MZ NET.

### Padrão `buildSegmentos` — regras de formatação

1. **`info`** → texto puro (sem HTML). Enviado para o campo `info` do `WSMKNovoAtendimento`. Exibido como abertura do atendimento (preto) no MK ERP.
2. **`comentarios[0]`** → enviado com `raw: true` — texto puro, sem wrapper HTML. É o bloco de diagnóstico.
3. **`comentarios[1..N]`** → envolvidos em `<h2 style="color: red;">texto</h2>` (wrapper `wrapCommentHtml`). Aparecem em vermelho no MK ERP, igual à inserção manual.
4. Sempre `tipo: 1` (privado) — nunca `tipo: 2`.
5. Strings em ASCII puro (sem acentos) nos textos que vão para o MK — o MK HTML-encoda não-ASCII antes de gravar, o que expandia o texto além do `varchar(300)`.
6. Limite seguro por card: **244 chars** de conteúdo (o chunker cobre overflow, mas 244 é o teto antes do wrapper HTML vermelho contar).

### Fluxo end-to-end no painel direito (`MkProtocolCards`)

```
Operador preenche o formulário
        ↓
[Buscar cliente] → WSMKConsultaDoc → CodigoPessoa + lista de conexões
        ↓
Selecionar conexão ativa (ou "Outro cadastro MK?" para CNPJ com múltiplos registros)
        ↓
Card 0 [Abrir atendimento] → WSMKNovoAtendimento → CodigoAtendimento + Protocolo
        → campo protocolo do formulário preenchido e travado automaticamente
        ↓
Card 1 [Inserir no MK] → WSMKAtendimentoComentario (raw, sem HTML)
        ↓
Card 2..N [Inserir no MK] → WSMKAtendimentoComentario (HTML vermelho, chunked)
        ↓ (após último comentário, muda para aba O.S. automaticamente)
Aba O.S. [Criar O.S. no MK] → WSMKCriarOrdemServico (2 sessões independentes)
        → Sessão A: busca CodigoConexao
        → Sessão B: cria O.S. com CodigoConexao + CodigoAtendimento
```

### Tratamento de CNPJs com múltiplos cadastros no MK

`WSMKConsultaDoc` retorna apenas um `CodigoPessoa` por CPF/CNPJ. Para clientes PJ com duas filiais no MK (mesmo CNPJ, códigos diferentes), o operador pode clicar em **"Outro cadastro MK?"** no painel, digitar o código correto (consultado em Workspace → Pessoas/Empresas no MK ERP) e recarregar as conexões daquele cadastro. O `clienteCodigo` informado é propagado ao `criar_protocolo`, garantindo que o atendimento seja aberto no cadastro correto.

---

## Backend Firebase

Cloud Functions em [functions/src/index.ts](functions/src/index.ts) (2ª geração, região `southamerica-east1`):

| Função | Tipo | Descrição |
|---|---|---|
| `manageUsersList` | Callable | Lista usuários respeitando o escopo do solicitante (setor/hierarquia) |
| `manageUsersCreate` | Callable | Cria usuário no Auth + documento de perfil no Firestore |
| `manageUsersUpdate` | Callable | Atualiza Auth + perfil (validação de papéis e escopo) |
| `sectorRoster` | Callable | Lista e-mail/nome do próprio setor (usada pela Escala) |
| `noticeReadOnCreate` | Trigger Firestore | Incrementa contador de leitura de um aviso quando o usuário marca como lido |
| `mkSuporte` | Callable | Orquestra toda a integração com o MK Solutions (ver seção anterior) |

As callables são expostas no Hosting via rewrites `/fbfunctions/*` (ver `firebase.json`).

### Coleções Firestore principais

| Coleção | Descrição |
|---|---|
| `users` | Perfis de usuário (setor, hierarquia, flags, `mkLogin`) |
| `notices` | Avisos internos |
| `helpdesk_tickets` | Chamados GLPI internos |
| `agenda` | Visitas técnicas agendadas |
| `upgrades` | Registro de upgrades |
| `condominios` | Base de condomínios |
| `pausas` | Registro de pausas por equipe (PausaWidget) |
| `bug_reports` | Relatórios de bugs abertos pelos operadores |
| `mk_integration_log` | Log do shadow mode da integração MK |

---

## Notificações

O sininho no topo agrega dois canais, derivados em tempo real no cliente (sem push/e-mail):

- **Avisos** — comunicados internos (`useNotices` + coleção `notices`).
- **Chamados** (`useHelpdeskNotifications`):
  - Quem tem a função **T.I** recebe os **chamados recém-abertos**.
  - O **autor** de um chamado recebe notificação quando o T.I responde (comentário ou encerramento). O documento do chamado guarda `lastReplyAt`, `lastReplyRole` e `lastReplyByUid`.

O "visto" é por usuário e por canal (armazenado em `localStorage`); visitar a tela de Chamados marca as pendências como vistas.

---

## Deploy

Deploy completo (frontend + functions + regras + índices):

```bash
npm run deploy
```

No PowerShell, condicionando ao sucesso do build:

```powershell
npm run build; if ($LASTEXITCODE -eq 0) { npx firebase deploy }
```

Apenas hosting ou apenas functions:

```bash
npx firebase deploy --only hosting
npm run deploy:functions
```

> **Atenção:** o runtime Node.js 20 das Functions está marcado como depreciado pelo Google. Planejar migração para Node.js 22 em janela futura.

---

## Testes e qualidade

```bash
npm run test          # Vitest — testes unitários
npm run test:e2e      # Playwright — testes end-to-end
npm run lint          # ESLint
npm run format        # Prettier
```

Cobertura alvo: ≥80% de cobertura unitária. Os arquivos `buildXxxSegmentos` e `buildXxxTextos` em `web/src/data/` têm suíte de testes unitários. O Playwright cobre os fluxos críticos de UI.

---

## Convenções

- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `perf:`, `docs:`, `test:`).
- **Componentes:** React + TypeScript; estilo via MUI (`sx`) e tema centralizado com suporte a modo claro/escuro (4 temas: Dia, Noite, Gelo, Cinza).
- **Acesso a dados:** isolado por domínio em `web/src/lib/*Firestore.ts`.
- **`buildSegmentos`:** construção direta de cards (sem split de texto de preview). Cada card é uma string independente. Usar `\n` para quebras de linha dentro do mesmo card.
- **Códigos MK:** consultar sempre `docs/codigos_mk/CODIGOS_MK_REFERENCIA.md` antes de alterar `processoId`, `classificacaoId`, `tipoOS` ou `grupoServico` no registry. Nunca registrar `processoId: 0` como placeholder — isso ativa o banner "Integração pendente" no `MkProtocolCards`.
- **Secrets:** nunca hardcodar no código. Variáveis `VITE_*` no frontend (sem segredos); Secret Manager para credenciais MK no backend.
- **Pasta `legado-exemplo/`:** HTML/CSS/JS dos sistemas anteriores, usados como referência durante a refatoração. Não fazem parte do build. Regenerar inventário com `npm run inventory:suporte`.

# Plano técnico — sistema unificado MZ NET (Ordens de Serviço e operações)

**Autor do plano:** análise do repositório legado + requisitos declarados pelo Ramony  
**Objetivo:** substituir o modelo “site estático por fluxo” + app React separado por **uma única aplicação** gerenciável, com **setores**, **hierarquia** e **dois níveis administrativos especiais** (dev com acesso total e admin operacional).

### Premissa atual (greenfield)

- **Repositório Git:** novo, em branco — o código será criado do zero nesse repo (sem arrastar a árvore antiga de centenas de HTML como base obrigatória).
- **Firebase:** será criado um **projeto Firebase novo** para este sistema.
- **Banco legado:** o Firestore (e demais recursos) do projeto antigo **será desativado em breve**. Este plano **não** assume migração automática de dados nem continuidade do schema atual. Se houver necessidade de **histórico** (ex.: upgrades antigos), isso deve ser tratado como **export pontual opcional** antes do desligamento — fora do escopo padrão do MVP.

---

## 1. Diagnóstico do estado atual do projeto

### 1.1 Dois sistemas no mesmo repositório (confirmado)

| Aspecto | Sistema A — Gerador de O.S (HTML) | Sistema B — Upgrades / gestão (React) |
|--------|-------------------------------------|----------------------------------------|
| **Onde vive** | Raiz do projeto: `suporte/`, `instalacao/`, `cadastro/`, `js/`, `login.html`, etc. | `src/` → build em `build/` |
| **Deploy (Firebase Hosting)** | Target `gerador`: `public: "."` (site estático servindo centenas de `.html`) | Target `upgrades`: `public: "build"` (SPA) |
| **Stack** | HTML, Tailwind/Bootstrap, JS vanilla, Firebase Auth via `js/` | React 18, TypeScript, MUI, React Router, Firestore |
| **Papel de negócio** | Formulários que montam textos (ex.: texto para agenda, protocolos, encerramentos) por tipo de atendimento | Registro de upgrades, dashboard, comissões, usuários (`operadores`), questionários, logs |

O `README.md` já documenta essa divisão; na prática isso gera **dois logins/UX**, **duplicação de lógica** e **manutenção pesada** nos HTML.

### 1.2 Foco na pasta `suporte/` (e por que ela “pesa” tanto)

- **Volume:** centenas de arquivos `.html` (ordem de grandeza ~239 só em `suporte/`), além de cópias (`dashboard copy`, `dash-man copy`, backups).
- **Função principal:** cada página é um **fluxo de atendimento** (ex.: luz vermelha, alteração de plano, compra STB/Roku, feedback, Wi‑Fi extend, direcionamento de portas, equipamento queimado, encerramentos).
- **Padrão repetido em quase todos os fluxos:**
  - Campos comuns: cliente, protocolo, bairro, forma de pagamento / variantes, observações.
  - **Seleção de operador** — hoje via `<select>` alimentado por lista duplicada ou `fetch('/js/operadores.json')`, ou variável global `nomeOperadorAtual`.
  - **Geração de strings** (ex.: `textoAgenda`) com **template embutido no JavaScript da própria página** — qualquer mudança de texto exige editar **cada** HTML afetado.
- **Autenticação:** páginas referenciam módulos em `js/` (`check-login.js`, `firebase-init.js`); o dashboard de suporte aponta para `auth.js` (no snapshot analisado **não há** `suporte/auth.js` no disco — risco de link quebrado ou arquivo gerado fora do repo). O padrão é “cada área cuida do seu redirect”.

**Conclusão:** `suporte/` não é só “uma pasta”; é o **catálogo de produto** da operação de suporte, modelado como **páginas estáticas** em vez de **dados + templates**.

### 1.3 O que já existe em `src/` (e o que ainda não)

Pontos fortes reutilizáveis como **base conceitual** (não necessariamente código linha a linha):

- **React + TypeScript + MUI**, rotas, `AuthContext` carregando `operadores` / `users` no Firestore.
- **Conceitos:** `operador` | `supervisor` | `gerente`, listas de e-mail em `types/index.ts`, rotas `GerenteRoute` / `SupervisorRoute`.
- **Domínio já modelado:** upgrades, logs, questionários, dashboard com filtros por mês, comissões.

Limitações em relação ao que você quer agora:

- **Não há “setor”** (suporte, instalação, financeiro, comercial, cadastro) — tudo é um único funil de “operadores”.
- **Papéis e permissões** estão **hardcoded por e-mail** no cliente **e** em `firestore.rules` (listas `gerentes`, `supervisores`). Isso **não escala** e conflita com “admin que gerencia acessos” e “dev com acesso total”.
- **`OSPage`** existe mas está **vazio** (placeholder) — o gerador de O.S **não** foi migrado para React.
- **Dois hostings** reforçam a sensação de “dois sistemas”.

### 1.4 Backend no legado (referência — não reaproveitar como está)

O projeto antigo usava Firebase com padrões que **não** devem ser copiados para o ambiente novo:

- **Firestore:** regras com `isGerente()` / `isSupervisor()` baseadas em e-mail literal.
- **Cloud Functions:** exemplos como `resetUserPassword` amarrados a lista fixa de gerentes.
- **Duplicidade:** “quem é gerente” repetido em TS, regras e functions — o novo projeto deve ter **fonte única** (claims + documento de perfil), já no primeiro desenho.

No **projeto Firebase novo**, o schema, as regras e as functions são escritos **do zero**, alinhados às seções 3.2, 5 e 7 deste documento.

---

## 2. Visão do produto alvo (o que você pediu)

### 2.1 Uma única aplicação

- Um **login**, um **shell** (layout com menu), **rotas protegidas**.
- Conteúdo e ferramentas **filtrados pelo setor** do usuário.
- **Operadores de texto / nomes / modelos** geridos em **telas administrativas**, não em 200+ arquivos HTML.

### 2.2 Setores (tenant lógico)

Cada usuário pertence a **um** setor principal:

- `suporte`
- `instalacao`
- `financeiro`
- `comercial`
- `cadastro`

### 2.3 Hierarquia dentro do setor

Em cada setor:

- `gerente`
- `supervisor`
- `operador`

Regras de negócio típicas (a validar com você na implementação):

- **Operador:** cria registros (O.S, atendimentos), vê o que é próprio ou do time conforme política do setor.
- **Supervisor:** visão ampliada do setor (aprovar, reatribuir, relatórios), sem necessariamente ver outros setores.
- **Gerente:** visão completa do setor + configurações locais (ex.: aprovar modelos, ver KPIs).

### 2.4 Dois tipos especiais de acesso (além da hierarquia)

| Papel | Descrição sugerida | Observação técnica |
|-------|-------------------|-------------------|
| **Desenvolvedor (dev)** | Você: **acesso total** a todos os setores, configurações técnicas, feature flags, auditoria, possivelmente ambiente de staging. | Implementar como **`role: dev`** ou **`custom claim` `dev: true`** no Firebase Auth, **nunca** como lista de e-mail no código. |
| **Administrador (admin)** | Gestão de **usuários**, **setores**, **convites**, **reset de senha**, desativar contas — **sem** necessidade de acesso a código ou infra. | `role: admin` ou `claims.admin`; escopo pode ser **global** ou **por setor** (definir na primeira versão). |

**Importante:** “admin” e “dev” **não substituem** gerente/supervisor/operador; são **camadas ortogonais** (ex.: um usuário pode ser `operador` em `suporte` **e** ter `isAdmin` para gerir contas).

---

## 3. Arquitetura recomendada

### 3.1 Stack sugerida (alinhada ao que você já tem)

**Manter:** **React + TypeScript** no front, **Firebase** (Auth + Firestore; Storage se houver anexos; Functions para tarefas privilegiadas).

**Motivos:**

- Você já tem equipe/código em TS e MUI.
- O problema não é “HTML ruim”, é **ausência de modelo de dados e CMS** para templates.
- Firebase continua válido se as **regras** forem refeitas com **Custom Claims** ou documentos de perfil referenciados com segurança.

**Alternativas** (só se houver motivo forte): Next.js (SSR/SEO se precisar de páginas públicas); backend próprio (Node/Nest, Postgres) — aumenta custo operacional; recomendável **só** se a empresa exigir integrações pesadas fora do ecossistema Google.

### 3.2 Modelo de autorização — evitar o “e-mail na regra” (erro do legado)

**Problema a não repetir:** regras com arrays de e-mails no `firestore.rules`, como no sistema antigo.

**Direção no projeto novo:**

1. **Custom Claims** no Firebase Auth (via Cloud Function ou script admin **one-off**):
   - `sector`, `hierarchy`, `isDev`, `isAdmin` (e/ou `permissions: string[]`).
2. **Documento espelho** em Firestore `users/{uid}` ou `profiles/{uid}` para leitura rápida no app (nome, setor, etc.), **sincronizado** quando o admin altera o usuário.
3. **Regras Firestore** usando `request.auth.token` (claims) em vez de listas fixas.

Isso atende: **um único lugar** para “quem é o quê”, auditável e sem redeploy de regras a cada novo colaborador.

### 3.3 Camada de “conteúdo” das O.S — o coração da refatoração

Substituir N HTML por **três entidades**:

1. **`osTemplates` (ou `fluxos`)**  
   - `id`, `sector`, `slug`, `title`, `version`, `active`, `schema` (JSON Schema ou lista de campos tipados), `outputTemplates` (ver item 3).

2. **`templateBlocks` / strings interpoladas**  
   - Textos com placeholders: `{{cliente}}`, `{{protocolo}}`, `{{operador.nome}}`, etc.
   - Versionamento: ao publicar novo texto, incrementar `version` e manter histórico opcional.

3. **`renders` / “geração”**  
   - Função pura no cliente: `render(template, context)` + validação do `schema`.
   - Opcional: Cloud Function para PDF oficial se precisar de servidor (carimbo, layout fixo).

**Benefício:** mudar **um** texto ou **um** nome de operador passa a ser **edição no painel** + **publicação**, não grep em 200 arquivos.

### 3.4 Migração dos fluxos atuais (`suporte/`, `instalacao/`, etc.)

Sugestão de abordagem em ondas:

| Onda | O que fazer |
|------|-------------|
| **0 — Fundação** | Novo app shell, login, claims, perfis por setor, página “em construção” por rota. |
| **1 — Catálogo** | Inventariar fluxos HTML → planilha ou JSON: nome, setor, campos, exemplo de saída (`textoAgenda`). |
| **2 — Piloto** | 2–3 fluxos de maior uso (ex.: um de luz vermelha, um de alt plano) migrados para `osTemplates`. |
| **3 — Paridade** | Demais fluxos; redirects dos `.html` antigos para URLs novas (301 ou meta refresh durante transição). |
| **4 — Desligamento** | Remover hosting estático duplicado; um único target ou monorepo com um `public`. |

### 3.5 Módulo de Upgrades (equivalente ao que existia em React no legado)

- Tratar **Upgrades** como **um módulo** dentro do mesmo app: rota `/suporte/upgrades` (ou `/comercial/upgrades` conforme regra de negócio).
- **Dados:** no Firestore **novo**, definir coleções como `upgrades`, `logs` (ou nomes alinhados ao seu padrão) **do zero**, com modelo pensado para setores e claims desde o início — **sem** depender dos documentos do banco antigo.
- **Dashboard/comissões:** restritos a setores/hierarquias definidos (ex.: só `comercial` + `gerente`).

---

## 4. Estrutura de pastas sugerida (novo projeto ou refactor grande)

```
apps/
  web/                    # React + Vite (recomendado) ou CRA
    src/
      app/                # providers, router
      features/
        auth/
        os-generator/     # templates, formulários dinâmicos, preview
        upgrades/         # módulo de upgrades (lógica pode inspirar-se no legado `src/`)
        admin/            # usuários, setores, claims (admin/dev)
        audit/
      shared/             # ui, hooks, lib/firebase
packages/
  shared-types/           # tipos TS compartilhados (opcional)
functions/                # Firebase Functions (claims, triggers)
firestore.rules
firestore.indexes.json
```

*(Se preferir um único pacote sem monorepo, mantenha a mesma árvore dentro de `src/features/`.)*

**Ferramenta de build:** **Vite** é hoje o padrão mais ágil que `react-scripts` (CRA em modo manutenção). Migração incremental possível.

---

## 5. Modelo de dados (Firestore) — rascunho

**Coleções principais (evolutivas):**

- `users/{uid}` — perfil: `email`, `displayName`, `sectorId`, `hierarchy`, `active`, `createdAt`, `updatedAt`.
- `sectors/{id}` — `name`, `slug`, `settings` (opcional).
- `osTemplates/{id}` — definição de fluxo + templates de saída.
- `osInstances/{id}` — registro gerado (auditoria): quem gerou, quando, dados, hash da versão do template.
- `upgrades/{id}` — registros de upgrade no **novo** projeto (schema definido na implementação).
- `auditLogs/{id}` — ações sensíveis (admin/dev).

Índices compostos: por `sectorId + createdAt`, `operadorId + data`, etc. (ajustar após consultas reais).

---

## 6. UX por setor (após login)

1. Resolver **perfil** → setor + hierarquia + flags admin/dev.
2. **Menu lateral** mostra apenas **módulos** associados ao setor (config em `sectors` ou constante versionada).
3. **Dashboard inicial** do setor (KPIs específicos).
4. **Gerador de O.S** lista apenas templates `sector === user.sector` (dev vê todos).

---

## 7. Segurança e conformidade

- **Não** confiar apenas no front para esconder menus: **Firestore rules** + **Functions** para operações sensíveis.
- **Admin** não deve poder elevar a si mesmo a **dev** sem um processo (ex.: só via Function assinada ou console Firebase).
- **LGPD:** dados de cliente em O.S — definir **retention** (tempo de guarda) e **export/exclusão** se aplicável.
- **Backup:** export periódico Firestore ou replicação.

---

## 8. Roadmap de implementação (sugerido)

### Fase A — Fundações (2–4 semanas, dependendo do tempo disponível)

- App novo no repositório em branco: **roteamento**, **tema**, **Auth** com claims.
- **Cadastro de usuários** no projeto Firebase novo (formulário admin, convite por e-mail, ou carga manual inicial) — **sem** pipeline de migração obrigatória a partir do Firestore legado.
- **Regras Firestore** e **indexes** definidos no projeto novo; validar com **emuladores** antes de produção.

### Fase B — Motor de templates (3–6 semanas)

- Editor de campos (JSON Schema leve ou builder interno).
- Preview e cópia para clipboard (como hoje).
- Export PDF opcional (ex.: `jspdf` / `html2canvas`, conforme dependências do projeto novo).

### Fase C — Migração de conteúdo (contínua)

- Priorizar fluxos por volume de uso.
- Manter links antigos com redirect.

### Fase D — Consolidação

- Desativar hosting estático antigo ou deixar só `index.html` de redirecionamento.
- Documentação interna para “como criar um novo fluxo” sem deploy.

---

## 9. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Escopo explode ao tentar paridade 1:1 com 200+ páginas | Priorização + MVP por setor; fluxos similares unificados com **variantes** no mesmo template. |
| Regras Firebase complexas | Começar com claims simples; refinar; testes com emulador. |
| Resistência dos usuários | Período de transição com URLs antigas funcionando. |

---

## 10. Próximos passos práticos (para você e para o desenvolvimento)

1. **Validar** com stakeholders: admin é **global** ou **por setor**? Financeiro/comercial: quais fluxos de O.S?
2. **Inventariar** os 10 fluxos mais usados no legado (ex.: pasta `suporte/` do projeto antigo), para priorizar o motor de templates — sem necessidade de manter esse código no novo repo.
3. **Criar o projeto Firebase novo** (Auth, Firestore, Hosting, Functions conforme necessidade); usar **emuladores** no dia a dia até as regras estarem estáveis.
4. **Opcional antes do desligamento do banco antigo:** export manual de dados que a empresa queira arquivar (CSV/JSON); **não** é requisito do sistema novo carregar esse histórico automaticamente.

---

## 11. Referências ao repositório legado (apenas consulta)

Se ainda tiver acesso ao projeto antigo, estes arquivos ajudam a entender o que **não** repetir e que ideias **reaproveitar** (conceitos, não dados):

- Divisão documentada: `README.md` (dois sistemas).
- Hosting duplo: `firebase.json` (`gerador` vs `upgrades`).
- React legado: `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/pages/DashboardPage.tsx`.
- Antipadrão de regras: `firestore.rules` (e-mails fixos).
- Lista de operadores estática: `js/operadores.json`.
- Placeholder O.S: `src/pages/OSPage.tsx`.

---

## 12. Stack e versões (baseline sugerido)

Fixar isto no `README` do repo novo evita que assistentes de IA ou novos devs “inventem” stack paralela.

| Camada | Escolha | Observação |
|--------|---------|------------|
| **Runtime** | Node.js **LTS** atual (ex.: 20.x ou 22.x) | Definir `.nvmrc` ou `engines` no `package.json`. |
| **App web** | **Vite** + **React 18** + **TypeScript 5** | Preferível a CRA (manutenção reduzida). |
| **UI** | **MUI 5** ou **MUI 6** (uma versão só; não misturar) | Alternativa: shadcn/ui + Tailwind — só se quiser fugir do MUI de propósito. |
| **Roteamento** | **React Router 6** | |
| **Backend BaaS** | **Firebase** novo: Auth (e-mail/senha no MVP), Firestore, Hosting | Functions na primeira ou segunda iteração, conforme necessidade de claims via servidor. |
| **Lint/format** | ESLint + Prettier (opcional no v0.1) | |

Variáveis de ambiente (exemplo): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc. — prefixo **`VITE_`** obrigatório no Vite.

---

## 13. MVP v0.1 — escopo fechado (primeiro entregável)

**Em uma frase:** um usuário autenticado vê apenas o **painel do seu setor**, consegue abrir **um** fluxo de O.S de demonstração baseado em **template versionado** (campos + texto gerado), e existe papel **dev** com visão total e papel **admin** capaz de **criar usuário** (ou convidar) com setor + hierarquia.

### Inclui (mínimo viável)

- Login / logout (Firebase Auth).
- Documento de perfil em Firestore (`users/{uid}` ou equivalente): `sector`, `hierarchy`, flags `isDev`, `isAdmin` (ou claims espelhados — ver nota abaixo).
- **Shell** da aplicação: layout com menu; itens **filtrados pelo setor**; rota 404 / acesso negado coerente.
- **Um** template de O.S cadastrado (via seed ou tela simples admin): schema mínimo (ex.: cliente, protocolo, bairro) + template de saída com placeholders.
- Tela **Gerar O.S**: preenche campos → **preview** do texto → **copiar para área de transferência** (e opcionalmente export PDF na v0.2).
- Pelo menos **dois** usuários de teste: um `operador` em `suporte`, um `isDev` (você) com acesso a tudo.

### Fora do MVP v0.1 (de propósito)

- Paridade com os 200+ HTML do legado.
- Módulo completo de Upgrades, comissões, questionários.
- Multi-tenant complexo, relatórios avançados, auditoria completa.

### Nota sobre claims no MVP

- **Opção A (rápida):** só Firestore para perfil + regras baseadas em campos do documento `users/{uid}` (e `request.auth.uid`).
- **Opção B (melhor):** Cloud Function para definir **Custom Claims** ao criar/editar usuário; regras usam `request.auth.token`. Pode ser **v0.2** se atrasar o primeiro deploy.

---

## 14. Ordem de execução (bootstrap do projeto)

Ordem recomendada para não refazer trabalho:

1. Criar **repositório** e commit inicial (`.gitignore`, licença se houver).
2. Criar **projeto Firebase** novo no console; anotar credenciais web.
3. Ativar **Authentication** (e-mail/senha).
4. Criar **Firestore** em modo restrito; subir **`firestore.rules` mínimas** (só usuário lê o próprio perfil; dev/admin conforme desenho).
5. Scaffold **Vite + React + TS**; configurar variáveis `VITE_*`.
6. Implementar **Auth** (login/logout) + leitura do **perfil** pós-login.
7. Implementar **roteamento protegido** + **menu por setor**.
8. Modelar **template** + **render** + **uma tela** de geração.
9. Tela ou script **admin** para criar usuário de teste (ou Firebase Console na primeira vez).
10. **Deploy** Hosting (staging) quando o fluxo login → gerar texto estiver estável.

---

## 15. Passo a passo “Dia 1” (checklist operacional)

Use como prompt ou checklist no Cursor no primeiro dia útil:

1. `npm create vite@latest` → nome do app → **React** + **TypeScript**.
2. Instalar dependências: `firebase`, `react-router-dom`, `@mui/material` + `@emotion` (e ícones se precisar).
3. Adicionar arquivo `.env.local` com as chaves do Firebase (**não** commitar; usar `.env.example` sem valores).
4. Criar `src/lib/firebase.ts` inicializando `getAuth`, `getFirestore`.
5. No Firebase Console: criar **usuário** manualmente para você com e-mail/senha.
6. Criar coleção `users` manualmente **ou** primeira Cloud Function / formulário admin — **um** documento `users/{uid}` com `sector`, `hierarchy`, `isDev: true`.
7. Página `/login` + redirect pós-login para `/` (dashboard do setor).
8. Placeholder “Gerador de O.S (demo)” com um `textarea` de resultado e botão copiar — depois substituir pelo motor de template.

---

## 16. Critérios de pronto (Definition of Done) — MVP v0.1

O MVP está **pronto** quando **todas** as afirmações abaixo forem verdadeiras:

| # | Critério |
|---|----------|
| 1 | Usuário não autenticado **não** acessa rotas internas (redirect para login). |
| 2 | Perfil no Firestore (ou claims) determina **setor** e **hierarquia**; o menu **não** exibe módulos de outros setores para usuário comum. |
| 3 | Usuário com `isDev` (ou equivalente) **vê** todas as áreas ou ferramentas de debug acordadas (mesmo que stub). |
| 4 | Usuário com `isAdmin` **consegue** criar outro usuário ou instruir criação sem editar código (mesmo que o primeiro admin seja só você via console no v0.1 — documentar exceção). |
| 5 | Existe **pelo menos um** template cadastrado e **geração** produz texto determinístico a partir dos campos (reproduzível). |
| 6 | Regras do Firestore **impedem** leitura/escrita cruzada indevida (testar com segunda conta). |
| 7 | `README` do repo descreve: como rodar localmente, variáveis de ambiente, e como criar o primeiro usuário dev/admin. |

---

**Este documento é o ponto de partida técnico para um greenfield controlado:** **repositório novo**, **projeto Firebase novo**, **sem dependência do Firestore legado** (descontinuação prevista). As seções **12–16** fecham o que faltava para assistentes de IA e humanos **começarem do zero** com escopo, ordem e critérios de “pronto” alinhados.

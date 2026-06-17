# Security Review — MZ NET Plataforma

Revisão gerada pelo agent `security-reviewer` (ECC).
Data: 2026-06-17

---

## 🔴 CRITICAL (resolver com prioridade)

### C-1 — Credenciais Firebase hardcoded na extensão Chrome
**Arquivo:** `ceps/src/firebase.ts` linhas 6–12

As credenciais do Firebase (`apiKey`, `authDomain`, `projectId`, `appId`, etc.) estão literalmente no código-fonte da extensão. Isso significa que estão no histórico do git e em qualquer build distribuído.

A versão web faz certo — usa `import.meta.env.VITE_*`. A extensão precisa seguir o mesmo padrão.

**Como corrigir:**
1. Criar `ceps/.env.local` com as variáveis `VITE_FIREBASE_*`
2. Substituir os valores hardcoded por `import.meta.env.VITE_FIREBASE_API_KEY` etc. em `ceps/src/firebase.ts`
3. Rotacionar a API key do Firebase no Google Cloud Console (já que ficou exposta no histórico)

> **Nota:** A `apiKey` do Firebase web é inerentemente pública (só identifica o projeto — a segurança real vem das Firestore/Auth rules). O risco maior aqui é o padrão ruim que pode se repetir com credenciais que SÃO secretas, como as do MK Solutions.

---

### C-2 — Token do Mapbox pode estar no histórico git
**Arquivo:** `web/.env.local` linha 9

O `.env.local` está no `.gitignore`, mas se foi commitado uma vez o token fica na história para sempre.

**Como verificar:**
```bash
git log --all --full-history -- web/.env.local
```

**Como corrigir se aparecer no histórico:**
1. Rotacionar o token em `account.mapbox.com`
2. No painel do Mapbox, restringir o token por URL (domínio do Firebase Hosting)
3. Usar `git filter-repo` para remover o arquivo do histórico (opcional, mas recomendado)

---

## 🟠 HIGH (resolver antes do go-live da integração MK)

### H-1 — Qualquer operador lê todos os registros de upgrades
**Arquivo:** `firestore.rules` linha ~202

A regra atual permite que qualquer usuário autenticado e ativo leia a coleção `upgrades` completa, incluindo registros de outros operadores. A restrição existe só na UI.

**Como corrigir:**
```
allow read: if isActiveUser() && (
  isUpgradeManager() || resource.data.operadorId == request.auth.token.email
);
```

---

### H-2 — Anexos de tickets acessíveis por qualquer usuário autenticado
**Arquivo:** `storage.rules` linhas 9–15

Qualquer usuário autenticado pode acessar diretamente o Storage de qualquer ticket, mesmo que o Firestore restrinja a leitura do ticket em si.

**Como corrigir (longo prazo):**
Gerar URLs assinadas de curta duração via Cloud Function ao invés de armazenar URLs permanentes no Firestore.

**Como corrigir (curto prazo):**
Adicionar validação de ownership na regra de Storage, mesmo que seja uma checagem simplificada por path.

---

### H-3 — Nenhum header de segurança no Firebase Hosting
**Arquivo:** `firebase.json`

Não há `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` nem `Referrer-Policy` configurados. Isso é especialmente crítico antes de adicionar a integração com o MK.

**Como corrigir — adicionar ao `firebase.json`:**
```json
"headers": [{
  "source": "**",
  "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://firebasestorage.googleapis.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://viacep.com.br https://brasilapi.com.br https://nominatim.openstreetmap.org https://api.mapbox.com https://*.tiles.mapbox.com; frame-ancestors 'none';"
    }
  ]
}]
```
> Lembrar de adicionar o domínio do MK Solutions no `connect-src` quando as credenciais chegarem.

---

### H-4 — Alerta preventivo: credenciais do MK Solutions
**Arquivo:** (ainda não implementado)

Antes de implementar qualquer integração com o MK, atenção: o token e a contra-senha do MK **nunca podem entrar no bundle do Vite/React**. São credenciais server-side.

**Arquitetura correta:**
- Credenciais ficam nas variáveis de ambiente do Firebase Functions (ou Google Cloud Secret Manager)
- O frontend chama uma Cloud Function
- A Cloud Function chama o MK e retorna só o que o cliente precisa
- O browser nunca vê o token nem a contra-senha

Se o MK tiver allowlist por IP, registrar o IP da Cloud Function (não o IP do browser).

---

## 🟡 MEDIUM (melhorias importantes, sem urgência imediata)

### M-1 — Email do owner em texto puro no bundle
**Arquivo:** `web/src/lib/protectedUserManagement.ts` linha 2

```ts
export const PROTECTED_ACCOUNT_EMAIL_LOWER = 'ramonyml@gmail.com'
```

O email fica visível no bundle compilado para qualquer um que inspecionar o JS.
**Fix:** Mover para variável de ambiente `VITE_PROTECTED_ACCOUNT_EMAIL`.

---

### M-2 — Sem limite de anexos no Firestore (só no client-side)
**Arquivo:** `firestore.rules` linhas ~327–344

O limite de 5 anexos por comentário é validado só no JavaScript. Uma chamada direta ao Firestore SDK ignora esse limite.
**Fix:** Adicionar validação do tamanho do array `attachments` nas regras do Firestore.

---

### M-3 — `console.error` com objetos brutos em produção
**Arquivos:** `UpgradeTable.tsx`, `UpgradeForm.tsx`, `UpgradeAnalyticsDashboard.tsx` e outros

Erros internos do Firebase (caminhos, detalhes de regras) ficam visíveis no DevTools de qualquer usuário.
**Fix:** Desativar `console.*` em builds de produção via `define` no Vite, ou usar um logger estruturado.

---

### M-4 — `usersPublic` aceita campos extras
**Arquivo:** `firestore.rules` linhas ~96–110

A regra valida os tipos dos campos mas não restringe quais campos podem ser escritos.
**Fix:**
```
&& request.resource.data.keys().hasOnly(['displayName', 'photoURL', 'updatedAt'])
```

---

### M-5 — Dev server do Vite expõe toda a raiz do repo
**Arquivo:** `web/vite.config.ts` linha 13

`fs: { allow: [dir, repoRoot] }` permite que o servidor de desenvolvimento sirva qualquer arquivo do repositório. Risco apenas em desenvolvimento, mas vale estreitar.

---

## ✅ O que está bem feito

- Zero `dangerouslySetInnerHTML` em todo o codebase
- Web app usa `import.meta.env.VITE_*` corretamente para Firebase
- Regras do Firestore têm catch-all `allow read, write: if false` no final
- Firebase Auth correto — sem senhas em texto puro em nenhum lugar
- Upload de arquivos valida MIME type e tamanho tanto no client quanto no Storage rules
- `RequireAuth` aguarda `initializing` antes de redirecionar (evita flash de tela)
- Busca de CEP sanitiza o input para dígitos antes de montar a URL
- Template de O.S gera texto puro — sem risco de injeção de HTML

---

## Ordem de prioridade sugerida

```
1. C-1 — Corrigir firebase.ts da extensão + variáveis de ambiente
2. C-2 — Verificar histórico git do .env.local + rotacionar Mapbox se necessário
3. H-3 — Adicionar headers de segurança no firebase.json (rápido de fazer)
4. H-4 — Definir arquitetura da Cloud Function antes de implementar o MK
5. H-1 — Corrigir regra de leitura da coleção upgrades no Firestore
6. H-2 — Revisar Storage rules dos tickets
7. M-1 até M-5 — Melhorias incrementais
```

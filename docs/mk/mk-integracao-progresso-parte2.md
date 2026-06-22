# MK Solutions — Progresso da Integração (Parte 2)
> Documento de continuidade — última atualização: 2026-06-21
> Leia a Parte 1 (`mk-integracao-progresso.md` na raiz) antes deste.

---

## Status geral

| Etapa | Status |
|---|---|
| Autenticação MK em produção | ✅ Funcional |
| Migração de credenciais para Secret Manager | ✅ Concluída |
| Criação de atendimento | ✅ Funcional (validado nos testes da Parte 1) |
| Criação de OS | ⏳ Pendente — aguarda `CodigoConexao` |

---

## 1. O que foi feito nesta sessão (2026-06-21)

### Problema encontrado
Ao tentar rodar a integração MK em produção (Cloud Functions deployadas), a autenticação falhava silenciosamente. Localmente no emulador tudo funcionava. O erro era difícil de rastrear porque a função retornava apenas "MK auth falhou" sem a resposta completa do servidor.

### Causa raiz identificada
O `echo` do PowerShell — usado para cadastrar as secrets no Google Cloud Secret Manager via `echo "valor" | gcloud secrets versions add` — adiciona um caractere `\n` (newline) invisível ao final da string. Esse `\n` era passado junto com o token e a senha na URL da requisição para o MK, que rejeita a autenticação silenciosamente sem retornar erro claro.

### Solução aplicada — commits desta sessão

#### `abffd88` — Migração das credenciais para Secret Manager
- `MK_TOKEN` e `MK_WEBSERVICE_PASSWORD` removidos do `functions/.env` e migrados para o **Google Cloud Secret Manager** usando `defineSecret()` do Firebase Functions SDK
- `functions/.env` passou a conter apenas variáveis não-sensíveis (`MK_BASE_URL`, `MK_MODE`) e foi liberado no `.gitignore` para poder ser versionado sem risco
- Todos os helpers (`mkGet`, `mkAuth`, `mkCriarAtendimento`, `mkCriarOS`) passaram a receber um objeto `MkConfig` por parâmetro em vez de ler constantes globais — necessário porque `defineSecret().value()` só pode ser chamado dentro do handler da função, não no carregamento do módulo

#### `1b3193a` — Adiciona .env com variáveis não-sensíveis
- `functions/.env` commitado com `MK_BASE_URL` e `MK_MODE` (sem dados sensíveis)

#### `1d78da5` — Fix do trim nos secrets (**o que resolveu o problema em produção**)
- `.trim()` aplicado em todos os valores lidos do Secret Manager:
  ```typescript
  baseUrl:  _mkBaseUrl.value().replace(/\/$/, '').trim(),
  token:    _mkToken.value().trim(),
  password: _mkPass.value().trim(),
  shadow:   _mkMode.value().trim() !== 'real',
  ```
- Log de erro detalhado adicionado ao `mkAuth` para facilitar diagnóstico futuro:
  ```typescript
  console.error('[MK] auth falhou — resposta completa:', JSON.stringify(data))
  ```
- Criado `web/.env.production` para garantir que o build de produção nunca aponte para o emulador local (o Vite carrega `.env.local` em todos os modos; `.env.[mode]` tem prioridade e sobrescreve):
  ```env
  VITE_USE_FIREBASE_EMULATORS=false
  VITE_USE_FUNCTIONS_EMULATOR=false
  ```

---

## 2. Arquitetura de credenciais atual (pós-migração)

```
functions/.env (versionado, sem segredos)
  MK_BASE_URL=https://sistema.mznet.com.br
  MK_MODE=real

Google Cloud Secret Manager (não versionado, acesso por IAM)
  MK_TOKEN          → token de autenticação da API MK
  MK_WEBSERVICE_PASSWORD → senha do webservice MK
```

Para atualizar uma secret em produção:
```powershell
# Usar printf para evitar o \n que o echo do PowerShell adiciona
printf 'valor_sem_newline' | gcloud secrets versions add NOME_DA_SECRET --data-file=-
```

> ⚠️ **Nunca use `echo "valor" | gcloud secrets versions add`** — o PowerShell sempre adiciona `\n` ao final, que vai junto na secret e quebra a autenticação.

---

## 3. Estado atual da integração MK em produção

A autenticação está **funcional em produção**. O fluxo testado e validado:

```
1. Cloud Function mkSuporte acionada pelo app React
2. getMkConfig() lê MK_TOKEN e MK_WEBSERVICE_PASSWORD do Secret Manager (com .trim())
3. mkAuth() chama WSAutenticacao.rule → retorna sessionToken válido ✅
4. mkBuscarClientePorCpf() chama WSMKConsultaDoc.rule → retorna CodigoPessoa ✅
5. mkCriarAtendimento() chama WSMKNovoAtendimento.rule → retorna CodigoAtendimento ✅
6. mkCriarOS() chama WSMKCriarOrdemServico.rule → ⏳ BLOQUEADO (ver Parte 1, seção 9)
```

---

## 4. Próximo passo (quando retomar)

O único bloqueio restante é a criação de OS, que exige o campo `CodigoConexao`. Ver Parte 1 seção 10 para os dois caminhos de busca. O fluxo completo está documentado lá.

Quando `CodigoConexao` estiver disponível, a integração end-to-end estará pronta para ser conectada aos formulários de OS.

---

## 5. Organização dos documentos MK

Todos os MDs da integração MK devem ficar em `docs/mk/`:

| Arquivo | Conteúdo |
|---|---|
| `mk-integracao-progresso.md` (raiz) | Parte 1 — descoberta da API, testes, endpoints, bloqueio na OS |
| `docs/mk/mk-integracao-progresso-parte2.md` | **Este arquivo** — credenciais, fix do trim, produção funcional |
| `mk-integracao-briefing.md` (raiz) | Briefing original do escopo da integração |
| `mk-priorizacao.html` / `.md` (raiz) | Priorização dos fluxos a integrar |

> Sugestão: mover os arquivos da raiz para `docs/mk/` em uma sessão futura para centralizar tudo.

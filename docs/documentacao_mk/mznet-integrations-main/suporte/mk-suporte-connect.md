# Skill: mk-suporte-connect

Guia a implementação das conexões entre o gerador-os (Firebase) e a API do MK
Solutions. Roda em loop: uma tarefa por vez, do zero até o CURL validado.

---

## Contexto do projeto

- **Produto:** gerador-os — plataforma Firebase (React + Cloud Functions) usada
  pelo suporte técnico da MZ NET para abrir protocolos e ordens de serviço.
- **Objetivo:** automatizar via API as 186 tarefas do catálogo, eliminando o
  copia-e-cola manual no MK Solutions.
- **Onde o código vai:** `gerador-os/functions/src/mk-suporte.ts` (arquivo único
  com todas as funções — não criar um arquivo por tarefa).
- **Progresso:** `mznet-integrations/suporte/PROGRESSO.md`.
- **Catálogo de tarefas:**
  ```bash
  gh api repos/RamonyML/gerador-os/contents/CATALOGO-DEMANDAS-SUPORTE.md \
    --jq '.content' | base64 -d
  ```
- **Docs da API MK:** `mznet-integrations/docs/mk/mk-apis-especiais.txt` e
  `mk-apis-gerais.txt`.

---

## Passo 0 — Verificação automática de credenciais

Rode `firebase functions:config:get --project gerador-de-os-3ba02` e confirme:

```
mk.base_url   → ex: http://192.168.x.x:8080
mk.user       → usuário de autenticação
mk.password   → senha de autenticação
mk.mode       → deve ser "shadow"
```

- Tudo presente e `mk.mode=shadow`: siga silenciosamente.
- `mk.mode` ausente: sete agora:
  ```
  firebase functions:config:set mk.mode="shadow" --project gerador-de-os-3ba02
  ```
- Credenciais ausentes: PARE e informe o junior:
  > "Pegue as credenciais no 1Password (entrada: MK Solutions API) e rode:
  > ```
  > firebase functions:config:set mk.base_url="..." mk.user="..." mk.password="..." mk.mode="shadow" --project gerador-de-os-3ba02
  > ```
  > Depois rode a skill novamente."
- Firebase CLI ausente: PARE:
  > "Instale com `npm i -g firebase-tools` e autentique com `firebase login`."

---

## Passo 1 — Ler o progresso

Localize o `mznet-integrations` na máquina. Se não souber o caminho, pergunte
uma vez e memorize para a sessão.

Leia `PROGRESSO.md` e encontre a primeira linha com `⏳ pendente`.
Se todas estiverem `✅ feito`: parabenize e encerre.

---

## Passo 2 — Detectar agrupamento

Antes de implementar, verifique se a tarefa atual é **variante** de outra já
implementada (mesmo padrão, mesma sequência de chamadas MK, só textos
diferentes).

Sinais de variante: mesmo subcategoria no catálogo, caminhos como
`luz-padrao1`, `luz-padrao2`, `luz-padrao3` ou sufixos `pj`, `isento`,
`ocasionado` de uma pasta que já tem uma tarefa `✅ feito`.

- **É variante:** não cria função nova. Adiciona uma entrada no arquivo de
  configuração de textos `gerador-os/functions/src/mk-textos.ts` e marca
  a tarefa como feita. Vai direto para o Passo 6.
- **É a primeira da subcategoria:** implementa a função genérica agora e cria
  o `mk-textos.ts` com a primeira entrada.

---

## Passo 3 — Ler o código-fonte da tarefa

O catálogo traz o caminho do arquivo em `legado-exemplo/suporte/`. Busque no
GitHub:

```bash
gh api repos/RamonyML/gerador-os/contents/legado-exemplo/suporte/[caminho] \
  --jq '.content' | base64 -d
```

Extraia:
1. **Campos do formulário** — IDs de `<input>` e `<select>` editáveis (ignore `readonly`).
2. **Função `gerarTextos()`** — templates de `textoProtocolo` e `textoAgenda`/`textoOS`.
3. **Tipo de saída:**
   - `textoOS` ou `textoAgenda` com visita técnica → Padrão A
   - `textoAgenda` de loja (cliente vai buscar) → Padrão A, tipo OS diferente
   - Só `textoProtocolo` → Padrão B
4. **CPF no formulário?** Se não houver campo CPF/CNPJ ou `cd_cliente`:
   > "Este formulário não tem campo de CPF. A função não consegue consultar o
   > cliente no MK sem ele. Adicione o campo `cpf` no componente React
   > correspondente antes de continuar. Me avise quando feito."

---

## Passo 4 — Identificar o padrão

| Padrão | Sequência MK | Quando |
|--------|-------------|--------|
| **A** | autenticar → consultarCliente → criarProtocolo → criarOS | Visita técnica ou atendimento loja |
| **B** | autenticar → consultarCliente → criarProtocolo | Remoto sem OS |
| **C** | autenticar → atualizarOS | Feedback / encerramento |
| **D** | autenticar → consultarCliente → criarProtocolo → criarOS → novoContrato | Alteração de plano com troca |
| **E** | Analisar individualmente | Casos especiais |

---

## Passo 5 — Verificar códigos MK necessários

Para o padrão identificado, verifique quais códigos são necessários
(`CodigoTipoOS`, `CodigoGrupoServico`, etc.) e se já estão no Firebase Config:

```bash
firebase functions:config:get --project gerador-de-os-3ba02
```

Para cada código ausente, pergunte ao junior **uma vez** e salve imediatamente:

```bash
firebase functions:config:set mk.tipo_os_visita_tecnica="CODIGO" --project gerador-de-os-3ba02
```

Convenção de nomes no config:
- `mk.tipo_os_[slug]` → CodigoTipoOS
- `mk.grupo_[slug]` → CodigoGrupoServico
- `mk.classif_[slug]` → ClassificaçãoAtendimento

---

## Passo 6 — Implementar

**Arquivo:** `gerador-os/functions/src/mk-suporte.ts`

Se o arquivo não existe, crie com os imports base:

```typescript
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { defineString } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

const MK_BASE_URL = defineString('MK_BASE_URL')
const MK_USER     = defineString('MK_USER')
const MK_PASSWORD = defineString('MK_PASSWORD')
const MK_MODE     = defineString('MK_MODE')

const REGION = 'southamerica-east1'
const CORS_OPTS = {
  region: REGION,
  cors: [
    /^http:\/\/localhost(?::\d+)?$/,
    /^https:\/\/[\w.-]+\.web\.app$/,
    /^https:\/\/[\w.-]+\.firebaseapp\.com$/,
  ],
}

// helpers compartilhados (autenticar, consultarCliente, criarProtocolo,
// criarOS, atualizarOS, novoContrato, logStep) — implementar uma vez, reusar.
```

**Arquivo de textos:** `gerador-os/functions/src/mk-textos.ts`

Centraliza os templates de todas as variantes:

```typescript
export const MK_TEXTOS: Record<string, {
  infoProtocolo: (d: Record<string, string>) => string
  descricaoOS:   (d: Record<string, string>) => string
}> = {
  'fonte-queimada-loja': {
    infoProtocolo: (d) => `${d.primeiroNome} ENTROU EM CONTATO POR ${d.canal}...`,
    descricaoOS:   (d) => `CLIENTE VIRÁ NA LOJA RECOLHER ${d.equip}...`,
  },
  // próximas variantes entram aqui
}
```

**Regras obrigatórias:**

1. **Shadow primeiro.** Se `MK_MODE = shadow`: loga payload em
   `mk_integration_log` e retorna sem chamar o MK.
2. **Logs em cada etapa:** `autenticacao`, `consulta_cliente`,
   `criar_protocolo`, `criar_os`, `atualizar_os`, `novo_contrato`.
3. **Sem credenciais em logs.** Campos sensíveis → `[REDACTED]`.
4. **Idempotência.** Antes de processar, checar se já existe registro
   `sucesso=true` para o mesmo `cpf + task` em `mk_integration_log`.
5. **Exportar a função** em `functions/src/index.ts`:
   ```typescript
   export { mkNomeDaFuncao } from './mk-suporte'
   ```

---

## Passo 7 — CURL de teste

Gere o CURL para o junior rodar com o emulator local em shadow:

```bash
curl -X POST \
  http://127.0.0.1:5001/gerador-de-os-3ba02/southamerica-east1/[nomeDaFuncao] \
  -H "Content-Type: application/json" \
  -d '{"data": { [campos da tarefa com valores de teste] }}'
```

Instrua:
> "Rode com `firebase emulators:start --only functions` e confirme:
> 1. Retornou 200 com `modo: shadow`
> 2. Documento apareceu em `mk_integration_log` no emulator
> 3. Nenhuma chamada foi ao MK"

Aguarde confirmação do junior antes de marcar como feita.

---

## Passo 8 — Marcar e commitar

Com CURL validado, atualize `PROGRESSO.md`:
```
| [#] | ... | ✅ feito |
```

Commit em `mznet-integrations`:
```
feat(mk-suporte): [tarefa] implementada — shadow validado
```

Commit em `gerador-os`:
```
feat(mk): [tarefa] padrão [X] shadow validado
```

---

## Passo 9 — Loop

Volte ao Passo 1 automaticamente. Só pare se o junior pedir ou se houver erro
bloqueante que ele precise resolver.

---

## Regras de ouro

- **Nunca vá para produção** sem CURL validado em shadow.
- **Nunca crie um arquivo por tarefa.** Tudo vai em `mk-suporte.ts` + `mk-textos.ts`.
- **Variantes** só adicionam uma entrada em `mk-textos.ts` — sem nova função.
- **Padrão E:** proponha a abordagem ao junior antes de escrever código.
- **Dúvida de endpoint:** consulte os arquivos locais primeiro. Se não encontrar,
  sinalize ao junior para confirmar com o suporte MK.

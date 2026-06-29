# Guia de Refatoração — Integração MK nos Geradores de Suporte
> Documento de trabalho interno. Atualizado em 2026-06-29.

---

## Escopo

**Coberto:** todos os formulários de suporte técnico (`demandCategory` = manutencao, alteracao-plano, mudanca-endereco, midia-tv, wifi-extend, senha-rede, feedback, termo-docs).

**Excluído:** instalação, cadastro, encerramentos de instalação — esses têm fluxo próprio e não entram neste guia.

---

## Fases

| Fase | O que muda | Estado |
|---|---|---|
| **1 — Protocolo** | Painel direito passa a usar `MkProtocolCards` para abrir atendimento e inserir comentários automaticamente no MK | ✅ Pronto para começar |
| **2 — O.S.** | Após o protocolo ser aberto, um novo card permite criar a O.S. no MK via `WSMKCriarOrdemServico` | ⏳ Aguarda códigos internos MK |

Este documento cobre a **Fase 1** em detalhe e a Fase 2 em esboço.

---

## Regras de formatação dos comentários MK

> Estas regras são fixas e se aplicam a **todos** os formulários integrados, sem exceção.

### 1. Campo `info` → `WSMKNovoAtendimento.rule`
- Enviado como **texto puro, sem HTML**.
- Corresponde ao primeiro bloco do texto (diagnóstico/situação do cliente, ex: `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU -23DBM SEM OSCILAÇÃO.`).
- O MK ERP exibe como a abertura do atendimento, com formatação padrão neutra (preto).
- **Nunca** envolver em `<h2>` ou qualquer outra tag.

### 2. Comentários → `WSMKAtendimentoComentario.rule`
- **Sempre** `tipo: 1` (privado).
- O **primeiro comentário** (`comentarios[0]` = Card 1 no `MkProtocolCards`) é enviado com `raw: true` → texto puro, sem `<h2>`. É o bloco diagnóstico ("CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU ...").
- Os demais comentários (Card 2+) são envolvidos em `<h2 style="color: red;">texto</h2>` via `wrapCommentHtml`.
- Isso garante aparência igual à inserção manual pelos operadores no MK ERP.
- Nunca passar `tipo: 2` em nenhum formulário de suporte.

### 3. Ordem e desbloqueio sequencial dos cards
- Card 0 (Abertura do atendimento): habilitado assim que a conexão do cliente for encontrada.
- Card N (Comentário N): habilitado **apenas quando o Card N-1 tiver sido enviado com sucesso ao MK**.
- O operador não pode pular um card — o botão "Inserir no MK" fica desabilitado até o anterior ser confirmado.
- Isso garante que os comentários sejam inseridos na ordem correta e que o `atendimentoId` seja obtido antes de qualquer comentário.
- **Implementado em `MkProtocolCards.tsx`** via `prevState` calculado por índice: `i===1 → card0State`, `i>1 → commentStates[i-1]`.

---

## O padrão-alvo (referência: `senha-altera-senha`)

O formulário de Alteração de SSID / Senha é o único já refatorado. Ele serve de modelo para todos os outros. O que ele tem que os demais ainda não têm:

**Painel direito atual (maioria dos formulários):**
```
[Título]  [Salvar O.S.]  [Copiar seção]  [Copiar tudo]
[Alert: campos ok/faltando]
[Tabs: Protocolo | Texto O.S. | Texto Agenda]
[Preview do texto da aba selecionada — copy/paste manual]
```

**Painel direito alvo (Fase 1 — layout atual em produção):**
```
[Título]  [Salvar O.S.]
[Alert: campos ok/faltando]
┌──────────────────────────────────────────────────────┐
│  [Protocolo]  [O.S.]  [Agenda]   ← abas              │
├──────────────────────────────────────────────────────┤
│  ABA PROTOCOLO:                                       │
│    [Buscar cliente / selecionar conexão]              │
│                                                       │
│  ←  ┌─────────────────────────────────┐  →           │
│     │ COMENTÁRIO 2 DE 5               │              │
│     │ texto do card atual             │              │
│     │ [📋 Copiar] [📤 Inserir no MK]  │              │
│     └─────────────────────────────────┘              │
│     ████████░░░░░░░  2 de 5 enviados    [Reiniciar]  │
│                                                       │
│  ABA O.S.:                                            │
│    Texto da O.S. (copy-only)                          │
│    [Criar O.S. no MK] ← só se tipoOS configurado     │
│                                                       │
│  ABA AGENDA:                                          │
│    Texto da Agenda (copy-only)                        │
│    [Copiar texto da agenda]                           │
└──────────────────────────────────────────────────────┘
```

**Comportamento das setas e progresso:**
- As setas `←` / `→` navegam entre os cards (Card 0 = Abertura, Card 1..N = Comentários).
- A barra de progresso avança conforme os cards são enviados ao MK.
- Após enviar um card com sucesso, o sistema avança automaticamente para o próximo (600 ms de delay).
- Ao enviar o último comentário, muda automaticamente para a aba **O.S.** (se o formulário tiver `tipoOS` configurado).

Para formulários que são **apenas protocolo** (ex: senha-altera-senha, feedback, termo-docs), o `MkProtocolCards` exibe somente a aba Protocolo — sem abas O.S. nem Agenda.

---

## Pré-requisitos antes de começar qualquer formulário

### Códigos MK — bloqueiam a implementação

Cada formulário precisa de dois códigos do MK:
- `processoId` — código do processo no MK para aquela categoria
- `classificacaoId` — código da classificação do atendimento (abertura = NORMAL = 3 na maioria)

> **Referência consolidada:** `docs/codigos_mk/CODIGOS_MK_REFERENCIA.md`
> Sempre que precisar verificar ou confirmar um `processoId`, `classificacaoId`, `tipoOS` ou `grupoServico`, **consulte esse arquivo primeiro** antes de usar `0` como placeholder.
> Ele contém a tabela "Combinações em produção" com todos os valores já levantados com o admin MK.

**Códigos confirmados (extraídos do CODIGOS_MK_REFERENCIA.md):**

| Categoria | processoId | classificacaoId | tipoOS | Estado |
|---|---|---|---|---|
| Senha/SSID Wi-Fi | 14 | 3 | — | ✅ Em produção |
| Manutenção (sem conexão) | 12 | 3 | — | ✅ Em produção |
| Manutenção (falha específica) | 17 | 3 | 3 (ONT queimada) | ✅ Em produção |
| Manutenção (outras solicitações) | 18 | 3 | — | ✅ Em produção |
| Manutenção (alterar Wi-Fi) | 14 | 3 | — | ✅ Em produção |
| Alteração de plano | 5 | 3 | 7 | ✅ Em produção |
| Mudança de endereço | 16 | 3 | — | ⏳ processoId levantado, pendente refatoração |
| Mídia TV (Roku) | 18 | 3 | 21 | ✅ Em produção |
| Wi-Fi Extend | — | — | — | ❌ pendente admin MK |
| Feedback | — | — | — | ❌ não mapeado |
| Termo de responsabilidade | 38 | 3 | 12 | ✅ Em produção |

> **Nunca registrar `processoId: 0` ou `classificacaoId: 0` se o código já constar no CODIGOS_MK_REFERENCIA.md.** Valores `0` ativam o banner "Integração pendente" no `MkProtocolCards` e indicam que a integração não está pronta para uso em produção.

---

## Arquitetura técnica da Fase 1

### Peças que já existem e não mudam

- `MkProtocolCards` — componente genérico; aceita `slug`, `cpf`, `processoId`, `classificacaoId`, `segmentos`, `disabled`, `onProtocoloGerado`
- `mkSuporte` (Cloud Function) — já trata `criar_protocolo` e `inserir_comentario`
- `buscar_conexao` — já implementado e funcional
- Toda a lógica de estado (idle/loading/ok/error) e exibição de cards

### O que muda em cada formulário

#### 1. Arquivo de dados (`web/src/data/<categoria>/nomeFormulario.ts`)

Adicionar a função `buildXxxSegmentos()` ao lado da `buildXxxTextos()` já existente.

**Padrão confirmado em produção (`manut-luz-vermelha` — 2026-06-26):**

Construir os segmentos **diretamente**, sem depender do split do texto de preview. O texto de preview (`buildXxxTextos`) continua inalterado para cópia manual. `buildXxxSegmentos` monta cada card como string independente.

```typescript
export function buildXxxSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  // Extrair e normalizar os valores (upper, digits, etc.)
  const v = ...

  // Segmentos compartilhados (constantes reutilizáveis entre variações)
  const sInformei = `INFORMEI QUE E NECESSARIO VISITA TECNICA...`
  const sOcasionado = `MAS, SENDO PROBLEMA OCASIONADO...`

  // Construir info + comentarios diretamente para cada variação (titular, terceiro, etc.)
  return {
    info: `${cp} ENTROU EM CONTATO POR ${canal} ...`,
    comentarios: [
      `QUESTIONADO, DISSE QUE...\nREMOTAMENTE VERIFIQUEI...`,  // \n = quebra dentro do card
      `ORIENTEI ${cp} A DESCONECTAR...`,
      `PERGUNTEI A ${cp} SE EFETUOU...`,
      sInformei,
      sOcasionado,
      `${cp} CONCORDOU...\n\nCLIENTE SEM DUVIDAS.`,
    ],
  }
}
```

**Regras:**
- Use `\n` dentro de um segmento para quebras de linha dentro do mesmo card.
- Cada card deve ficar **abaixo de 244 chars de conteúdo** (o chunker automático do MK cobre overflow, mas 244 é o limite seguro antes do wrapper HTML vermelho).
- Não há separadores no texto — os comentários são strings isoladas, não split de texto maior.
- O padrão antigo (split do texto de protocolo) ainda funciona para formulários simples, mas o padrão direto é preferido: maior controle granular e zero dependência de formatação visual.

#### 2. Registry central (arquivo novo: `web/src/data/mkProtocolRegistry.ts`)

Um mapa `slug → configuração` que centraliza tudo. Isso evita crescer o `OsGeneratorPage` com mais `if/else`.

```typescript
// web/src/data/mkProtocolRegistry.ts

import { buildAlteraSenhaSegmentos }    from './senhaRede/alteraSenha'
import { buildLuzVermelhaSegmentos }    from './manutencao/luzVermelha'
// ... demais imports

export type MkProtocolEntry = {
  processoId: number
  classificacaoId: number
  buildSegmentos: (v: Record<string, unknown>) => { info: string; comentarios: string[] }
}

export const MK_PROTOCOL_REGISTRY: Record<string, MkProtocolEntry> = {
  'senha-altera-senha': {
    processoId: 14,
    classificacaoId: 3,
    buildSegmentos: buildAlteraSenhaSegmentos,
  },
  // Manutenção (preencher quando admin MK fornecer os códigos)
  'manut-luz-vermelha':        { processoId: 0, classificacaoId: 0, buildSegmentos: buildLuzVermelhaSegmentos },
  'manut-luz-vermelha-pj':     { processoId: 0, classificacaoId: 0, buildSegmentos: buildLuzVermelhaPjSegmentos },
  // ... demais slugs
}
```

Quando `processoId: 0` ou `classificacaoId: 0`, o formulário não aparece como "integrado" ainda — a UI pode checar isso e mostrar um aviso ou desabilitar o botão "Abrir atendimento no MK".

#### 3. Auto-preenchimento do campo `protocolo`

Quando o Card 0 confirma a abertura do atendimento no MK, o número de protocolo gerado (`DDMM.XXXXX`) é automaticamente:
- Gravado em `values.protocolo` via `setValues`
- O campo `protocolo` no formulário é **desabilitado** automaticamente (`disabledFieldIds={new Set(['protocolo'])}` em `OsTemplateFieldsForm`)

O operador não precisa copiar/colar o número — ele aparece no campo já preenchido e travado.

> **Protocolo não é pré-requisito para geração de texto.** O campo `protocolo` é excluído da validação de `emptyFields` em `OsGeneratorPage` — ou seja, o preview dos textos e os MK cards ficam habilitados mesmo antes do protocolo ser gerado. Isso permite que o operador veja e revise os textos enquanto preenche os demais campos, sem travar o fluxo.

```typescript
// OsGeneratorPage.tsx
<MkProtocolCards
  ...
  onProtocoloGerado={(prot) => {
    setMkProtocoloGerado(prot)
    setValues((prev) => ({ ...prev, protocolo: prot }))
  }}
/>

<OsTemplateFieldsForm
  ...
  disabledFieldIds={mkEntry && mkProtocoloGerado ? new Set(['protocolo']) : undefined}
/>
```

#### 4. `OsGeneratorPage.tsx` — simplificação do painel direito

**O que sai:**
- O `useMemo` específico para `alteraSenhaSegmentos`
- A variável `showMkCards` com `slug === 'senha-altera-senha'` hardcoded

**O que entra:**
```typescript
import { MK_PROTOCOL_REGISTRY } from '../data/mkProtocolRegistry'

// No corpo do componente:
const mkEntry = selected ? (MK_PROTOCOL_REGISTRY[selected.slug] ?? null) : null

const mkSegmentos = useMemo(() => {
  if (!mkEntry || emptyFields.length > 0) return null
  return mkEntry.buildSegmentos(values)
}, [mkEntry, values, emptyFields.length])

const showMkCards = !!mkEntry && !!mkSegmentos
```

**No painel direito — lógica de renderização:**
```typescript
{showMkCards ? (
  <>
    <MkProtocolCards
      slug={selected.slug}
      cpf={String(values.cpf ?? '')}
      processoId={mkEntry.processoId}
      classificacaoId={mkEntry.classificacaoId}
      segmentos={mkSegmentos}
      disabled={emptyFields.length > 0}
    />
    {/* Accordion O.S. — só se o formulário tiver aba de O.S. */}
    {previewSections.some(s => s.id === 'os') && (
      <OsTextAccordion section={previewSections.find(s => s.id === 'os')!} />
    )}
    {/* Accordion Agenda — só se o formulário tiver aba de Agenda */}
    {previewSections.some(s => s.id === 'agenda') && (
      <OsTextAccordion section={previewSections.find(s => s.id === 'agenda')!} />
    )}
  </>
) : (
  /* preview atual com tabs — mantido intacto para formulários ainda não migrados */
  <Box ...>
    {multiPreviewTabs && <Tabs ... />}
    <Box component="pre" ...>{...}</Box>
  </Box>
)}
```

> `OsTextAccordion` seria um pequeno componente interno: um `Accordion` com o texto e um botão de cópia. Pode ser definido no próprio `OsGeneratorPage` sem extrair para arquivo separado.

---

## Lista de formulários e ordem de implementação

### Grupo 1 — Protocolo apenas (sem O.S., sem Agenda)
Migração mais simples: painel fica só com MkProtocolCards.

| Slug | Categoria |
|---|---|
| `senha-altera-senha` | senha-rede | ✅ Já integrado |
| `feedback-sem-sucesso` | feedback |
| `feedback-man-externa` | feedback |
| `feedback-man-ocasionado` | feedback |
| `feedback-troca-equip` | feedback |
| `feedback-mudanca-ponto` | feedback |
| `feedback-altplan` | feedback |
| `feedback-stb-roku` | feedback |
| `feedback-wifi-extend` | feedback |
| `termo-resp-padrao` | termo-docs |

### Grupo 2 — Protocolo + O.S. + Agenda (maioria das manutenções)
Painel fica com `MkProtocolCards` em três abas: **Protocolo** (paginado), **O.S.** e **Agenda**.

| Slug | Categoria |
|---|---|
| `manut-luz-vermelha` | manutencao |
| `manut-luz-vermelha-pj` | manutencao |
| `manut-luz-vermelha-isento` | manutencao |
| `manut-fibra-externa` | manutencao |
| `manut-ocas-conector` | manutencao |
| `manut-ocas-fibra` | manutencao |
| `manut-sinal-alto` | manutencao |
| `manut-realoc-fibra` | manutencao |
| `manut-mud-ponto-int` | manutencao |
| `manut-visita-testes` | manutencao |
| `manut-fonte-queimada` | manutencao |
| `manut-roteador-queimado` | manutencao |
| `manut-ont-queimada` | manutencao |
| `manut-onu-queimada` | manutencao |
| `manut-roteador-reset` | manutencao |
| `wifi-extend-zte` | wifi-extend |
| `wifi-extend-tplink` | wifi-extend |
| `wifi-extend-ponto` | wifi-extend |
| `midia-roku-padrao` | midia-tv |
| `midia-roku-presencial` | midia-tv |

### Grupo 3 — Protocolo + O.S. + Agenda (alteração de plano / mudança de endereço)
Mesmo layout de três abas do Grupo 2. Complexidade adicional: alguns desses têm botões especiais (ex: `Encerrar O.S.`, `Análise 90 dias`) no header do painel que precisam ser preservados.

| Slug | Observação |
|---|---|
| `altplan-remoto` | Tem botão "Encerrar O.S." — preservar |
| `altplan-presencial` | |
| `altplan-sem-troca-visita-isenta` | |
| `altplan-sem-troca-visita-paga` | |
| `altplan-troca-visita-isenta` | |
| `altplan-troca-visita-paga` | |
| `mud-end-padrao` | Tem botão "Análise 90 dias" — preservar |
| `mud-end-com-fibra` | Tem botão "Análise 90 dias" — preservar |
| `mud-end-buscar-equipamentos` | Tem botão "Análise 90 dias" — preservar |
| `mud-end-altplan-proposta` | Tem botão "Análise 90 dias" — preservar |
| `mud-end-altplan-pago` | Tem botão "Análise 90 dias" — preservar |
| `mud-end-inviabilidade` | Tema vermelho — sem integração MK nesta fase |

---

## O que NÃO muda na Fase 1

- O texto da O.S. continua sendo gerado localmente (mesmo `buildXxxTextos()`)
- O texto da Agenda continua sendo gerado localmente
- O botão "Salvar O.S." no histórico continua funcionando igual
- O modal "Agendar Visita" continua funcionando igual
- Os botões "Encerrar O.S." (altplan-remoto) e "Análise 90 dias" (mud-end) são preservados no header do painel direito
- Formulários **não** listados no `MK_PROTOCOL_REGISTRY` continuam com o comportamento atual (tabs + preview + copy)

---

## Fase 2 — Automação da O.S. (esboço)

Quando os códigos internos MK estiverem disponíveis (`CodigoTipoOS`, `CodigoGrupoServico`, `CodigoTecnico`), a Fase 2 habilita o botão **"Criar O.S. no MK"** na aba **O.S.** do `MkProtocolCards`:

```
ABA PROTOCOLO:
  Card 0: Abertura do atendimento   → "Abrir atendimento no MK"  ✅ (Fase 1)
  Card 1..N: Comentários            → "Inserir no MK"             ✅ (Fase 1)
  Barra de progresso

ABA O.S.:
  Texto da O.S. (copy-only)
  [Criar O.S. no MK]                → ativo quando card0Done      ⏳ (Fase 2 — já impl. para manut-ont-queimada)

ABA AGENDA:
  Texto da Agenda + [Copiar]        ✅ (Fase 1)
```

Para a Fase 2, o `MkProtocolEntry` precisará de dois campos extras:
```typescript
type MkProtocolEntry = {
  processoId: number
  classificacaoId: number
  buildSegmentos: (v) => { info: string; comentarios: string[] }
  // Fase 2:
  tipoOS?: number           // CodigoTipoOS do MK
  grupoServico?: number     // CodigoGrupoServico do MK
  buildOsTexto?: (v, operadorNome: string) => string  // texto da O.S.
}
```

---

## Checklist por formulário (Fase 1)

Para cada formulário do Grupo 2/3, executar em ordem:

- [ ] Garantir que o formulário tenha um campo com `id: 'cpf'` visível para todos os tipos de solicitação — sem ele o botão "Buscar cliente" do `MkProtocolCards` não funciona
- [ ] Adicionar `buildXxxSegmentos()` no arquivo de dados (construção direta de cards, sem split)
- [ ] Obter `processoId` e `classificacaoId` corretos do admin MK
- [ ] Adicionar entrada no `MK_PROTOCOL_REGISTRY`
- [ ] Para formulários com O.S.: verificar que o template emite uma seção `=== Texto O.S ===` (localizada por label em `mkOsTexto`)
- [ ] Para formulários com Agenda: verificar que o template emite uma seção cujo label não contém "Protocolo" nem "O.S" (localizada por label em `mkAgendaTexto`)
- [ ] Testar no formulário: busca de cliente → abertura (aba Protocolo) → comentários paginados → aba O.S. → aba Agenda
- [ ] Deploy

---

## Como começar (próximo passo imediato)

1. **Admin MK** preenche os códigos de `classificacaoId` e `processoId` para a categoria de Manutenção no `mk-codigos.json`
2. **Implementar o `MK_PROTOCOL_REGISTRY`** e a refatoração do `OsGeneratorPage` (a estrutura é genérica — pode ser feita antes mesmo de ter os códigos)
3. **Migrar um formulário piloto** do Grupo 1 (ex: `feedback-sem-sucesso` — mais simples, sem O.S. nem Agenda) para validar a arquitetura do registry
4. **Migrar o primeiro do Grupo 2** (ex: `manut-luz-vermelha` — o mais comum) usando os accordions de O.S./Agenda
5. Repetir para os demais em ordem

---

## Seleção de cadastro MK quando o CNPJ/CPF tem múltiplos registros

> Adicionado em 2026-06-26 — clientes PJ podem ter mais de um cadastro no MK para o mesmo CNPJ (ex.: mesma empresa, duas filiais/unidades distintas).

### Problema

`WSMKConsultaDoc` retorna **um único** `CodigoPessoa` para um CPF/CNPJ. Se o mesmo CNPJ tiver dois registros no MK (ex.: códigos 28713 e 18195), o sistema sempre resolve para o primeiro, e as conexões do segundo cadastro ficam inacessíveis.

### Solução implementada

**Backend (`functions/src/mk-suporte.ts`):**
- Ação `buscar_conexao` aceita agora o parâmetro opcional `clienteCodigo?: number`.
- Se fornecido, pula o `WSMKConsultaDoc` e chama diretamente o `WSMKConexoesPorCliente` com aquele código — retornando as conexões do cadastro correto.
- Ação `criar_protocolo` aceita também `clienteCodigo?: number`. Se fornecido, o atendimento é aberto para esse código sem refazer a busca por CPF.

**Frontend (`MkProtocolCards.tsx`):**
- Após encontrar o cliente via CPF, exibe um link discreto **"Outro cadastro MK?"** em laranja, logo abaixo das informações de conexão.
- Ao clicar, abre um campo inline: **"Código MK conforme Pessoas ou Empresas:"** + botão "Buscar".
- O operador consulta o código correto na tela de Pessoas/Empresas do MK ERP e digita aqui.
- A busca atualiza o nome do cliente e a lista de conexões para o cadastro informado.
- O `clienteCodigo` selecionado é propagado para `criar_protocolo`, garantindo que o atendimento seja aberto no cadastro certo.

### Fluxo para o operador

1. Clicar "Buscar cliente" — o sistema encontra o primeiro cadastro pelo CNPJ.
2. Se a conexão exibida não é a correta (ou diz "nenhuma conexão encontrada"), clicar **"Outro cadastro MK?"**.
3. No MK ERP, abrir **Workspace → Pessoas ou Empresas**, buscar pelo CNPJ e anotar o **Código** da linha correta.
4. Digitar esse código no campo e clicar "Buscar".
5. O painel atualiza com o nome e conexões do cadastro correto — prosseguir normalmente.

---

## Referências

- Componente de referência: [MkProtocolCards.tsx](../../web/src/components/MkProtocolCards.tsx)
- Função de segmentos de referência: [alteraSenha.ts#buildAlteraSenhaSegmentos](../../web/src/data/senhaRede/alteraSenha.ts)
- Cloud Function: `functions/src/mk-suporte.ts` — ações `criar_protocolo`, `buscar_conexao`, `inserir_comentario`
- Códigos MK: `docs/documentacao_mk/mznet-integrations-main/suporte/mk-codigos.json`

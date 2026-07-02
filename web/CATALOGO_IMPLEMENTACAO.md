# Guia de Implementação — Catálogo Centralizado

## Visão geral

O catálogo substitui listas hardcoded (roteadores, planos, canais, etc.) por dados
gerenciados no Firestore. O gerente edita pelo painel em `/admin/catalogo`; os
formulários carregam as opções em tempo real sem necessidade de deploy.

---

## Arquitetura

### Firestore
```
catalogo/{categoria}/itens/{itemId}
  label:  string   — texto exibido no select
  value:  string   — texto inserido na O.S./protocolo
  ativo:  boolean  — oculta sem excluir
  ordem:  number   — posição no select
  grupo?: string   — 'atual' | 'ofertado' (só categorias de planos)
```

### Categorias disponíveis (`CatalogoCategoria`)
| ID                | Uso                                         |
|-------------------|---------------------------------------------|
| `equipamentos`    | Roteadores e ONTs                           |
| `formas-pag`      | PIX, Dinheiro, Cartão, Mensalidade          |
| `canais`          | Telefone (LIGAÇÃO), WhatsApp                |
| `parentesco`      | Grau de vínculo nos formulários de terceiro |
| `planos-altplan`  | Planos para Alteração de Plano              |
| `planos-extend`   | Planos para Wi-Fi Extend                    |
| `planos-mudend`   | Planos para Mud End + Alt Plano             |

### Arquivos do catálogo
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/types/catalogo.ts` | Tipos (`CatalogoCategoria`, `CatalogoItem`, `PLAN_CATEGORIAS`) |
| `src/lib/catalogoFirestore.ts` | CRUD + seed (`importarPadraoCatalogo`) |
| `src/hooks/useCatalogo.ts` | Subscrição em tempo real por categoria |
| `src/data/catalogoSeedData.ts` | Dados padrão para importação inicial |
| `src/pages/CatalogoPage.tsx` | Painel de gerenciamento |

---

## Padrão de migração de um formulário

### Passo 1 — Adicionar `catalogCategoria` ao tipo `OsTemplateField`

Arquivo: `src/types/osTemplate.ts`

```typescript
import type { CatalogoCategoria, PlanGrupo } from './catalogo'

export interface OsTemplateField {
  // ... campos existentes ...

  /**
   * Quando definido, o select carrega as opções do Firestore (catálogo)
   * em vez de usar a lista hardcoded em `options`.
   * `options` pode ser omitido ou usado como fallback/loading.
   */
  catalogCategoria?: CatalogoCategoria

  /**
   * Para categorias de planos: filtra por 'atual' ou 'ofertado'.
   * Obrigatório quando catalogCategoria for 'planos-*'.
   */
  catalogGrupo?: PlanGrupo
}
```

### Passo 2 — Conectar ao renderizador

Arquivo: `src/components/OsTemplateFieldsForm.tsx`

No componente `HighlightSelect` (e no select normal), substituir:
```typescript
const options = f.options ?? []
```
por uma lógica que usa `useCatalogo` quando `f.catalogCategoria` estiver definido:

```typescript
// Hook auxiliar a ser adicionado dentro de OsTemplateFieldsForm:
function useCatalogoOptions(field: OsTemplateField): FieldOption[] {
  const cat = field.catalogCategoria
  const { items } = useCatalogo(cat ?? 'equipamentos')   // só chama se cat definido
  if (!cat) return field.options ?? []
  const filtered = field.catalogGrupo
    ? items.filter((i) => i.grupo === field.catalogGrupo)
    : items
  return filtered
    .filter((i) => i.ativo)
    .map((i) => ({ value: i.value, label: i.label }))
}
```

> **Atenção:** `useCatalogo` depende de `catalogCategoria` ser uma categoria válida.
> Para evitar chamadas desnecessárias ao Firestore, só instanciar o hook quando
> `catalogCategoria` estiver definido. Ver seção "Detalhe de implementação" abaixo.

### Passo 3 — Atualizar o arquivo do formulário

Remover a constante hardcoded e adicionar `catalogCategoria` ao campo:

```typescript
// ANTES
const ALTPLAN_ROTEADOR_OPTS = [
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
  // ...
]

export const ALTPLAN_REMOTO_FIELDS: OsTemplateField[] = [
  // ...
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    options: ALTPLAN_ROTEADOR_OPTS,
    layout: { md: 4 },
  },
]

// DEPOIS
export const ALTPLAN_REMOTO_FIELDS: OsTemplateField[] = [
  // ...
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    catalogCategoria: 'equipamentos',
    layout: { md: 4 },
  },
]
```

---

## Detalhe de implementação — hook condicional

`useCatalogo` usa `useEffect` com `categoria` como dependência, portanto chama o
Firestore mesmo quando `catalogCategoria` é `undefined`. O padrão correto é criar
um hook wrapper que só subscreve quando necessário:

```typescript
// src/hooks/useCatalogoOptions.ts  (novo arquivo)
import { useCatalogo } from './useCatalogo'
import type { OsTemplateField } from '../types/osTemplate'
import type { FieldOption } from '../types/osTemplate'

export function useCatalogoOptions(field: OsTemplateField): FieldOption[] {
  // Chamada incondicional (regra dos hooks) — mas categoria 'equipamentos'
  // é um fallback inofensivo; os dados só são usados quando cat !== undefined.
  const cat = field.catalogCategoria ?? 'equipamentos'
  const { items } = useCatalogo(cat)

  if (!field.catalogCategoria) return field.options ?? []

  const filtered = field.catalogGrupo
    ? items.filter((i) => i.grupo === field.catalogGrupo)
    : items

  return filtered
    .filter((i) => i.ativo)
    .map((i) => ({ value: i.value, label: i.label }))
}
```

---

## Ordem de migração recomendada

| Ordem | Categoria        | Motivo                                           |
|-------|-----------------|--------------------------------------------------|
| 1ª    | `equipamentos`  | Lista simples, sem grupo, fácil de validar       |
| 2ª    | `canais`        | Apenas 2 opções, crítico para todos os terceiros |
| 3ª    | `formas-pag`    | Vários formulários, validação rápida             |
| 4ª    | `parentesco`    | Autocomplete — padrão diferente dos outros       |
| 5ª    | `planos-*`      | Mais complexo (grupo atual/ofertado), deixar por último |

---

## Arquivos a migrar por categoria

### `equipamentos` (roteadores)

| Arquivo | Campo | Constante a remover |
|---------|-------|---------------------|
| `data/altplan/remoto.ts` | `roteador` | `ALTPLAN_ROTEADOR_OPTS` |
| `data/altplan/presencial.ts` | `roteador` | idem |
| `data/altplan/trocaVisitaPaga.ts` | `roteador` | idem |
| `data/altplan/trocaVisitaIsenta.ts` | `roteador` | idem |
| `data/altplan/semTrocaVisitaPaga.ts` | `roteador` | idem |
| `data/altplan/semTrocaVisitaIsenta.ts` | `roteador` | idem |
| `data/mudEnd/altplanPago.ts` | `roteador` | `ROTEADOR_OPTIONS` |
| `data/mudEnd/altplanProposta.ts` | `roteador` | idem |
| `data/wifiExtend/wifiExtendShared.ts` | `roteadorAtual` | `ROTEADOR_ATUAL_OPTS` |
| `data/encerramentoInst/padraoCasa.ts` | roteador | constante local |
| `data/encerramentoInst/padraoCasaExtend.ts` | roteador | constante local |

### `canais` (canal de contato)

| Arquivo | Campo | Constante a remover |
|---------|-------|---------------------|
| `data/altplan/remoto.ts` | `canal` | `CANAL_OPTS` |
| `data/altplan/presencial.ts` | `canal` | idem |
| `data/altplan/trocaVisitaPaga.ts` | `canal` | idem |
| `data/altplan/trocaVisitaIsenta.ts` | `canal` | idem |
| `data/altplan/semTrocaVisitaPaga.ts` | `canal` | idem |
| `data/altplan/semTrocaVisitaIsenta.ts` | `canal` | idem |
| `data/wifiExtend/wifiExtendShared.ts` | `canal` | `CANAL_OPTS` |
| `data/mudEnd/padrao.ts` | `canal` | constante local |
| `data/mudEnd/comFibra.ts` | `canal` | idem |
| `data/mudEnd/altplanPago.ts` | `canal` | idem |
| `data/mudEnd/altplanProposta.ts` | `canal` | idem |
| `data/mudEnd/equipamentos.ts` | `canal` | idem |
| `data/feedback/wifiExtend.ts` | `canal` | idem |
| `data/feedback/trocaEquip.ts` | `canal` | idem |
| `data/feedback/stbRoku.ts` | `canal` | idem |

### `formas-pag` (forma de pagamento)

| Arquivo | Campo | Constante a remover |
|---------|-------|---------------------|
| `data/altplan/trocaVisitaPaga.ts` | `formaPag` | `FORMA_PAG_OPTS` |
| `data/altplan/semTrocaVisitaPaga.ts` | `formaPag` | idem |
| `data/mudEnd/padrao.ts` | `formaPag` | constante local |
| `data/mudEnd/comFibra.ts` | `formaPag` | idem |
| `data/mudEnd/altplanPago.ts` | `formaPag` | idem |
| `data/mudEnd/altplanProposta.ts` | `formaPag` | idem |
| `data/mudEnd/equipamentos.ts` | `formaPag` | idem |
| `data/encerramentoInst/padraoCasa.ts` | `formaPag` | `FORMA_PAG_OPTIONS` |
| `data/encerramentoInst/padraoCasaExtend.ts` | `formaPag` | idem |
| `data/feedback/stbRoku.ts` | `formaPag` | `FORMA_PAG_OPTIONS` |
| `data/feedback/mudancaPonto.ts` | `formaPag` | idem |

### `parentesco` (grau de relacionamento)

Campo `parente` / `parenteSol` / `parentesco_cobertura` — usa `control: 'text'`
com `autocomplete` vindo de `GRAU_RELACIONAMENTO`.

A migração aqui é diferente: não é um `select`, é um **autocomplete de texto livre**.
O componente que renderiza o autocomplete (`Autocomplete` do MUI) deve receber as
sugestões do catálogo. Arquivo central: `src/data/grauRelacionamento.ts` — substituir
o array estático por uma chamada ao catálogo.

### `planos-altplan` / `planos-extend` / `planos-mudend`

Campos: `planoAtual` (grupo `'atual'`) e `planoEscolhido` (grupo `'ofertado'`).

```typescript
{ id: 'planoAtual',    ..., catalogCategoria: 'planos-altplan', catalogGrupo: 'atual'     },
{ id: 'planoEscolhido',..., catalogCategoria: 'planos-altplan', catalogGrupo: 'ofertado'  },
```

---

## Regras do Firestore a adicionar

Arquivo: `firestore.rules`

```
match /catalogo/{categoria}/itens/{itemId} {
  // Leitura: qualquer usuário autenticado (operadores precisam carregar as opções)
  allow read: if request.auth != null;

  // Escrita: apenas gerente, admin ou dev
  allow write: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.hierarchy == 'gerente'
    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isDev == true;
}
```

---

## Checklist de validação pós-migração

Para cada arquivo migrado:

- [ ] `npx tsc --noEmit` sem erros
- [ ] Formulário abre e mostra as opções carregadas do Firestore
- [ ] Select de roteador (ou outro campo) exibe os itens na ordem correta
- [ ] Itens marcados como `ativo: false` não aparecem no select
- [ ] Ao adicionar um novo item no painel `/admin/catalogo`, ele aparece no formulário sem reload da página
- [ ] Textos gerados (protocolo e O.S.) continuam idênticos ao esperado

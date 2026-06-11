# Guia de refatoração de O.S (HTML legado → sistema TS)

Passo a passo **canônico** para transformar qualquer Ordem de Serviço do
**sistema legado** (HTML estático em `legado-exemplo/…`) em um **fluxo
data‑driven** do app atual, preservando **exatamente** os textos de Protocolo,
O.S e Agenda.

Vale para **todas** as categorias (mudança de endereço, alteração de plano,
manutenção, etc.). Os fluxos abaixo são os exemplos já resolvidos — use‑os como
modelo ao migrar os próximos:

| Categoria | Legado (origem) | Módulo TS (destino) |
| --- | --- | --- |
| Mud. endereço — padrão | `legado-exemplo/suporte/mud-end/index-mud-end.html` | `web/src/data/mudEnd/padrao.ts` |
| Mud. endereço — com fibra | `legado-exemplo/suporte/mud-end/mud-end-comfibramz/index-mud-end-cfibra.html` | `web/src/data/mudEnd/comFibra.ts` |
| Alteração de plano | `legado-exemplo/suporte/altplan/…` | `web/src/data/altplan/…` |
| Manutenção (vários) | `legado-exemplo/suporte/…` | `web/src/data/manutencao/…` |

> Regra de ouro: o texto gerado é **padrão da operação**. Não invente, não
> “melhore” redação. Copie caractere‑a‑caractere do legado (incluindo espaços e
> separadores) e cubra com teste de paridade.

---

## 1. Arquitetura do sistema

| Peça | Arquivo | Papel |
| --- | --- | --- |
| Tipos do campo/modelo | `web/src/types/osTemplate.ts` | `OsTemplateField`, `FieldControl`, `FieldOption`, `FieldLayout`, helpers `getFieldControl`/`resolveFieldGridSize` |
| Renderização do formulário | `web/src/components/OsTemplateFieldsForm.tsx` | Desenha cada campo a partir do metadado; máscaras, seções, `showWhen`, select destacado |
| Template de saída | `renderTemplate` (`web/src/lib/renderTemplate.ts`) | Substitui `{{chave}}` pelo valor do contexto |
| Abas da pré‑visualização | `splitOsPreviewSections` (`web/src/lib/splitOsPreviewSections.ts`) | Quebra o texto em abas por marcadores `=== Título ===` |
| Catálogo de fluxos | `web/src/data/osTemplatePresets.ts` | Registra cada fluxo (`id`, `category`, `label`, `getDefaults`) |
| Página geradora | `web/src/pages/OsGeneratorPage.tsx` | Monta o `context`, despacha textos por `slug`, cabeçalho dinâmico |
| Hub da demanda | `web/src/pages/*HubPage.tsx` | Cards/atalhos que abrem o gerador com `slug` |

### Fluxo de dados (resumo)

1. O preset (`getXDefaults`) devolve `{ slug, title, outputTemplate, demandCategory, fields }`.
2. `OsTemplateFieldsForm` desenha os `fields` e atualiza `values`.
3. `OsGeneratorPage` monta um `context` (valores crus + chaves derivadas) e, para o
   `slug` do fluxo, injeta os textos calculados (`buildXTextos`).
4. `renderTemplate(outputTemplate, context)` produz o texto final.
5. `splitOsPreviewSections` separa em abas (Protocolo / O.S / Agenda).

---

## 2. Convenções de UI (manter em todos os fluxos)

Decisões que valem para **todo** formulário de O.S:

- **Tipo de solicitação = select destacado** (`highlight: true`): fundo verde em
  degradê, fonte maior, funciona como subtítulo. Texto do botão em CAIXA ALTA
  (somente o botão, não a lista). Ícones por opção via `FieldOption.icon`:
  - `user-round` → casos em que **o titular** liga.
  - `users-round` → casos em que **um terceiro** liga.
  - Implementação: `HighlightSelect` + `FieldOptionIcon` em `OsTemplateFieldsForm.tsx`.
- **Sinal da fibra = controle `signal`** (`web/src/lib/sinalFibraMask.ts`): máscara
  `00.00`; no texto sai `-00.00DBM` (ex.: digitou `12.34` → `-12.34DBM`).
- **ONU/ONT no texto**: o prefixo (`ONU`/`ONT`) é derivado do equipamento escolhido
  (`onuOnt` começa com `ONT` → `ONT`, senão `ONU`). Não fixar “ONU”.
- **Telefone = controle `phone`** (`formatPhoneBrMask`).
- **CEP**: campo `id: 'cep'` aciona busca ViaCEP/Brasil API e preenche
  `adress`/`bairro` (ver `resolveCepFillIds`). Aceita colagem com máscara
  (`38413-291`) porque normaliza só dígitos; **sem** `maxLength` fixo no input.
- **Comprovante condicional**: a opção “Outros” tem valor `OUTROS`; o campo
  `tipoComp` só aparece com `showWhen: { field: 'comprovante', equals: 'OUTROS' }`.
  No texto use `comprovanteFinal = comprovante === 'OUTROS' ? tipoComp : comprovante`.
- **Operador automático**: não há select de operador. Use o 1º nome do operador
  logado em maiúsculas → `context.operadorPrimeiroNome` (derivado de
  `profile.displayName` no `OsGeneratorPage`).
- **Layout em grid 12 colunas** (`layout: { md: … }`). Distribua para nada cortar
  (ex.: CEP `md:3`, Logradouro `md:7`, Nº `md:2`; pagamento `md:3` etc.).
- **Cabeçalho dinâmico**: o overline vira a variante (parte após “—” do `title`,
  ex.: “Padrão”); título/subtítulo vêm da demanda (`DEMAND_GENERATOR_BLURB`).
  Quando aberto por `slug`, o seletor de modelo some e aparece “Preencha
  atentamente o formulário abaixo”.

---

## 3. Lógica dos “terceiros” (4 variações em um só fluxo)

Quando a mesma O.S muda só pelo solicitante/quem recebe, use **um único fluxo**
com o select `tipoSolicitacao` (em vez de um HTML por situação). Constantes
(exportadas de `web/src/data/mudEnd/padrao.ts`, reutilizáveis):

```ts
T_TITULAR            = 'titular-solicita-titular-acompanha'   // padrão
T_TERCEIRO_TITULAR   = 'terceiro-solicita-titular-acompanha'
T_TERCEIRO_TERCEIRO  = 'terceiro-solicita-terceiro-acompanha'
T_TITULAR_TERCEIRO   = 'titular-solicita-terceiro-acompanha'
```

- Campos extras (solicitante, contatoSol, autorizado, contatoAut, parente,
  canalTit, dataLigacao) aparecem por `showWhen` conforme o tipo.
- O `buildXTextos(rawValues, operadorPrimeiroNome)` tem um ramo por tipo e cai no
  caso titular (padrão, fiel ao legado) por último.
- Reaproveite os campos de outro fluxo quando o formulário for o mesmo:
  `export const MUD_END_COM_FIBRA_FIELDS = MUD_END_PADRAO_FIELDS`.

> Quando o legado só tem o HTML do caso titular, as variações de terceiro são
> **compostas por analogia** (mesma estrutura + a redação específica do fluxo).
> Sinalize isso ao operador para validação; o titular permanece fiel ao legado.
> Se existir HTML legado por situação, copie cada um caractere‑a‑caractere.

---

## 4. Preservando o texto EXATO

No legado os textos ficam em template strings dentro de `gerarTextos()`. Cuidados:

- **Separadores**: copie o tamanho exato. Ex.: `'='.repeat(35)`, `'='.repeat(37)`,
  `'*'.repeat(15)`, `'*'.repeat(35)`. Confirme contando no HTML.
- **Espaços “invisíveis”**: várias linhas em branco do legado contêm espaços
  (ex.: linhas com 4 espaços entre separador e texto; 8 espaços antes de “MUDANÇA
  AGENDADA”). Reproduza‑os (use `' '.repeat(4)`/`' '.repeat(8)` no teste).
- **Maiúsculas / dígitos / 1º nome**: helpers locais
  ```ts
  upper(x)  // String(x).trim().toUpperCase()
  digits(x) // remove não dígitos
  first(x)  // primeiro token (1º nome)
  ```
- **Diferenças sutis entre fluxos** (ex.: “HRS.” vs “HR.”, “R$100,00” vs
  “R$50,00 OU R$100,00”, sufixo de agenda `// COM FIBRA EXISTENTE`, vírgula em
  “POR OUTRO, O CUSTO” só no corpo da O.S): mantenha como está no legado de origem.

### Template de saída (3 abas)

As chaves `{{…}}` são por fluxo; abaixo, o padrão usado em mud‑end:

```ts
export const X_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{mudEndTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{mudEndTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{mudEndTextoAgenda}}',
].join('\n')
```

Os blocos são preenchidos por `buildXTextos`, chamado no `OsGeneratorPage`:

```ts
} else if (selected?.slug === 'mud-end-com-fibra') {
  Object.assign(base, buildMudEndComFibraTextos(values, String(base.operadorPrimeiroNome ?? '')))
}
```

> Observação: fluxos sem cálculo dinâmico podem colocar os 3 marcadores
> (`=== Texto Protocolo ===`, `=== Texto O.S ===`, `=== Texto da Agenda ===`)
> direto no `outputTemplate`, usando placeholders simples `{{campo}}`.
> Linhas que contêm só `=` no corpo **não** viram abas.

---

## 5. Passo a passo para um novo fluxo

1. **Ler o HTML legado**: campos (ids, labels, options, ordem, colunas), `gerarTextos()`
   e as condicionais JS (`toggle…`, equivalente a `showWhen`).
2. **Criar o módulo** `web/src/data/<grupo>/<fluxo>.ts` com:
   - `X_OUTPUT` (3 abas);
   - `buildXTextos(rawValues, operadorPrimeiroNome)` com os ramos de tipo (quando houver terceiros);
   - `X_FIELDS` (reutilize de outro fluxo quando for o mesmo formulário);
   - `getXDefaults()` (`slug`, `title` no formato “Categoria — variante”, `demandCategory`, `fields`).
3. **Registrar** em `web/src/data/osTemplatePresets.ts` (`id`, `category`, `label`, `getDefaults`).
4. **Despachar** os textos no `OsGeneratorPage.tsx` (novo `else if` por `slug`) — só
   se o fluxo calcula textos dinamicamente.
5. **Atalho no hub** (`*HubPage.tsx` da categoria): card com
   `to: '/gerar-os?demanda=<demanda>&slug=<slug>'`.
6. **Teste de paridade** `…/<fluxo>.test.ts`: reconstrua a saída esperada e compare
   com `renderTemplate` + `splitOsPreviewSections`. A agenda pode terminar em espaço
   (quando “não possui extend”); compare com `.replace(/\s+$/, '')`.
7. **Verificar**: `npm test -- --run <arquivos>` e `npm run build`.

### Checklist rápido

- [ ] Separadores com tamanho exato e espaços em branco reproduzidos.
- [ ] `equipPrefix` (ONU/ONT) + `sinalSaida` (`-00.00DBM`) quando houver sinal.
- [ ] `comprovanteFinal` e `tipoComp` com `showWhen` = `OUTROS` (quando houver comprovante).
- [ ] Operador automático (`operadorPrimeiroNome`), sem select de operador.
- [ ] Select `tipoSolicitacao` com `highlight` e ícones (quando houver terceiros).
- [ ] Layout em grid sem campos cortados.
- [ ] Preset + despacho por slug + card no hub.
- [ ] Teste de paridade do caso titular verde; build OK.

---

## 6. Ambiente (Windows / PowerShell)

- O PowerShell deste ambiente **não aceita `&&`**. Use `cmd /c "a && b"`.
- Testar um fluxo: `cmd /c "npm test -- --run src/data/mudEnd/comFibra.test.ts"`.
- Build: `cmd /c "npm run build"` (em `web/`). Deploy: `npm run deploy` (raiz).

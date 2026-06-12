# Inventário HTML — `suporte/` (legado)

## O que foi gerado automaticamente

- **`legacy-suporte-inventory.json`** — lista todos os `.html` (exceto dashboards `dash-*` e excludes em script), com:
  - caminho relativo à pasta `suporte/`
  - **`slugSuggestion`**: ideia de slug ao criar preset (`legacy-…`)
  - **`demandCategoryGuess`**: mapeamento heurístico para `osTemplates.demandCategory`
  - **`flags`**: presença de `gerarTextos()` / indício de gerador de O.S.

Regenerar após adicionar ficheiros:

```bash
npm run inventory:suporte
```

## Números (última geração)

Consulte `summary` no JSON. Ordem de grandeza típica:

- **~208** HTML indexados (excluindo `download/`, `olt/`, alguns testes)
- **~186** classificados como **provável gerador de O.S** (`likelyOsGenerator`)
- **~22** páginas auxiliares (tutoriais, modelos estáticos, pesquisa CEP UI, etc.)

## Transpor para o app (presets / Firestore)

1. Escolher um ficheiro em `generatorsOnly` (ou um `path` da lista).
2. Extrair `gerarTextos` + campos do `<form>` + textos `textoProtocolo` / `textoOS`.
3. Criar em `web/src/data/` um `getXxxDefaults()` com `outputTemplate` em `{{placeholders}}` e `fields` alinhados ao gerador (tipos `datetime`, `phone`, etc.).
4. Registar em `web/src/data/osTemplatePresets.ts`.
5. Publicar no Firestore pela UI **Modelos**.

**Lotes sugeridos:** `alteracao-plano` → `mudanca-endereco` → `manutencao` → `wifi-extend` → restantes.

## Nota sobre variantes (titular / terceiros)

Vários HTML são a mesma demanda com pequenas diferenças: preferir **partilhar opções** (planos, roteadores) em módulos TS e **presets separados** quando o texto legal mudar.

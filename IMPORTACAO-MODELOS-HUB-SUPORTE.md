# Importação de modelos (Hub de Suporte)

Este guia descreve um fluxo simples para cadastrar **dezenas de modelos** no Hub de Suporte com o mínimo de retrabalho: preparar os conteúdos em arquivos `.txt` e depois transpor/importar para o formato usado no Firestore.

## Objetivo

- Manter os modelos em **texto puro** (fácil de revisar e versionar).
- Padronizar metadados (título, demanda/categoria, tags).
- Permitir importação em lote (1 comando), evitando “cadastrar na mão” um por um.

## Estrutura recomendada de pastas

Crie uma pasta na raiz do projeto (sugestão):

- `modelos-importacao/`
  - `mudanca-endereco/`
  - `alteracao-plano/`
  - `manutencao/`
  - `...`

Cada arquivo `.txt` representa **1 modelo**.

## Formato do arquivo `.txt` (padrão)

Topo do arquivo com metadados, depois uma linha em branco, depois o corpo.

Exemplo:

```txt
TITULO: Mudança de endereço (cliente ausente)
DEMANDA: mudanca-endereco
TAGS: ausencia, reagendar

Olá!

Segue a tratativa para mudança de endereço...
...
```

### Campos

- **`TITULO`**: obrigatório. Nome humano do modelo.
- **`DEMANDA`**: obrigatório. Deve ser o **id da demanda** do Hub (o mesmo do `SUPPORT_DEMANDS`).
- **`TAGS`**: opcional. Separadas por vírgula.
- **Corpo**: obrigatório. Texto do modelo.

## Placeholders (variáveis no texto)

Se for usar campos dinâmicos, padronizar placeholders desde o começo (exemplos):

- `{{NOME_CLIENTE}}`
- `{{CODIGO_CONTRATO}}`
- `{{ENDERECO}}`
- `{{DATA}}`

Regra de ouro: usar **sempre o mesmo placeholder** para o mesmo tipo de dado.

## Como vamos transpor para o Firestore

Quando você estiver pronto para importar:

- Você vai colocar todos os `.txt` dentro de `modelos-importacao/`.
- Eu vou:
  - ler os `.txt`,
  - validar campos obrigatórios,
  - mapear `DEMANDA` para a rota/categoria do Hub,
  - gerar e subir os documentos no Firestore no formato correto,
  - evitar duplicados por um identificador estável (ex.: `slug` derivado do título + demanda, ou um `id` no cabeçalho do `.txt` se preferir).

## O que você precisa preparar antes de eu automatizar

1. **3 arquivos de exemplo** (de pelo menos **2 demandas diferentes**) dentro de `modelos-importacao/`.
2. Confirmar/ter listado:
   - quais são os **ids** válidos de `DEMANDA` (do `SUPPORT_DEMANDS`);
   - onde os templates vivem no Firestore (coleção e campos), caso haja mais de uma estrutura.

## Checklist rápido (antes de começar a cadastrar tudo)

- [ ] O nome e os ids das demandas no Hub estão finais (sem renomeações pendentes)
- [ ] Placeholders definidos e consistentes
- [ ] Um modelo “piloto” está 100% aprovado (texto + fluxo)
- [ ] Existe um plano de “evitar duplicado” (slug/id)
- [ ] (Opcional) Export/backups previstos (ex.: exportar JSON dos templates)


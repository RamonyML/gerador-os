# Catálogo de Demandas — Suporte (legado `legado-exemplo/suporte/`)

> Documento gerado automaticamente a partir de `legacy-suporte-inventory.json` (inventário de 208 páginas HTML, 186 prováveis geradores de O.S.).  Regenerar com `python web/scripts/gen_catalogo_demandas.py legado-exemplo/suporte/legacy-suporte-inventory.json CATALOGO-DEMANDAS-SUPORTE.md`.

## Objetivo deste documento

Mapear **todas** as demandas do setor de Suporte (a partir do gerador legado em `legado-exemplo/suporte/`) para servir de base a uma outra LLM/equipe na implementação de **endpoints** e na **integração com a API do MK Solutions**.

**Dor atual:** o app gera *textos* (um para o **protocolo** e outro para a **Ordem de Serviço / O.S.**) que hoje são **copiados e colados manualmente** no MK Solutions (Ctrl+C / Ctrl+V). A meta é **acabar com esse trabalho manual**: gerar e **inserir automaticamente** protocolos e O.S. no MK via API, além de permitir **consulta** e **listagem** desses registros.

## Como ler este catálogo

- A hierarquia é **Categoria → Demanda (pasta) → Variante (arquivo/atendimento)**.
- Cada item traz o **caminho relativo** a `legado-exemplo/suporte/` e uma marcação:
  - _(O.S.)_ = página com **gerador** (`gerarTextos()`) que produz texto de protocolo e/ou de O.S. — é uma demanda real a ser automatizada.
  - _(auxiliar)_ = página de apoio (tutorial, modelo de texto estático, pesquisa de CEP, testes) — **não** gera O.S., listada apenas para completude.
- Variantes comuns: **PJ** (pessoa jurídica), **presencial/remoto**, **titular/terceiro**, **visita paga/isenta**, **com/sem troca de equipamento**, **ocasionado** (dano causado pelo cliente) **vs. não ocasionado**.

## Sumário por categoria

| # | Categoria | Chave (`demandCategory`) | Itens |
|---|-----------|--------------------------|-------|
| 1 | Manutenção | `manutencao` | 77 |
| 2 | Alteração de plano | `alteracao-plano` | 58 |
| 3 | Mudança de endereço | `mudanca-endereco` | 15 |
| 4 | Mídia / TV (Roku, STB, ITTV) | `midia-tv` | 10 |
| 5 | Wi-Fi Extend / repetidor | `wifi-extend` | 10 |
| 6 | Senha de rede | `senha-rede` | 1 |
| 7 | Feedback de visita técnica | `feedback` | 8 |
| 8 | Termos e documentos | `termo-docs` | 3 |
| 9 | Pesquisa de endereço / CEP | `pesquisa-endereco` | 1 |
| 10 | Geral / utilidades | `geral` | 3 |
| | **Total** | | **208** |

> Observação: a coluna usa a contagem heurística do inventário (`byDemandGuess`). Algumas pastas aparecem em mais de uma categoria (ex.: `mud-end`, `wi-fi extend`, `encerramentos`) porque os arquivos foram classificados individualmente — por isso os totais por seção podem divergir ligeiramente da tabela acima, mas o total geral é 208.

## 1. Manutenção

- **Chave do app:** `manutencao` · **Itens:** 77 (geradores de O.S.: 77)

### 1.1 Equipamento queimado  `(/equip-queimado/ · 6 arquivo(s), 6 gerador(es))`

- 1.1.1 **fonte-queimada-loja** — `equip-queimado/fonte-queimada-loja.html` _(O.S.)_
- 1.1.2 **fonte-queimada** — `equip-queimado/fonte-queimada.html` _(O.S.)_
- 1.1.3 **ONT queimada / ont-queimada** — `equip-queimado/ont-queimada/ont-queimada.html` _(O.S.)_
- 1.1.4 **ONU queimada / onu-queimada** — `equip-queimado/onu-queimada/onu-queimada.html` _(O.S.)_
- 1.1.5 **roteador-queimado** — `equip-queimado/roteador-queimado.html` _(O.S.)_
- 1.1.6 **Roteador queimado / roteador-queimado** — `equip-queimado/roteador-queimado/roteador-queimado.html` _(O.S.)_

### 1.2 Visita instrutiva  `(/instrutiva/ · 1 arquivo(s), 1 gerador(es))`

- 1.2.1 **visita-instrutiva** — `instrutiva/visita-instrutiva.html` _(O.S.)_

### 1.3 Lentidão  `(/lentidao/ · 6 arquivo(s), 6 gerador(es))`

- 1.3.1 **Disponibiliza remoto / index-lentidao-disp-pj** — `lentidao/disp-remoto/index-lentidao-disp-pj.html` _(O.S.)_
- 1.3.2 **Disponibiliza remoto / index-lentidao-disp** — `lentidao/disp-remoto/index-lentidao-disp.html` _(O.S.)_
- 1.3.3 **index-lentidao-pj** — `lentidao/index-lentidao-pj.html` _(O.S.)_
- 1.3.4 **index-lentidao** — `lentidao/index-lentidao.html` _(O.S.)_
- 1.3.5 **Visita isenta / index-lentidao-pj** — `lentidao/isento/index-lentidao-pj.html` _(O.S.)_
- 1.3.6 **Visita isenta / index-lentidao** — `lentidao/isento/index-lentidao.html` _(O.S.)_

### 1.4 Luz vermelha (sem conexão)  `(/luz-vermelha/ · 23 arquivo(s), 23 gerador(es))`

- 1.4.1 **Fibra externa / fibra-ext-padrao** — `luz-vermelha/fibra-externa/fibra-ext-padrao.html` _(O.S.)_
- 1.4.2 **Fibra externa / fibra-ext-pj** — `luz-vermelha/fibra-externa/fibra-ext-pj.html` _(O.S.)_
- 1.4.3 **Fibra externa / fibra-ext1** — `luz-vermelha/fibra-externa/fibra-ext1.html` _(O.S.)_
- 1.4.4 **Fibra externa / fibra-ext2** — `luz-vermelha/fibra-externa/fibra-ext2.html` _(O.S.)_
- 1.4.5 **Fibra externa / fibra-ext3** — `luz-vermelha/fibra-externa/fibra-ext3.html` _(O.S.)_
- 1.4.6 **index-luzverm-padrao** — `luz-vermelha/index-luzverm-padrao.html` _(O.S.)_
- 1.4.7 **luz-padrao1 / luz-padrao1** — `luz-vermelha/luz-padrao1/luz-padrao1.html` _(O.S.)_
- 1.4.8 **luz-padrao2 / luz-padrao2** — `luz-vermelha/luz-padrao2/luz-padrao2.html` _(O.S.)_
- 1.4.9 **luz-padrao3 / luz-padrao3** — `luz-vermelha/luz-padrao3/luz-padrao3.html` _(O.S.)_
- 1.4.10 **luz-vermelha-backup** — `luz-vermelha/luz-vermelha-backup.html` _(O.S.)_
- 1.4.11 **PJ — padrão / index-luzverm-padrao-pj** — `luz-vermelha/luzv-pj-padrao/index-luzverm-padrao-pj.html` _(O.S.)_
- 1.4.12 **PJ — padrão / Ocasionado — conector / ocas-conect-pj** — `luz-vermelha/luzv-pj-padrao/luz-ocas-conec/ocas-conect-pj.html` _(O.S.)_
- 1.4.13 **PJ — padrão / Ocasionado — fibra / ocas-fibra-pj** — `luz-vermelha/luzv-pj-padrao/luz-ocas-fibra/ocas-fibra-pj.html` _(O.S.)_
- 1.4.14 **Ocasionado — conector / ocas-conect-padrao** — `luz-vermelha/ocasionado-conector/ocas-conect-padrao.html` _(O.S.)_
- 1.4.15 **Ocasionado — conector / ocas-conect1** — `luz-vermelha/ocasionado-conector/ocas-conect1.html` _(O.S.)_
- 1.4.16 **Ocasionado — conector / ocas-conect2** — `luz-vermelha/ocasionado-conector/ocas-conect2.html` _(O.S.)_
- 1.4.17 **Ocasionado — conector / ocas-conect3** — `luz-vermelha/ocasionado-conector/ocas-conect3.html` _(O.S.)_
- 1.4.18 **Ocasionado — fibra / ocas-fibra-padrao** — `luz-vermelha/ocasionado-fibra/ocas-fibra-padrao.html` _(O.S.)_
- 1.4.19 **Ocasionado — fibra / ocas-fibra1** — `luz-vermelha/ocasionado-fibra/ocas-fibra1.html` _(O.S.)_
- 1.4.20 **Ocasionado — fibra / ocas-fibra2** — `luz-vermelha/ocasionado-fibra/ocas-fibra2.html` _(O.S.)_
- 1.4.21 **Ocasionado — fibra / ocas-fibra3** — `luz-vermelha/ocasionado-fibra/ocas-fibra3.html` _(O.S.)_
- 1.4.22 **Ocasionado — fibra / ocasionado-fibra** — `luz-vermelha/ocasionado-fibra/ocasionado-fibra.html` _(O.S.)_
- 1.4.23 **teste-luzvermelha** — `luz-vermelha/teste-luzvermelha.html` _(O.S.)_

### 1.5 Luz vermelha (reincidência em 7 dias)  `(/luz-vermelha-7dias/ · 23 arquivo(s), 23 gerador(es))`

- 1.5.1 **Fibra externa / fibra-ext-padrao** — `luz-vermelha-7dias/fibra-externa/fibra-ext-padrao.html` _(O.S.)_
- 1.5.2 **Fibra externa / fibra-ext-pj** — `luz-vermelha-7dias/fibra-externa/fibra-ext-pj.html` _(O.S.)_
- 1.5.3 **Fibra externa / fibra-ext1** — `luz-vermelha-7dias/fibra-externa/fibra-ext1.html` _(O.S.)_
- 1.5.4 **Fibra externa / fibra-ext2** — `luz-vermelha-7dias/fibra-externa/fibra-ext2.html` _(O.S.)_
- 1.5.5 **Fibra externa / fibra-ext3** — `luz-vermelha-7dias/fibra-externa/fibra-ext3.html` _(O.S.)_
- 1.5.6 **index-luzverm-padrao** — `luz-vermelha-7dias/index-luzverm-padrao.html` _(O.S.)_
- 1.5.7 **luz-padrao1 / luz-padrao1** — `luz-vermelha-7dias/luz-padrao1/luz-padrao1.html` _(O.S.)_
- 1.5.8 **luz-padrao2 / luz-padrao2** — `luz-vermelha-7dias/luz-padrao2/luz-padrao2.html` _(O.S.)_
- 1.5.9 **luz-padrao3 / luz-padrao3** — `luz-vermelha-7dias/luz-padrao3/luz-padrao3.html` _(O.S.)_
- 1.5.10 **luz-vermelha-backup** — `luz-vermelha-7dias/luz-vermelha-backup.html` _(O.S.)_
- 1.5.11 **PJ — padrão / index-luzverm-padrao-pj** — `luz-vermelha-7dias/luzv-pj-padrao/index-luzverm-padrao-pj.html` _(O.S.)_
- 1.5.12 **PJ — padrão / Ocasionado — conector / ocas-conect-pj** — `luz-vermelha-7dias/luzv-pj-padrao/luz-ocas-conec/ocas-conect-pj.html` _(O.S.)_
- 1.5.13 **PJ — padrão / Ocasionado — fibra / ocas-fibra-pj** — `luz-vermelha-7dias/luzv-pj-padrao/luz-ocas-fibra/ocas-fibra-pj.html` _(O.S.)_
- 1.5.14 **Ocasionado — conector / ocas-conect-padrao** — `luz-vermelha-7dias/ocasionado-conector/ocas-conect-padrao.html` _(O.S.)_
- 1.5.15 **Ocasionado — conector / ocas-conect1** — `luz-vermelha-7dias/ocasionado-conector/ocas-conect1.html` _(O.S.)_
- 1.5.16 **Ocasionado — conector / ocas-conect2** — `luz-vermelha-7dias/ocasionado-conector/ocas-conect2.html` _(O.S.)_
- 1.5.17 **Ocasionado — conector / ocas-conect3** — `luz-vermelha-7dias/ocasionado-conector/ocas-conect3.html` _(O.S.)_
- 1.5.18 **Ocasionado — fibra / ocas-fibra-padrao** — `luz-vermelha-7dias/ocasionado-fibra/ocas-fibra-padrao.html` _(O.S.)_
- 1.5.19 **Ocasionado — fibra / ocas-fibra1** — `luz-vermelha-7dias/ocasionado-fibra/ocas-fibra1.html` _(O.S.)_
- 1.5.20 **Ocasionado — fibra / ocas-fibra2** — `luz-vermelha-7dias/ocasionado-fibra/ocas-fibra2.html` _(O.S.)_
- 1.5.21 **Ocasionado — fibra / ocas-fibra3** — `luz-vermelha-7dias/ocasionado-fibra/ocas-fibra3.html` _(O.S.)_
- 1.5.22 **Ocasionado — fibra / ocasionado-fibra** — `luz-vermelha-7dias/ocasionado-fibra/ocasionado-fibra.html` _(O.S.)_
- 1.5.23 **teste-luzvermelha** — `luz-vermelha-7dias/teste-luzvermelha.html` _(O.S.)_

### 1.6 Monitoramento  `(/monitoramento/ · 1 arquivo(s), 1 gerador(es))`

- 1.6.1 **index_ativo** — `monitoramento/index_ativo.html` _(O.S.)_

### 1.7 Mudança de ponto interno  `(/mud-ponto-int/ · 5 arquivo(s), 5 gerador(es))`

- 1.7.1 **mud-ponto-int-pj** — `mud-ponto-int/mud-ponto-int-pj.html` _(O.S.)_
- 1.7.2 **mud-ponto-int** — `mud-ponto-int/mud-ponto-int.html` _(O.S.)_
- 1.7.3 **mudponto1 / mudponto1** — `mud-ponto-int/mudponto1/mudponto1.html` _(O.S.)_
- 1.7.4 **mudponto2 / mudponto2** — `mud-ponto-int/mudponto2/mudponto2.html` _(O.S.)_
- 1.7.5 **mudponto3 / mudponto3** — `mud-ponto-int/mudponto3/mudponto3.html` _(O.S.)_

### 1.8 Realocação de fibra  `(/realoc-fibra/ · 5 arquivo(s), 5 gerador(es))`

- 1.8.1 **realoc-fibra-pj** — `realoc-fibra/realoc-fibra-pj.html` _(O.S.)_
- 1.8.2 **realoc-fibra** — `realoc-fibra/realoc-fibra.html` _(O.S.)_
- 1.8.3 **realoc-fibra1 / realoc-fibra1** — `realoc-fibra/realoc-fibra1/realoc-fibra1.html` _(O.S.)_
- 1.8.4 **realoc-fibra2 / realoc-fibra2** — `realoc-fibra/realoc-fibra2/realoc-fibra2.html` _(O.S.)_
- 1.8.5 **realoc-fibra3 / realoc-fibra3** — `realoc-fibra/realoc-fibra3/realoc-fibra3.html` _(O.S.)_

### 1.9 Reset de roteador  `(/roteador-reset/ · 2 arquivo(s), 2 gerador(es))`

- 1.9.1 **index-roteador-reset** — `roteador-reset/index-roteador-reset.html` _(O.S.)_
- 1.9.2 **Loja / rot-reset-loja** — `roteador-reset/rot-reset-loja/rot-reset-loja.html` _(O.S.)_

### 1.10 Sinal alto  `(/sinal-alto/ · 5 arquivo(s), 5 gerador(es))`

- 1.10.1 **index-sinal-padrao** — `sinal-alto/index-sinal-padrao.html` _(O.S.)_
- 1.10.2 **index-sinal-pj** — `sinal-alto/index-sinal-pj.html` _(O.S.)_
- 1.10.3 **sinal1** — `sinal-alto/sinal1.html` _(O.S.)_
- 1.10.4 **sinal2** — `sinal-alto/sinal2.html` _(O.S.)_
- 1.10.5 **sinal3** — `sinal-alto/sinal3.html` _(O.S.)_


## 2. Alteração de plano

- **Chave do app:** `alteracao-plano` · **Itens:** 60 (geradores de O.S.: 58)

### 2.1 Alteração de plano (catálogo principal)  `(/altplan/ · 21 arquivo(s), 20 gerador(es))`

- 2.1.1 **Remoto / encerramento** — `altplan/altplan-remoto/encerramento.html` _(auxiliar)_
- 2.1.2 **Remoto / index-altplan-remoto** — `altplan/altplan-remoto/index-altplan-remoto.html` _(O.S.)_
- 2.1.3 **Remoto / PJ (pessoa jurídica) / index-altplan-remoto-pj** — `altplan/altplan-remoto/pj/index-altplan-remoto-pj.html` _(O.S.)_
- 2.1.4 **Remoto / Presencial — terceiro / altplan-remoto-pres-terc** — `altplan/altplan-remoto/pres-terceiro1/altplan-remoto-pres-terc.html` _(O.S.)_
- 2.1.5 **Remoto / Presencial / index-altplan-remoto-presencial** — `altplan/altplan-remoto/presencial/index-altplan-remoto-presencial.html` _(O.S.)_
- 2.1.6 **Remoto / Terceiro 1 / index-altplan-terc** — `altplan/altplan-remoto/terceiro1/index-altplan-terc.html` _(O.S.)_
- 2.1.7 **Sem troca — visita isenta / index-altplan-sem-troca-visita-isenta** — `altplan/altplan-sem-troca-visita-isenta/index-altplan-sem-troca-visita-isenta.html` _(O.S.)_
- 2.1.8 **Sem troca — visita isenta / st-vi-1 / st-vi-1** — `altplan/altplan-sem-troca-visita-isenta/st-vi-1/st-vi-1.html` _(O.S.)_
- 2.1.9 **Sem troca — visita isenta / st-vi-2 / st-vi-2** — `altplan/altplan-sem-troca-visita-isenta/st-vi-2/st-vi-2.html` _(O.S.)_
- 2.1.10 **Sem troca — visita isenta / st-vi-3 / st-vi-3** — `altplan/altplan-sem-troca-visita-isenta/st-vi-3/st-vi-3.html` _(O.S.)_
- 2.1.11 **Sem troca — visita paga / index-altplan-sem-troca-visita-paga** — `altplan/altplan-sem-troca-visita-paga/index-altplan-sem-troca-visita-paga.html` _(O.S.)_
- 2.1.12 **Com troca — visita isenta / backup** — `altplan/altplan-troca-visita-isenta/backup.html` _(O.S.)_
- 2.1.13 **Com troca — visita isenta / ct-vi-1 / ct-vi-1** — `altplan/altplan-troca-visita-isenta/ct-vi-1/ct-vi-1.html` _(O.S.)_
- 2.1.14 **Com troca — visita isenta / ct-vi-2 / ct-vi-2** — `altplan/altplan-troca-visita-isenta/ct-vi-2/ct-vi-2.html` _(O.S.)_
- 2.1.15 **Com troca — visita isenta / ct-vi-3 / ct-vi-3** — `altplan/altplan-troca-visita-isenta/ct-vi-3/ct-vi-3.html` _(O.S.)_
- 2.1.16 **Com troca — visita isenta / index-altplan-troca-visita-isenta** — `altplan/altplan-troca-visita-isenta/index-altplan-troca-visita-isenta.html` _(O.S.)_
- 2.1.17 **Com troca — visita isenta / pj-altplan-troca-visita-isenta** — `altplan/altplan-troca-visita-isenta/pj-altplan-troca-visita-isenta.html` _(O.S.)_
- 2.1.18 **Com troca — visita paga / ct-vp-1 / ct-vp-1** — `altplan/altplan-troca-visita-paga/ct-vp-1/ct-vp-1.html` _(O.S.)_
- 2.1.19 **Com troca — visita paga / ct-vp-2 / ct-vp-2** — `altplan/altplan-troca-visita-paga/ct-vp-2/ct-vp-2.html` _(O.S.)_
- 2.1.20 **Com troca — visita paga / ct-vp-3 / ct-vp-3** — `altplan/altplan-troca-visita-paga/ct-vp-3/ct-vp-3.html` _(O.S.)_
- 2.1.21 **Com troca — visita paga / index-altplan-troca-visita-paga** — `altplan/altplan-troca-visita-paga/index-altplan-troca-visita-paga.html` _(O.S.)_

### 2.2 Alteração de plano (ofertado / retenção)  `(/altplan-ofertado/ · 18 arquivo(s), 18 gerador(es))`

- 2.2.1 **Remoto / index-altplan-remoto** — `altplan-ofertado/altplan-remoto/index-altplan-remoto.html` _(O.S.)_
- 2.2.2 **Remoto / PJ (pessoa jurídica) / index-altplan-remoto-pj** — `altplan-ofertado/altplan-remoto/pj/index-altplan-remoto-pj.html` _(O.S.)_
- 2.2.3 **Remoto / Presencial — terceiro / altplan-remoto-pres-terc** — `altplan-ofertado/altplan-remoto/pres-terceiro1/altplan-remoto-pres-terc.html` _(O.S.)_
- 2.2.4 **Remoto / Presencial / index-altplan-remoto-presencial** — `altplan-ofertado/altplan-remoto/presencial/index-altplan-remoto-presencial.html` _(O.S.)_
- 2.2.5 **Remoto / Terceiro 1 / index-altplan-terc** — `altplan-ofertado/altplan-remoto/terceiro1/index-altplan-terc.html` _(O.S.)_
- 2.2.6 **Sem troca — visita isenta / index-altplan-sem-troca-visita-isenta** — `altplan-ofertado/altplan-sem-troca-visita-isenta/index-altplan-sem-troca-visita-isenta.html` _(O.S.)_
- 2.2.7 **Sem troca — visita isenta / st-vi-1 / st-vi-1** — `altplan-ofertado/altplan-sem-troca-visita-isenta/st-vi-1/st-vi-1.html` _(O.S.)_
- 2.2.8 **Sem troca — visita isenta / st-vi-2 / st-vi-2** — `altplan-ofertado/altplan-sem-troca-visita-isenta/st-vi-2/st-vi-2.html` _(O.S.)_
- 2.2.9 **Sem troca — visita isenta / st-vi-3 / st-vi-3** — `altplan-ofertado/altplan-sem-troca-visita-isenta/st-vi-3/st-vi-3.html` _(O.S.)_
- 2.2.10 **Sem troca — visita paga / index-altplan-sem-troca-visita-paga** — `altplan-ofertado/altplan-sem-troca-visita-paga/index-altplan-sem-troca-visita-paga.html` _(O.S.)_
- 2.2.11 **Com troca — visita isenta / ct-vi-1 / ct-vi-1** — `altplan-ofertado/altplan-troca-visita-isenta/ct-vi-1/ct-vi-1.html` _(O.S.)_
- 2.2.12 **Com troca — visita isenta / ct-vi-2 / ct-vi-2** — `altplan-ofertado/altplan-troca-visita-isenta/ct-vi-2/ct-vi-2.html` _(O.S.)_
- 2.2.13 **Com troca — visita isenta / ct-vi-3 / ct-vi-3** — `altplan-ofertado/altplan-troca-visita-isenta/ct-vi-3/ct-vi-3.html` _(O.S.)_
- 2.2.14 **Com troca — visita isenta / index-altplan-troca-visita-isenta** — `altplan-ofertado/altplan-troca-visita-isenta/index-altplan-troca-visita-isenta.html` _(O.S.)_
- 2.2.15 **Com troca — visita paga / ct-vp-1 / ct-vp-1** — `altplan-ofertado/altplan-troca-visita-paga/ct-vp-1/ct-vp-1.html` _(O.S.)_
- 2.2.16 **Com troca — visita paga / ct-vp-2 / ct-vp-2** — `altplan-ofertado/altplan-troca-visita-paga/ct-vp-2/ct-vp-2.html` _(O.S.)_
- 2.2.17 **Com troca — visita paga / ct-vp-3 / ct-vp-3** — `altplan-ofertado/altplan-troca-visita-paga/ct-vp-3/ct-vp-3.html` _(O.S.)_
- 2.2.18 **Com troca — visita paga / index-altplan-troca-visita-paga** — `altplan-ofertado/altplan-troca-visita-paga/index-altplan-troca-visita-paga.html` _(O.S.)_

### 2.3 Encerramentos / fechamento de O.S.  `(/encerramentos/ · 2 arquivo(s), 2 gerador(es))`

- 2.3.1 **altplano-troca / altplano-stroca** — `encerramentos/altplano-troca/altplano-stroca.html` _(O.S.)_
- 2.3.2 **altplano-troca / altplano-troca** — `encerramentos/altplano-troca/altplano-troca.html` _(O.S.)_

### 2.4 Feedback de visita técnica  `(/feedback/ · 1 arquivo(s), 1 gerador(es))`

- 2.4.1 **feedback-altplan-c-s-troca** — `feedback/feedback-altplan-c-s-troca.html` _(O.S.)_

### 2.5 Modelos de texto (estáticos)  `(/modelos/ · 1 arquivo(s), 0 gerador(es))`

- 2.5.1 **modelos-altplan / modelos-altplan** — `modelos/modelos-altplan/modelos-altplan.html` _(auxiliar)_

### 2.6 Mudança de endereço  `(/mud-end/ · 6 arquivo(s), 6 gerador(es))`

- 2.6.1 **mud-end-altplan-pago / index-mud-altplan-pago** — `mud-end/mud-end-altplan-pago/index-mud-altplan-pago.html` _(O.S.)_
- 2.6.2 **mud-end-altplan-pago / mud-altplan-pago1 / mud-altplan-pago1** — `mud-end/mud-end-altplan-pago/mud-altplan-pago1/mud-altplan-pago1.html` _(O.S.)_
- 2.6.3 **mud-end-altplan-pago / mud-altplan-pago2 / mud-altplan-pago2** — `mud-end/mud-end-altplan-pago/mud-altplan-pago2/mud-altplan-pago2.html` _(O.S.)_
- 2.6.4 **mud-end-altplan-pago / mud-altplan-pago3 / mud-altplan-pago3** — `mud-end/mud-end-altplan-pago/mud-altplan-pago3/mud-altplan-pago3.html` _(O.S.)_
- 2.6.5 **mud-end-altplan-proposta / mud-altplan-prop** — `mud-end/mud-end-altplan-proposta/mud-altplan-prop.html` _(O.S.)_
- 2.6.6 **mud-end-altplan / index-mud-altplan** — `mud-end/mud-end-altplan/index-mud-altplan.html` _(O.S.)_

### 2.7 Wi-Fi Extend / repetidor  `(/wi-fi extend/ · 11 arquivo(s), 11 gerador(es))`

- 2.7.1 **index-altplan-wifi-extend-troca** — `wi-fi extend/index-altplan-wifi-extend-troca.html` _(O.S.)_
- 2.7.2 **index-altplan-wifi-extend** — `wi-fi extend/index-altplan-wifi-extend.html` _(O.S.)_
- 2.7.3 **Migração / index-altplan-wifi-extend** — `wi-fi extend/migrar/index-altplan-wifi-extend.html` _(O.S.)_
- 2.7.4 **Migração / PJ / index-altplan-wifi-extend-pj** — `wi-fi extend/migrar/wi-fi-extend-pj/index-altplan-wifi-extend-pj.html` _(O.S.)_
- 2.7.5 **Migração / PJ / Ofertado — PJ / index-altplan-wifi-extend-ofer-pj** — `wi-fi extend/migrar/wi-fi-extend-pj/wifi-ext-ofertado-pj/index-altplan-wifi-extend-ofer-pj.html` _(O.S.)_
- 2.7.6 **Migração / Ofertado / index-altplan-wifi-extend-ofer** — `wi-fi extend/migrar/wifi-ext-ofertado/index-altplan-wifi-extend-ofer.html` _(O.S.)_
- 2.7.7 **PJ / index-altplan-wifi-extend-pj-troca** — `wi-fi extend/wi-fi-extend-pj/index-altplan-wifi-extend-pj-troca.html` _(O.S.)_
- 2.7.8 **PJ / index-altplan-wifi-extend-pj** — `wi-fi extend/wi-fi-extend-pj/index-altplan-wifi-extend-pj.html` _(O.S.)_
- 2.7.9 **PJ / Ofertado — PJ / index-altplan-wifi-extend-ofer-pj** — `wi-fi extend/wi-fi-extend-pj/wifi-ext-ofertado-pj/index-altplan-wifi-extend-ofer-pj.html` _(O.S.)_
- 2.7.10 **Ofertado / index-altplan-wifi-extend-of-troca** — `wi-fi extend/wifi-ext-ofertado/index-altplan-wifi-extend-of-troca.html` _(O.S.)_
- 2.7.11 **Ofertado / index-altplan-wifi-extend-of** — `wi-fi extend/wifi-ext-ofertado/index-altplan-wifi-extend-of.html` _(O.S.)_


## 3. Mudança de endereço

- **Chave do app:** `mudanca-endereco` · **Itens:** 15 (geradores de O.S.: 15)

### 3.1 Mudança de endereço  `(/mud-end/ · 15 arquivo(s), 15 gerador(es))`

- 3.1.1 **index-mud-end-pj** — `mud-end/index-mud-end-pj.html` _(O.S.)_
- 3.1.2 **index-mud-end-pres** — `mud-end/index-mud-end-pres.html` _(O.S.)_
- 3.1.3 **index-mud-end** — `mud-end/index-mud-end.html` _(O.S.)_
- 3.1.4 **mud-end-comfibramz / index-mud-end-cfibra** — `mud-end/mud-end-comfibramz/index-mud-end-cfibra.html` _(O.S.)_
- 3.1.5 **mud-end-equip / index-mud-end-equip** — `mud-end/mud-end-equip/index-mud-end-equip.html` _(O.S.)_
- 3.1.6 **mud-end-mensal / mud-end-mensal** — `mud-end/mud-end-mensal/mud-end-mensal.html` _(O.S.)_
- 3.1.7 **mud-end-terceiro1 / index-mud-end-terceiro1** — `mud-end/mud-end-terceiro1/index-mud-end-terceiro1.html` _(O.S.)_
- 3.1.8 **mud-end-terceiro2 / index-mud-end-terceiro2** — `mud-end/mud-end-terceiro2/index-mud-end-terceiro2.html` _(O.S.)_
- 3.1.9 **mud-end-terceiro3 / index-mud-end-terceiro3** — `mud-end/mud-end-terceiro3/index-mud-end-terceiro3.html` _(O.S.)_
- 3.1.10 **mud-inviabilidade / index-mud-end-inviab** — `mud-end/mud-inviabilidade/index-mud-end-inviab.html` _(O.S.)_
- 3.1.11 **mud-inviabilidade / inviab-pj** — `mud-end/mud-inviabilidade/inviab-pj.html` _(O.S.)_
- 3.1.12 **mud-inviabilidade / inviab1** — `mud-end/mud-inviabilidade/inviab1.html` _(O.S.)_
- 3.1.13 **teste-condicionais** — `mud-end/teste-condicionais.html` _(O.S.)_
- 3.1.14 **teste-menu-terceiros** — `mud-end/teste-menu-terceiros.html` _(O.S.)_
- 3.1.15 **teste-mudend** — `mud-end/teste-mudend.html` _(O.S.)_


## 4. Mídia / TV (Roku, STB, ITTV)

- **Chave do app:** `midia-tv` · **Itens:** 10 (geradores de O.S.: 10)

### 4.1 Compra de Roku TV  `(/compra-roku-tv/ · 2 arquivo(s), 2 gerador(es))`

- 4.1.1 **index-roku-padrao** — `compra-roku-tv/index-roku-padrao.html` _(O.S.)_
- 4.1.2 **index-roku-presencial** — `compra-roku-tv/index-roku-presencial.html` _(O.S.)_

### 4.2 Compra de STB (set-top box)  `(/compra-stb/ · 6 arquivo(s), 6 gerador(es))`

- 4.2.1 **index-compra-stb-mensalidade** — `compra-stb/index-compra-stb-mensalidade.html` _(O.S.)_
- 4.2.2 **index-compra-stb-padrao** — `compra-stb/index-compra-stb-padrao.html` _(O.S.)_
- 4.2.3 **index-compra-stb-presencial** — `compra-stb/index-compra-stb-presencial.html` _(O.S.)_
- 4.2.4 **stb-devol-loja** — `compra-stb/stb-devol-loja.html` _(O.S.)_
- 4.2.5 **stb-devol-refid** — `compra-stb/stb-devol-refid.html` _(O.S.)_
- 4.2.6 **stb-devol-visita** — `compra-stb/stb-devol-visita.html` _(O.S.)_

### 4.3 ITTV (upgrades / reversão)  `(/ittv-upgrades/ · 2 arquivo(s), 2 gerador(es))`

- 4.3.1 **Presencial / reversao-ittv-pres** — `ittv-upgrades/presencial/reversao-ittv-pres.html` _(O.S.)_
- 4.3.2 **reversao-ittv** — `ittv-upgrades/reversao-ittv.html` _(O.S.)_


## 5. Wi-Fi Extend / repetidor

- **Chave do app:** `wifi-extend` · **Itens:** 10 (geradores de O.S.: 10)

### 5.1 Wi-Fi Extend / repetidor  `(/wi-fi extend/ · 10 arquivo(s), 10 gerador(es))`

- 5.1.1 **Migração / Ponto adicional / Com troca / index-wifi-ext-ponto-troca** — `wi-fi extend/migrar/wi-fi-ponto/com-troca/index-wifi-ext-ponto-troca.html` _(O.S.)_
- 5.1.2 **Migração / Ponto adicional / index-wifi-ext-ponto** — `wi-fi extend/migrar/wi-fi-ponto/index-wifi-ext-ponto.html` _(O.S.)_
- 5.1.3 **TP-Link / tplink-wifi-extend-pj-troca** — `wi-fi extend/tplink/tplink-wifi-extend-pj-troca.html` _(O.S.)_
- 5.1.4 **TP-Link / tplink-wifi-extend-pj** — `wi-fi extend/tplink/tplink-wifi-extend-pj.html` _(O.S.)_
- 5.1.5 **TP-Link / tplink-wifi-extend-troca** — `wi-fi extend/tplink/tplink-wifi-extend-troca.html` _(O.S.)_
- 5.1.6 **TP-Link / tplink-wifi-extend** — `wi-fi extend/tplink/tplink-wifi-extend.html` _(O.S.)_
- 5.1.7 **Ponto adicional / index-wifi-ext-ponto-pj-troca** — `wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto-pj-troca.html` _(O.S.)_
- 5.1.8 **Ponto adicional / index-wifi-ext-ponto-pj** — `wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto-pj.html` _(O.S.)_
- 5.1.9 **Ponto adicional / index-wifi-ext-ponto-troca** — `wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto-troca.html` _(O.S.)_
- 5.1.10 **Ponto adicional / index-wifi-ext-ponto** — `wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto.html` _(O.S.)_


## 6. Senha de rede

- **Chave do app:** `senha-rede` · **Itens:** 1 (geradores de O.S.: 1)

### 6.1 Alteração de senha do Wi-Fi  `(/altera-senha/ · 1 arquivo(s), 1 gerador(es))`

- 6.1.1 **altera-senha** — `altera-senha/altera-senha.html` _(O.S.)_


## 7. Feedback de visita técnica

- **Chave do app:** `feedback` · **Itens:** 8 (geradores de O.S.: 8)

### 7.1 Feedback de visita técnica  `(/feedback/ · 8 arquivo(s), 8 gerador(es))`

- 7.1.1 **feedback-man-externa** — `feedback/feedback-man-externa.html` _(O.S.)_
- 7.1.2 **feedback-man-ocasionado** — `feedback/feedback-man-ocasionado.html` _(O.S.)_
- 7.1.3 **feedback-mudanca-ponto-interno** — `feedback/feedback-mudanca-ponto-interno.html` _(O.S.)_
- 7.1.4 **feedback-semsucesso** — `feedback/feedback-semsucesso.html` _(O.S.)_
- 7.1.5 **feedback-stb-roku** — `feedback/feedback-stb-roku.html` _(O.S.)_
- 7.1.6 **feedback-troca-equip** — `feedback/feedback-troca-equip.html` _(O.S.)_
- 7.1.7 **feedback-wifi-extend** — `feedback/feedback-wifi-extend.html` _(O.S.)_
- 7.1.8 **feedback000** — `feedback/feedback000.html` _(O.S.)_


## 8. Termos e documentos

- **Chave do app:** `termo-docs` · **Itens:** 6 (geradores de O.S.: 3)

### 8.1 Encerramentos / fechamento de O.S.  `(/encerramentos/ · 2 arquivo(s), 0 gerador(es))`

- 8.1.1 **luzvermelha / luzvermelha-ext** — `encerramentos/luzvermelha/luzvermelha-ext.html` _(auxiliar)_
- 8.1.2 **luzvermelha / luzvermelha-int** — `encerramentos/luzvermelha/luzvermelha-int.html` _(auxiliar)_

### 8.2 Termo de responsabilidade  `(/termo-resp/ · 4 arquivo(s), 3 gerador(es))`

- 8.2.1 **1termo-resp-pj** — `termo-resp/1termo-resp-pj.html` _(O.S.)_
- 8.2.2 **2termo-resp-padrao** — `termo-resp/2termo-resp-padrao.html` _(auxiliar)_
- 8.2.3 **backup** — `termo-resp/backup.html` _(O.S.)_
- 8.2.4 **termo-resp-padrao** — `termo-resp/termo-resp-padrao.html` _(O.S.)_


## 9. Pesquisa de endereço / CEP

- **Chave do app:** `pesquisa-endereco` · **Itens:** 3 (geradores de O.S.: 1)

### 9.1 Pesquisa de CEP / endereço  `(/pesquisa-cep/ · 3 arquivo(s), 1 gerador(es))`

- 9.1.1 **pesquisa-cep** — `pesquisa-cep/pesquisa-cep.html` _(auxiliar)_
- 9.1.2 **pesquisa-end** — `pesquisa-cep/pesquisa-end.html` _(auxiliar)_
- 9.1.3 **teste** — `pesquisa-cep/teste.html` _(O.S.)_


## 10. Geral / utilidades

- **Chave do app:** `geral` · **Itens:** 18 (geradores de O.S.: 3)

### 10.1 Direcionamento de portas (port forwarding)  `(/direc-portas/ · 2 arquivo(s), 2 gerador(es))`

- 10.1.1 **direc-portas-prot** — `direc-portas/direc-portas-prot.html` _(O.S.)_
- 10.1.2 **direc-portas** — `direc-portas/direc-portas.html` _(O.S.)_

### 10.2 Editor De Bairros.Html  `(/editor-de-bairros.html/ · 1 arquivo(s), 0 gerador(es))`

- 10.2.1 **editor-de-bairros** — `editor-de-bairros.html` _(auxiliar)_

### 10.3 Modelos de texto (estáticos)  `(/modelos/ · 3 arquivo(s), 0 gerador(es))`

- 10.3.1 **index** — `modelos/index.html` _(auxiliar)_
- 10.3.2 **modelos-variadas / modelos-variadas** — `modelos/modelos-variadas/modelos-variadas.html` _(auxiliar)_
- 10.3.3 **modelos-variadas / modelos-variadas1** — `modelos/modelos-variadas/modelos-variadas1.html` _(auxiliar)_

### 10.4 Separadores (utilidade)  `(/separadores/ · 1 arquivo(s), 1 gerador(es))`

- 10.4.1 **separadores** — `separadores/separadores.html` _(O.S.)_

### 10.5 Suporte Os.Html  `(/suporte-os.html/ · 1 arquivo(s), 0 gerador(es))`

- 10.5.1 **suporte-os** — `suporte-os.html` _(auxiliar)_

### 10.6 Teste Autocompletar Bairros.Html  `(/teste-autocompletar-bairros.html/ · 1 arquivo(s), 0 gerador(es))`

- 10.6.1 **teste-autocompletar-bairros** — `teste-autocompletar-bairros.html` _(auxiliar)_

### 10.7 Teste.Html  `(/teste.html/ · 1 arquivo(s), 0 gerador(es))`

- 10.7.1 **teste** — `teste.html` _(auxiliar)_

### 10.8 Tutoriais de reset de roteador  `(/tuto-rot-reset/ · 7 arquivo(s), 0 gerador(es))`

- 10.8.1 **ax2 / ax2** — `tuto-rot-reset/ax2/ax2.html` _(auxiliar)_
- 10.8.2 **grtk1 / tutorial-grtk1** — `tuto-rot-reset/grtk1/tutorial-grtk1.html` _(auxiliar)_
- 10.8.3 **grtk2 / tutorial-grtk2** — `tuto-rot-reset/grtk2/tutorial-grtk2.html` _(auxiliar)_
- 10.8.4 **tuto-home / tutorial** — `tuto-rot-reset/tuto-home/tutorial.html` _(auxiliar)_
- 10.8.5 **tuto-roku** — `tuto-rot-reset/tuto-roku.html` _(auxiliar)_
- 10.8.6 **tutorial** — `tuto-rot-reset/tutorial.html` _(auxiliar)_
- 10.8.7 **zte / tutorial-zte** — `tuto-rot-reset/zte/tutorial-zte.html` _(auxiliar)_

### 10.9 Validação  `(/validacao/ · 1 arquivo(s), 0 gerador(es))`

- 10.9.1 **validacao** — `validacao/validacao.html` _(auxiliar)_


## Necessidades de integração com o MK Solutions (para a outra LLM)

Esta seção resume **o que** precisa ser automatizado. Os detalhes exatos de
endpoint/credenciais do MK Solutions devem ser confirmados (ver "Perguntas em
aberto").

### Cada demanda (item _(O.S.)_) hoje produz 2 saídas

1. **Texto de protocolo** — registro do atendimento/abertura de chamado.
2. **Texto de O.S.** — Ordem de Serviço (quando há visita técnica/ação de campo).

Na automação, cada uma dessas saídas deve virar uma **chamada de API** ao MK
Solutions, em vez de texto para copiar/colar.

### Operações que a API precisa cobrir

- **Consulta de cliente/contrato:** localizar o assinante por login/contrato,
  CPF/CNPJ, nome ou telefone (hoje o atendente digita manualmente).
- **Listagem:** listar protocolos e O.S. de um cliente (e por período/status).
- **Criação de protocolo:** abrir o protocolo com assunto/motivo e descrição.
- **Criação de O.S.:** abrir a Ordem de Serviço vinculada ao contrato/protocolo,
  com tipo/assunto, técnico/equipe, agendamento (data/hora) e observações.
- **Atualização/encerramento:** anexar parecer e encerrar O.S. (ver categorias
  `feedback` e `encerramentos`).

### Campos recorrentes nos geradores (candidatos a payload)

- Identificação: **nome do cliente**, **login/contrato**, **CPF/CNPJ**,
  **telefone/WhatsApp**, **endereço/CEP**.
- Plano: **plano atual**, **plano novo**, valores (alteração de plano / mudança).
- Equipamento: **ONU/ONT**, **roteador** (modelo), **STB/Roku**, número de série.
- Atendimento: **tipo de demanda** (este catálogo), **ocasionado?**,
  **visita paga/isenta**, **presencial/remoto**, **titular/terceiro**,
  **data/hora de agendamento**, **técnico/equipe**, **parecer/observações**.

### Mapeamento sugerido

- Cada **Demanda/Variante** deste catálogo → um **tipo de O.S./assunto** no MK.
- Construir uma **tabela de-para** (`demanda → assunto/serviço/motivo do MK`).
- Reaproveitar os **presets** já migrados em `web/src/data/` (ex.: `manutencao/`,
  `midiaTv/`, `senhaRede/`, `termoDocs/`) como fonte dos campos e textos.

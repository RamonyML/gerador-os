"""Gera o catálogo hierárquico de demandas do legado (suporte/).

Lê `legado-exemplo/suporte/legacy-suporte-inventory.json` e produz um Markdown
detalhado, agrupado por Categoria -> Demanda (pasta) -> Variante (arquivo),
para servir de mapa de requisitos na automação dos protocolos/O.S no MK Solutions.

Uso: python gen_catalogo_demandas.py <inventory.json> <saida.md>
"""
import json
import sys
from collections import OrderedDict, defaultdict

SRC, DST = sys.argv[1], sys.argv[2]

# Ordem + nome amigável das categorias (chave = demandCategoryGuess do JSON).
CATEGORIES = OrderedDict([
    ("manutencao", "Manutenção"),
    ("alteracao-plano", "Alteração de plano"),
    ("mudanca-endereco", "Mudança de endereço"),
    ("midia-tv", "Mídia / TV (Roku, STB, ITTV)"),
    ("wifi-extend", "Wi-Fi Extend / repetidor"),
    ("senha-rede", "Senha de rede"),
    ("feedback", "Feedback de visita técnica"),
    ("termo-docs", "Termos e documentos"),
    ("pesquisa-endereco", "Pesquisa de endereço / CEP"),
    ("geral", "Geral / utilidades"),
])

# Nome amigável da pasta de 1º nível (a "demanda"). Fallback = título da pasta.
FOLDER_LABELS = {
    "altera-senha": "Alteração de senha do Wi-Fi",
    "altplan": "Alteração de plano (catálogo principal)",
    "altplan-ofertado": "Alteração de plano (ofertado / retenção)",
    "compra-roku-tv": "Compra de Roku TV",
    "compra-stb": "Compra de STB (set-top box)",
    "direc-portas": "Direcionamento de portas (port forwarding)",
    "encerramentos": "Encerramentos / fechamento de O.S.",
    "equip-queimado": "Equipamento queimado",
    "feedback": "Feedback de visita técnica",
    "instrutiva": "Visita instrutiva",
    "ittv-upgrades": "ITTV (upgrades / reversão)",
    "lentidao": "Lentidão",
    "luz-vermelha": "Luz vermelha (sem conexão)",
    "luz-vermelha-7dias": "Luz vermelha (reincidência em 7 dias)",
    "modelos": "Modelos de texto (estáticos)",
    "monitoramento": "Monitoramento",
    "mud-end": "Mudança de endereço",
    "mud-ponto-int": "Mudança de ponto interno",
    "olt": "Consulta OLT",
    "pesquisa-cep": "Pesquisa de CEP / endereço",
    "realoc-fibra": "Realocação de fibra",
    "roteador-reset": "Reset de roteador",
    "separadores": "Separadores (utilidade)",
    "sinal-alto": "Sinal alto",
    "termo-resp": "Termo de responsabilidade",
    "teste-ceps": "Testes de CEP (rascunho)",
    "tuto-rot-reset": "Tutoriais de reset de roteador",
    "validacao": "Validação",
    "wi-fi extend": "Wi-Fi Extend / repetidor",
}

# Rótulos para variantes conhecidas (segmento de pasta dentro da demanda).
VARIANT_HINTS = {
    "pj": "PJ (pessoa jurídica)",
    "presencial": "Presencial",
    "pres-terceiro1": "Presencial — terceiro",
    "terceiro1": "Terceiro 1",
    "terceiro2": "Terceiro 2",
    "terceiro3": "Terceiro 3",
    "disp-remoto": "Disponibiliza remoto",
    "isento": "Visita isenta",
    "fibra-externa": "Fibra externa",
    "ocasionado-conector": "Ocasionado — conector",
    "ocasionado-fibra": "Ocasionado — fibra",
    "luzv-pj-padrao": "PJ — padrão",
    "luz-ocas-conec": "Ocasionado — conector",
    "luz-ocas-fibra": "Ocasionado — fibra",
    "ont-queimada": "ONT queimada",
    "onu-queimada": "ONU queimada",
    "roteador-queimado": "Roteador queimado",
    "altplan-remoto": "Remoto",
    "altplan-sem-troca-visita-isenta": "Sem troca — visita isenta",
    "altplan-sem-troca-visita-paga": "Sem troca — visita paga",
    "altplan-troca-visita-isenta": "Com troca — visita isenta",
    "altplan-troca-visita-paga": "Com troca — visita paga",
    "rot-reset-loja": "Loja",
    "migrar": "Migração",
    "tplink": "TP-Link",
    "wi-fi-extend-pj": "PJ",
    "wi-fi-ponto": "Ponto adicional",
    "wifi-ext-ofertado": "Ofertado",
    "com-troca": "Com troca",
    "wifi-ext-ofertado-pj": "Ofertado — PJ",
}

with open(SRC, encoding="utf-8") as fh:
    data = json.load(fh)

items = data["items"]
summary = data["summary"]

# Estrutura: categoria -> pasta(demanda) -> lista de itens
tree = defaultdict(lambda: defaultdict(list))
for it in items:
    cat = it.get("demandCategoryGuess") or "geral"
    parts = it["path"].split("/")
    folder = parts[0]
    tree[cat][folder].append(it)


def variant_label(parts):
    """Rótulo legível para a variante (segmentos entre a pasta e o arquivo)."""
    mids = parts[1:-1]
    file = parts[-1]
    chunks = []
    for m in mids:
        chunks.append(VARIANT_HINTS.get(m, m))
    # nome do arquivo sem extensão como detalhe final
    base = file.rsplit(".", 1)[0]
    chunks.append(base)
    return " / ".join(chunks)


lines = []
W = lines.append

# Numeração de categorias e demandas
cat_index = 0
ordered_cats = [c for c in CATEGORIES if c in tree] + [
    c for c in tree if c not in CATEGORIES
]

for cat in ordered_cats:
    cat_index += 1
    folders = tree[cat]
    total_cat = sum(len(v) for v in folders.values())
    gen_cat = sum(
        1 for v in folders.values() for it in v if it["flags"].get("likelyOsGenerator")
    )
    friendly = CATEGORIES.get(cat, cat.title())
    W("")
    W(f"## {cat_index}. {friendly}")
    W("")
    W(
        f"- **Chave do app:** `{cat}` · **Itens:** {total_cat} "
        f"(geradores de O.S.: {gen_cat})"
    )
    W("")

    folder_index = 0
    for folder in sorted(folders.keys()):
        folder_index += 1
        flabel = FOLDER_LABELS.get(folder, folder.replace("-", " ").title())
        entries = folders[folder]
        gen_f = sum(1 for it in entries if it["flags"].get("likelyOsGenerator"))
        W(
            f"### {cat_index}.{folder_index} {flabel}  "
            f"`(/{folder}/ · {len(entries)} arquivo(s), {gen_f} gerador(es))`"
        )
        W("")
        var_index = 0
        for it in sorted(entries, key=lambda x: x["path"]):
            var_index += 1
            parts = it["path"].split("/")
            label = variant_label(parts)
            is_gen = it["flags"].get("likelyOsGenerator")
            tag = "O.S." if is_gen else "auxiliar"
            W(
                f"- {cat_index}.{folder_index}.{var_index} **{label}** "
                f"— `{it['path']}` _({tag})_"
            )
        W("")

# Cabeçalho com sumário
header = []
H = header.append
H("# Catálogo de Demandas — Suporte (legado `legado-exemplo/suporte/`)")
H("")
H(
    "> Documento gerado automaticamente a partir de `legacy-suporte-inventory.json` "
    f"(inventário de {summary['totalHtml']} páginas HTML, "
    f"{summary['likelyOsGenerators']} prováveis geradores de O.S.).  "
    "Regenerar com `python web/scripts/gen_catalogo_demandas.py "
    "legado-exemplo/suporte/legacy-suporte-inventory.json "
    "CATALOGO-DEMANDAS-SUPORTE.md`."
)
H("")
H("## Objetivo deste documento")
H("")
H(
    "Mapear **todas** as demandas do setor de Suporte (a partir do gerador legado em "
    "`legado-exemplo/suporte/`) para servir de base a uma outra LLM/equipe na "
    "implementação de **endpoints** e na **integração com a API do MK Solutions**."
)
H("")
H(
    "**Dor atual:** o app gera *textos* (um para o **protocolo** e outro para a "
    "**Ordem de Serviço / O.S.**) que hoje são **copiados e colados manualmente** no "
    "MK Solutions (Ctrl+C / Ctrl+V). A meta é **acabar com esse trabalho manual**: "
    "gerar e **inserir automaticamente** protocolos e O.S. no MK via API, além de "
    "permitir **consulta** e **listagem** desses registros."
)
H("")
H("## Como ler este catálogo")
H("")
H(
    "- A hierarquia é **Categoria → Demanda (pasta) → Variante (arquivo/atendimento)**."
)
H(
    "- Cada item traz o **caminho relativo** a `legado-exemplo/suporte/` e uma marcação:"
)
H(
    "  - _(O.S.)_ = página com **gerador** (`gerarTextos()`) que produz texto de "
    "protocolo e/ou de O.S. — é uma demanda real a ser automatizada."
)
H(
    "  - _(auxiliar)_ = página de apoio (tutorial, modelo de texto estático, pesquisa "
    "de CEP, testes) — **não** gera O.S., listada apenas para completude."
)
H(
    "- Variantes comuns: **PJ** (pessoa jurídica), **presencial/remoto**, "
    "**titular/terceiro**, **visita paga/isenta**, **com/sem troca de equipamento**, "
    "**ocasionado** (dano causado pelo cliente) **vs. não ocasionado**."
)
H("")
H("## Sumário por categoria")
H("")
H("| # | Categoria | Chave (`demandCategory`) | Itens |")
H("|---|-----------|--------------------------|-------|")
bd = summary["byDemandGuess"]
i = 0
for cat in ordered_cats:
    i += 1
    H(f"| {i} | {CATEGORIES.get(cat, cat.title())} | `{cat}` | {bd.get(cat, 0)} |")
H(f"| | **Total** | | **{summary['totalHtml']}** |")
H("")
H(
    "> Observação: a coluna usa a contagem heurística do inventário "
    "(`byDemandGuess`). Algumas pastas aparecem em mais de uma categoria (ex.: "
    "`mud-end`, `wi-fi extend`, `encerramentos`) porque os arquivos foram "
    "classificados individualmente — por isso os totais por seção podem divergir "
    "ligeiramente da tabela acima, mas o total geral é {0}.".format(
        summary["totalHtml"]
    )
)
H("")

APPENDIX = """

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

### Perguntas em aberto (a confirmar antes de implementar)

1. Qual a **API do MK Solutions** disponível (REST? SOAP? versão?) e a
   **autenticação** (token, usuário/senha, IP liberado)?
2. Existe **endpoint oficial** para abrir **protocolo** e **O.S.**, ou só via
   integração específica do provedor?
3. Quais os **IDs/códigos** de assunto, motivo, serviço e técnico/equipe no MK?
4. O agendamento de visita usa **agenda do MK** ou a agenda interna do app?
5. Há **ambiente de homologação** para testar sem afetar dados reais?
"""

with open(DST, "w", encoding="utf-8") as fh:
    fh.write("\n".join(header))
    fh.write("\n".join(lines))
    fh.write(APPENDIX)
    fh.write("\n")

print("OK", DST)
print("categorias:", len(ordered_cats), "itens:", len(items))

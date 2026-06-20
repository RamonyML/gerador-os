"""
Gera web/src/data/seedValidacao.json com dados reais da planilha,
ajustando datas para cobrir os 4 status de agendamento.
"""
import sys, json, re, openpyxl
from datetime import datetime, date, timedelta

TODAY = date(2026, 6, 20)
AMANHA = TODAY + timedelta(days=1)

path = sys.argv[1]
wb = openpyxl.load_workbook(path, data_only=True)
ws = wb["base de dados"]

rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if any(v for v in r)]

def clean_html(s):
    return re.sub(r'<[^>]+>', '', str(s or '')).strip()

def clean_text(s):
    return str(s or '').strip()

def parse_nome_atendente(texto):
    texto = clean_text(texto)
    m = re.search(r'MUD END(?:\s*\+\s*ALT\s*PLAN[OA]?)?\s+(.+?)\s+PROT:', texto, re.IGNORECASE)
    nome = m.group(1).strip() if m else ''
    parens = re.findall(r'\(([^)]+)\)', texto)
    atendente = parens[0].strip() if parens else ''
    return nome, atendente

def parse_acompanhante(titular_str, nome_grau_str, tel_str):
    titular = clean_text(titular_str).upper()
    acompanha = titular in ('SIM', 'S')
    if acompanha:
        return True, None
    if nome_grau_str:
        s = clean_text(nome_grau_str)
        m = re.match(r'^(.+?)[.\s]*\(([^)]+)\)', s)
        if m:
            return False, {'nome': m.group(1).strip().rstrip('.'), 'grauParentesco': m.group(2).strip(), 'telefone': clean_text(tel_str)}
        return False, {'nome': s, 'grauParentesco': '', 'telefone': clean_text(tel_str)}
    return False, None

def parse_date(v):
    if isinstance(v, (datetime, date)):
        d = v if isinstance(v, date) else v.date()
        return d.strftime('%Y-%m-%d')
    if v:
        m = re.search(r'(\d{4}-\d{2}-\d{2})', str(v))
        if m: return m.group(1)
    return None

def parse_hora(v):
    if isinstance(v, datetime): return v.strftime('%H:%M')
    if hasattr(v, 'hour'): return f"{v.hour:02d}:{v.minute:02d}"
    if v:
        m = re.search(r'(\d{1,2}):(\d{2})', str(v))
        if m: return f"{int(m.group(1)):02d}:{m.group(2)}"
    return '08:00'

def normalize_pagamento(v):
    v = clean_text(v).upper()
    if 'CART' in v: return 'CARTÃO'
    if 'PIX' in v: return 'PIX'
    if 'DINHEIRO' in v or 'ESPECIE' in v: return 'DINHEIRO'
    return 'ISENTO'

def parse_plano_escolhido(plano_str):
    plano = clean_text(plano_str)
    # Try to extract "PLANO SOLICITADO: ..."
    m = re.search(r'PLANO SOLICITADO[:\s]+(.+?)(?:\.|BENEF|$)', plano, re.IGNORECASE)
    if m:
        return m.group(1).strip()[:100]
    # Fallback: grab PLANO OFERTADO
    m = re.search(r'PLANO OFERTADO[:\s]+(.+?)(?:\.|BENEF|$)', plano, re.IGNORECASE)
    if m:
        return m.group(1).strip()[:100]
    # Last resort: just first 80 chars of the plano info
    lines = plano.split('\n')
    return lines[0][:80] if lines else ''

records = []
for row in rows:
    tipo_raw = clean_text(row[1]).upper()
    telefone = clean_text(row[4])
    data_str = parse_date(row[5])
    hora_str = parse_hora(row[7])
    forma_pag = normalize_pagamento(row[8])
    novo_end = clean_text(row[9])
    equipamento = clean_html(row[10])
    alt_str = row[11]
    plano_str = row[12]
    titular_str = row[13]
    nome_grau = row[14]
    tel_terceiro = row[15]
    texto_comprovante = clean_text(row[16])

    if not data_str or not telefone:
        continue

    tipo = 'MUD END + ALT PLAN' if 'ALT PLAN' in tipo_raw else 'MUD END'
    nome, atendente = parse_nome_atendente(row[0])
    if not nome:
        continue

    titular, acomp = parse_acompanhante(titular_str, nome_grau, tel_terceiro)

    alt_plano = None
    if tipo == 'MUD END + ALT PLAN':
        plano_escolhido = parse_plano_escolhido(plano_str)
        troca = bool(re.search(r'troca|roteador', clean_text(alt_str), re.IGNORECASE))
        alt_plano = {'planoEscolhido': plano_escolhido, 'trocaRoteador': troca}

    valor = 'ISENTO' if forma_pag == 'ISENTO' else 'R$100,00'

    r = {
        'nomeCliente': nome,
        'telefoneCliente': telefone,
        'tipoMudanca': tipo,
        'dataMudanca': data_str,
        'horaMudanca': hora_str,
        'novoEndereco': novo_end,
        'equipamento': equipamento,
        'titularAcompanha': titular,
        'formaPagamento': forma_pag,
        'valorMudanca': valor,
        'mensalidadeVincenda': False,
        'atendente': atendente,
        'textoComprovante': texto_comprovante or None,
        'alteracaoPlano': alt_plano,
    }
    if acomp:
        r['acompanhante'] = acomp
    records.append(r)

# Last 20 = recent data
recent = records[-20:]

# Adjust dates to cover all 4 statuses:
# June 18 → EXECUTADA (past)
# June 20 → EM EXECUÇÃO (today)
# June 21 → VALIDAR HOJE (amanhã)
# June 22 → VALIDAR DEPOIS

for i, r in enumerate(recent):
    d = date.fromisoformat(r['dataMudanca'])
    if d < TODAY:
        if i < 5:
            r['dataMudanca'] = TODAY.isoformat()  # first 5 become today
        elif i < 10:
            r['dataMudanca'] = AMANHA.isoformat()  # next 5 become tomorrow
        # rest stay as past (EXECUTADA)

print(json.dumps(recent, ensure_ascii=False, indent=2))
sys.stderr.write(f"Gerados {len(recent)} registros\n")

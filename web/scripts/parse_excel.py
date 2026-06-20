import sys
import json
import re
import openpyxl
from datetime import datetime, date

path = sys.argv[1]
wb = openpyxl.load_workbook(path, data_only=True)
ws = wb["base de dados"]

rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(v for v in row):
        continue
    rows.append(row)

def parse_nome_atendente(texto):
    if not texto:
        return '', ''
    texto = str(texto)
    # Pattern: ... MUD END [+ ALT PLAN[O]] CLIENT_NAME PROT:xxxx ... (ATENDENTE) - BAIRRO
    m = re.search(r'MUD END(?:\s*\+\s*ALT\s*PLAN[OA]?)?\s+(.+?)\s+PROT:', texto, re.IGNORECASE)
    nome = m.group(1).strip() if m else ''
    # atendente is in parentheses near the end
    parens = re.findall(r'\(([^)]+)\)', texto)
    atendente = parens[0].strip() if parens else ''
    return nome, atendente

def parse_acompanhante(titular_str, nome_grau_str, tel_str):
    titular = str(titular_str).strip().upper() if titular_str else ''
    acompanha = titular in ('SIM', 'S')
    if acompanha:
        return True, None
    if nome_grau_str:
        s = str(nome_grau_str).strip()
        # formato: "NOME. (GRAU)" ou "NOME (GRAU)" ou just "NOME"
        m = re.match(r'^(.+?)[.\s]*\(([^)]+)\)', s)
        if m:
            nome_acomp = m.group(1).strip().rstrip('.')
            grau = m.group(2).strip()
        else:
            nome_acomp = s
            grau = ''
        tel = str(tel_str).strip() if tel_str else ''
        return False, {'nome': nome_acomp, 'grauParentesco': grau, 'telefone': tel}
    return False, None

def parse_alteracao_plano(tipo, alt_str, plano_str):
    if str(tipo or '').strip().upper() != 'MUD END + ALT PLAN':
        return None
    plano = str(plano_str or '').strip()
    # extract plano escolhido from plano_str
    m = re.search(r'PLANO SOLICITADO[:\s]+(.+?)(?:\.|BENEF|\n|$)', plano, re.IGNORECASE)
    if m:
        plano_escolhido = m.group(1).strip()
    else:
        plano_escolhido = plano[:80] if plano else ''
    troca = bool(re.search(r'troca|roteador|equipamento', str(alt_str or ''), re.IGNORECASE))
    return {'planoEscolhido': plano_escolhido, 'trocaRoteador': troca}

def normalize_pagamento(v):
    v = str(v or '').strip().upper()
    if 'CART' in v: return 'CARTÃO'
    if 'PIX' in v: return 'PIX'
    if 'DINHEIRO' in v or 'ESPECIE' in v: return 'DINHEIRO'
    return 'ISENTO'

def normalize_valor(v):
    v = str(v or '').strip()
    if '100' in v: return 'R$100,00'
    if '70' in v: return 'R$70,00'
    return 'ISENTO'

def parse_date(v):
    if isinstance(v, (datetime, date)):
        d = v if isinstance(v, datetime) else datetime(v.year, v.month, v.day)
        return d.strftime('%Y-%m-%d')
    if v:
        m = re.search(r'(\d{4}-\d{2}-\d{2})', str(v))
        if m: return m.group(1)
    return None

def parse_hora(v):
    if isinstance(v, (datetime,)):
        return v.strftime('%H:%M')
    if hasattr(v, 'hour'):
        return f"{v.hour:02d}:{v.minute:02d}"
    if v:
        m = re.search(r'(\d{1,2}):(\d{2})', str(v))
        if m: return f"{int(m.group(1)):02d}:{m.group(2)}"
    return '08:00'

records = []
for row in rows:
    texto_agenda = row[0]
    tipo_raw = str(row[1] or '').strip().upper()
    # col 2 = NOME (often empty)
    conferencia = str(row[3] or '').strip()
    telefone = str(row[4] or '').strip()
    data_str = parse_date(row[5])
    hora_str = parse_hora(row[7])
    forma_pag = normalize_pagamento(row[8])
    novo_end = str(row[9] or '').strip()
    equipamento = str(row[10] or '').strip()
    alt_str = row[11]
    plano_str = row[12]
    titular_str = row[13]
    nome_grau = row[14]
    tel_terceiro = row[15]
    texto_comprovante = str(row[16] or '').strip()
    conferencia_end = str(row[17] or '').strip()
    prazo_ok = str(row[18] or '').strip()

    if not data_str or not telefone:
        continue

    tipo = 'MUD END + ALT PLAN' if 'ALT PLAN' in tipo_raw else 'MUD END'
    nome, atendente = parse_nome_atendente(texto_agenda)
    if not nome:
        continue

    titular, acomp = parse_acompanhante(titular_str, nome_grau, tel_terceiro)
    alt_plano = parse_alteracao_plano(tipo, alt_str, plano_str)

    # Determine status based on prazo_ok field
    status_ag = prazo_ok  # EXECUTADA, EM EXECUÇÃO, VALIDAR HOJE, VALIDAR DEPOIS

    # Normalize valor - look in texto_agenda
    valor = 'ISENTO'
    if 'R$100' in str(texto_agenda or '') or 'CARTAO' in str(texto_agenda or '').upper() or 'CARTÃO' in str(texto_agenda or '').upper():
        valor = 'R$100,00'
    elif 'PIX' in str(texto_agenda or '').upper():
        valor = 'R$100,00'
    if forma_pag == 'ISENTO':
        valor = 'ISENTO'

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
        'status': 'PENDENTE',
        'statusAgendamento': status_ag,
    }
    if acomp:
        r['acompanhante'] = acomp
    records.append(r)

# Get last 25 records (most recent entries)
recent = records[-25:]

print(json.dumps(recent, ensure_ascii=False, indent=2))
sys.stderr.write(f"Total parsed: {len(records)}, exporting last {len(recent)}\n")

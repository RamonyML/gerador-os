
//preciso de um script que gere o texto abaixo.
//importante: preciso de uma condicional. conforme o operador selecionar a quantidade de roteadores adicionais, será exibido os trechos de inputs referente a cada roteador. observe que se trata "roteadores adicionais", então o roteador principal sempre deve aparecer. se o operador selecionar 1 roteador adicional, deverá aparecer o trecho do principal e o secundário. se o operador selecionar 2 roteadores adicionais, deverá aparecer os trechos do principal, secundário e o terceiro. entendeu??
function gerarTexto() {
    const cliente = document.getElementById('cliente').value;
    const canal = document.getElementById('canal').value;
    const contato = document.getElementById('contato').value;
    const dataHora = document.getElementById('dataHora').value;
    const plano = document.getElementById('plano').value;
    const energia = document.getElementById('energia').value;
    const obs = document.getElementById('obs').value;
    const qtdRoteadores = parseInt(document.getElementById('qtdRoteadores').value);

    let texto = `

FIZ FEEDBACK COM ${cliente} POR ${canal.toUpperCase()} (${contato}) DIA ${dataHora} HRS.
CONFIRMOU A ALTERAÇÃO DO PLANO PARA: ${plano} COM A INSTALAÇÃO DE ${quantidade} ROTEADORES ADICIONAIS. CONEXÃO FEITA VIA ${conexao}.

${cliente} CONFIRMOU QUE FOI REALIZADO TESTES DE AFERIÇÃO DA VELOCIDADE, ORIENTAÇÃO DE COBERTURA WI-FI E REDE 2.4G E 5G.

TESTE FEITO NO ROTEADOR PRINCIPAL INSTALADO EM: ${local1}, (${roteador1} MAC: ${mac1}).
- NOTEBOOK DO TECNICO VIA CABO AFERIU ${tecCabo1} MEGA E VIA WI-FI NA REDE 5G AFERIU ${tecWifi1} MEGA
- ${tipoEquip1} DO CLIENTE ${marca1} AFERIU ${veloCliente1} CONECTADO VIA ${conectCliente1}
EQUIPAMENTO LIGADO EM ${energia1}

TESTE FEITO NO SEGUNDO ROTEADOR INSTALADO EM: ${local2}, (${roteador2} MAC: ${mac2}).
- NOTEBOOK DO TECNICO VIA CABO AFERIU ${tecCabo2} MEGA E VIA WI-FI NA REDE 5G AFERIU ${tecWifi2} MEGA
- ${tipoEquip2} DO CLIENTE ${marca2} AFERIU ${veloCliente2} CONECTADO VIA ${conectCliente2}
EQUIPAMENTO LIGADO EM ${energia2}

TESTE FEITO NO TERCEIRO ROTEADOR INSTALADO EM: ${local3}, (${roteador3} MAC: ${mac3}).
- NOTEBOOK DO TECNICO VIA CABO AFERIU ${tecCabo3} MEGA E VIA WI-FI NA REDE 5G AFERIU ${tecWifi3} MEGA
- ${tipoEquip3} DO CLIENTE ${marca3} AFERIU ${veloCliente3} CONECTADO VIA ${conectCliente3}
EQUIPAMENTO LIGADO EM ${energia3}

TESTE FEITO NO QUARTO ROTEADOR INSTALADO EM: ${local4}, (${roteador4} MAC: ${mac4}).
- NOTEBOOK DO TECNICO VIA CABO AFERIU ${tecCabo4} MEGA E VIA WI-FI NA REDE 5G AFERIU ${tecWifi4} MEGA
- ${tipoEquip4} DO CLIENTE ${marca4} AFERIU ${veloCliente4} CONECTADO VIA ${conectCliente4}
EQUIPAMENTO LIGADO EM ${energia4}


O.S SEM CUSTOS

CLIENTE SEM DUVIDAS

OBS: ${obs}`;
}
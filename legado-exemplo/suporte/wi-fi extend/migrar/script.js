document.title = "WI-FI EXT";

document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#dataVisita", {
        dateFormat: "d/m/Y",
        locale: "pt"
    });
});

function gerarTextos() {
    // Obtenha os valores dos campos de entrada
    const cliente = document.getElementById('cliente').value.toUpperCase();
    const canal = document.getElementById('canal').value;
    const contato = document.getElementById('contato').value.replace(/\D/g, '');
    const sinalONU = document.getElementById('sinalONU').value.toUpperCase();
    const bairro = document.getElementById("bairro").value.toUpperCase();
    const planoAtual = document.getElementById('planoAtual').value;
    const planoEscolhido = document.getElementById('planoEscolhido').value
    const roteador = document.getElementById('roteador').value;
    const dataContrato = document.getElementById('dataContrato').value;
    const dataVisita = document.getElementById('dataVisita').value;
    const horaVisita = document.getElementById('horaVisita').value;
    const protocolo = document.getElementById('protocolo').value;
    const vencimentoData = document.getElementById('vencimentoData').value;
    const operador = document.getElementById('operador').value;

    // Verifique se o campo de entrada do sinal da ONU está vazio
    if (operador === "" && !document.getElementById('operador').checked) {
        // Se estiver vazio e a caixa de seleção não estiver marcada, insira "SEM SINAL" no texto do protocolo
        operador = "SEM SINAL";
    }
    
    // Crie os textos com os valores
    const textoProtocolo = `${cliente.split(' ')[0]} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO INFORMAÇÕES SOBRE WI-FI EXTEND.

***********************************

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}

***********************************

QUESTIONADO, ${cliente.split(' ')[0]} INFORMOU QUE SUA RESIDÊNCIA É GRANDE E A REDE WI-FI NÃO ABRANGE TODA A ÁREA DE SUA RESIDENCIA.

INFORMEI AO CLIENTE QUE PARA CASOS COMO ESTE (RESIDENCIA GRANDE, SOBRADO, AREA DE LAZER ETC) TRABALHAMOS COM OS PLANOS QUE POSSUEM O WI-FI EXTEND.

EM RESUMO EXPLIQUEI QUE WI-FI EXTEND CONSISTE NUM SEGUNDO ROTEADOR ADICIONAL QUE TRABALHA NA REDE MESH. ESTE EM SI UTILIZA O MESMO NOME DE REDE E SENHA DO ROTEADOR PRINCIPAL SENDO COMO UM ESCRAVO.
ESTE 2° ROTEADOR FICA EMPRESTADO EM REGIME DE COMODATO.

PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}

PLANO ESCOLHIDO: ${planoEscolhido};
FIDELIDADE DE 12 MESES

***********************************

INFORMEI A NECESSIDADE DO AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO E CONFIGURAÇÃO DO ROTEADOR ADICIONAL, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. 
VISITA ISENTA DE CUSTOS.

***********************************

${cliente.split(' ')[0]} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS, E VISITA TÉCNICA ISENTA DE CUSTOS FOI AGENDADA PARA O DIA ${dataVisita} A PARTIR DE ${horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`;


const textoOS = `${cliente.split(' ')[0]} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}; VENCIMENTO: DIA ${vencimentoData} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES (VIDE CONTRATO). VISITA AGENDADA PARA ${dataVisita} A PARTIR DE ${horaVisita} HRS.

***********************************

INDICAÇÃO TÉCNICA:

TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. INSTALAR 2° ROTEADOR H-199A OU H-196A EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`;


const textoAgenda = `ALT PLANO + WIFI EXTEND ${cliente} PROT:${protocolo} ISENTO (${operador}) - ${bairro}`;

    // Preencha os campos de saída
    document.getElementById('textoProtocolo').value = textoProtocolo;
    document.getElementById('textoOS').value = textoOS;
    document.getElementById('textoAgenda').value = textoAgenda;
}

function copiarTexto(elementId) {
    // Obtenha o elemento de texto a ser copiado
    const texto = document.getElementById(elementId);

    // Selecione o texto no campo de texto
    texto.select();
    document.execCommand('copy');
}


function limparCampos() {
    // Limpe os campos de entrada
    const camposEntrada = document.querySelectorAll('input, select');
    camposEntrada.forEach(campo => {
        campo.value = '';
    });

    // Limpe os campos de saída
    const textos = document.querySelectorAll('.output textarea');
    textos.forEach(texto => {
        texto.value = '';
    });
}

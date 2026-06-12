document.title = "LUZ VERM";

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
    const bairro = document.getElementById('bairro').value.toUpperCase();
    const motivo = document.getElementById('motivo').value.toUpperCase();
    const dataVisita = document.getElementById('dataVisita').value;
    const horaVisita = document.getElementById('horaVisita').value;
    const protocolo = document.getElementById('protocolo').value;
    const formaPag = document.getElementById('formaPag').value;
    const cto = document.getElementById('cto').value.toUpperCase();
    const passante = document.getElementById('passante').value.toUpperCase();
    const operador = document.getElementById('operador').value;
    const onu = document.getElementById('onu').value;    

    // Verifique se o campo de entrada do sinal da ONU está vazio
    if (operador === "" && !document.getElementById('operador').checked) {
        // Se estiver vazio e a caixa de seleção não estiver marcada, insira "SEM SINAL" no texto do protocolo
        operador = "SEM SINAL";
    }
    
    // Crie os textos com os valores
    const textoProtocolo = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.

*******************
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${onu.split(' ')[0]} ${sinalONU}.
    
*******************
    
QUESTIONADO, DISSE QUE A ${onu.split(' ')[0]} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cliente.split(' ')[0]} DISSE QUE ${motivo}.

REMOTAMENTE VERIFIQUEI QUE ${onu.split(' ')[0]} ESTÁ DESCONECTADO/APAGADA.

INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.

*******************

${cliente.split(' ')[0]} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`;


const textoOS = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: ${motivo}, E FICOU SEM ACESSO À INTERNET. PERGUNTEI SOBRE A ${onu.split(' ')[0]}, E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU APAGADA. EXPLIQUEI QUE É NECESSÁRIO REPARO DO DROP, TÉCNICO CONSEGUINDO REAPROVEITAR O CABO, OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA. ${cliente.split(' ')[0]} AUTORIZOU VISITA E PAGARÁ EM ${formaPag} NO ATO. VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: VERIFICAR POSSIBILIDADE REAPROVEITAR CABO DROP USANDO A SOBRA E RECONECTORIZAR, SE NÃO DER TAMANHO, VERIFICAR POSSIBILIDADE DE INCLUIR OUTRA PARTE DE DROP COM EMENDA E COBRAR A VISITA MÍNIMA DE R$50,00. CONFERIR INSTALAÇÃO DOS EQUIPAMENTOS SE TIVER ALGO FORA DO PADRÃO, APRESENTAR E VERIFICAR SE CLIENTE ACEITA CORRIGIR. ATUALIZAR FIRMWARE DO ROTEADOR SE NECESSÁRIO. VERIFICAR COM CLIENTE (OU COM QUEM ACOMPANHAR) SE HÁ DÚVIDAS A SER ESCLARECIDAS. TEMPO ESTIMADO: 60 MIN. <b> CTO: ${cto} // ${passante}.</b>`;


const textoAgenda = `MAN LUZ VERMELHA (OCASIONADO) ${cliente} PROT:${protocolo} ${formaPag} (${operador}) - ${bairro}`;

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
    if (confirm("Tem certeza que deseja limpar todos os campos? 🤔")) {
        const camposEntrada = document.querySelectorAll('input, select');
        camposEntrada.forEach(campo => {
            campo.value = '';
        });
        const textos = document.querySelectorAll('.output textarea');
        textos.forEach(texto => {
            texto.value = '';
        });
    }
}

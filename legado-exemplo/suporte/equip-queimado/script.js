document.title = "EQUIP. QUEIMADO";

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
    const dataVisita = document.getElementById('dataVisita').value;
    const horaVisita = document.getElementById('horaVisita').value;
    const protocolo = document.getElementById('protocolo').value;
    const formaPag = document.getElementById('formaPag').value;
    const roteador = document.getElementById('roteador').value;
    const operador = document.getElementById('operador').value;

    // Verifique se o campo de entrada do sinal da ONU está vazio
    if (operador === "" && !document.getElementById('operador').checked) {
        // Se estiver vazio e a caixa de seleção não estiver marcada, insira "SEM SINAL" no texto do protocolo
        operador = "SEM SINAL";
    }
    
    // Crie os textos com os valores
    const textoProtocolo = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.

*******************
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.
    
*******************
    
QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO.
    
REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU ESTÁ ACESA (SINAL ${sinalONU}). ORIENTEI ${cliente.split(' ')[0]} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, PORÉM, CONEXÃO NÃO RESTABELECEU. 
    
PERGUNTEI A ${cliente.split(' ')[0]} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
    
*******************
    
INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${cliente.split(' ')[0]} CONECTAR O EQUIPAMENTO À ENERGIA CONFORME RECOMENDAÇÃO DA MZNET, ESTARÁ ISENTO DO CUSTO DO ROTEADOR. FICANDO APENAS A COBRANÇA DO DESLOCAMENTO DO TÉCNICO COM O CUSTO DE R$50,00.
    
*******************
    
${cliente.split(' ')[0]} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E PAGARÁ EM ${formaPag}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.

CLIENTE SEM DUVIDAS.`;


const textoOS = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET, QUESTIONADO DISSE QUE "QUE ROTEADOR ESTÁ COM TODAS AS LUZES APAGADAS E ONU ESTÁ LIGADO NORMALMENTE". REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU ESTÁ ACESA (SINAL ${sinalONU}). ORIENTEI ${cliente.split(' ')[0]} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, PORÉM, CONEXÃO NÃO RESTABELECEU. INFORMEI ${cliente.split(' ')[0]} QUE É NECESSÁRIO VISITA TÉCNICA, E QUE HAVENDO PROBLEMAS DE QUEIMA NA FONTE DE ENERGIA OU EQUIPAMENTO NÃO OCASIONADO, SUBSTITUIÇÃO DO COMODATO NÃO HAVERÁ CUSTOS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 MAIS O CUSTO DA PEÇA OU EQUIPAMENTO A SER SUBSTITUÍDO (FONTE R$40,00) OU (ROTEADOR ${roteador}), CLIENTE DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARÁ O PAGAMENTO EM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.

******************************************

INDICAÇÃO TÉCNICA:

TECNICO: CONFERIR ENERGIA DAS TOMADAS, ANALISAR FONTE E ROTEADOR, CASO ENERGIA E FONTE ESTIVER NORMAL, E EQUIPAMENTO NÃO APRESENTAR SINAL DE MAL USO OU QUEDA, SUBSTITUIR FONTE E/OU ROTEADOR QUEIMADO, RESTABELECER CONEXÃO E REALIZAR OS DEVIDOS TESTES. CASO ENERGIA NÃO ESTIVER NORMAL INSTRUIR ${cliente.split(' ')[0]} A VERIFICA-LA E COBRAR VISITA DE R$50,00 + EQUIPAMENTO DANIFICADO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WIFI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.`;


const textoAgenda = `MAN TROCA ROTEADOR ${cliente} PROT:${protocolo} ${formaPag} (${operador}) - ${bairro}`;

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

document.title = "MUD END";

document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#dataVisita", {
        dateFormat: "d/m/Y",
        locale: "pt"
    });
});
// Aqui inicia a validação dos endereço a partir do CEP

const cep = document.querySelector('#cep');
const adress = document.querySelector('#adress');
const bairro = document.querySelector('#bairro');
const message = document.querySelector('#message');

cep.addEventListener('input', () => {
    // Remove caracteres não numéricos (exceto números)
    cep.value = cep.value.replace(/\D/g, '');

    // Verifica se o CEP possui 8 dígitos após a remoção dos caracteres não numéricos
    if (cep.value.length === 8) {
        // Se o CEP tiver 8 dígitos, faz a requisição para buscar o endereço
        buscarEndereco(cep.value);
    } else {
        // Caso contrário, limpa os campos de endereço
        adress.value = '';
        bairro.value = '';
    }
});

cep.addEventListener('focusout', async () => {
    try{
        const onlyNumbers = /^[0-9]+$/;
        const cepValid = /^[0-9]{8}$/;

        if(!onlyNumbers.test(cep.value) || !cepValid.test(cep.value)) {
            throw {cep_error: 'Informe um CEP válido'};
        }

        const response = await fetch(`https://viacep.com.br/ws/${cep.value}/json/`);
            if (!response.ok) {
                    throw await response.json();
            }
            const responseCep = await response.json();
            
            adress.value = responseCep.logradouro;
            bairro.value = responseCep.bairro;

    } catch (error) {
    if (error?.cep_error) {
        message.textContent = error.cep_error;
        setTimeout(() => {
            message.textContent = '';
        }, 5000);
    }
    console.log(error);

    }

})

// aqui termina a validação do endereço

function gerarTextos() {
    // Obtenha os valores dos campos de entrada
    const cliente = document.getElementById('cliente').value.toUpperCase();
    const parente = document.getElementById('parente').value.toUpperCase();
    const autorizado = document.getElementById('autorizado').value.toUpperCase();
    const contatoAut = document.getElementById('contatoAut').value.replace(/\D/g, '');
    const canal = document.getElementById('canal').value;
    const contato = document.getElementById('contato').value.replace(/\D/g, '');
    const sinalONU = document.getElementById('sinalONU').value.toUpperCase();
    const adress = document.getElementById('adress').value.toUpperCase();
    const complemento = document.getElementById('complemento').value.toUpperCase();
    const cep = document.getElementById('cep').value;
    const num = document.getElementById('num').value;
    const prumada = document.getElementById('prumada').value;
    const bairro = document.getElementById('bairro').value.toUpperCase();
    const dataVisita = document.getElementById('dataVisita').value;
    const horaVisita = document.getElementById('horaVisita').value;
    const protocolo = document.getElementById('protocolo').value;
    const formaPag = document.getElementById('formaPag').value;
    const logradouroAntigo = document.getElementById('logradouroAntigo').value.toUpperCase();
    const bairroAntigo = document.getElementById('bairroAntigo').value.toUpperCase();
    const onuOnt = document.getElementById('onuOnt').value;
    const operador = document.getElementById('operador').value;

    // Verifique se o campo de entrada do sinal da ONU está vazio
    if (operador === "" && !document.getElementById('operador').checked) {
        // Se estiver vazio e a caixa de seleção não estiver marcada, insira "SEM SINAL" no texto do protocolo
        operador = "SEM SINAL";
    }
    
    // Crie os textos com os valores
    const textoProtocolo = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

***************
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ${sinalONU}.
    
***************
    
QUESTIONADO, ${cliente.split(' ')[0]} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.
    
ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${cep}
BAIRRO: ${bairro}
    
***************
    
INFORMEI A ${cliente.split(' ')[0]} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.
RESSALTEI QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA).
    
${cliente.split(' ')[0]} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${formaPag}.

${cliente.split(' ')[0]} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizado.split(' ')[0]}: ${contatoAut}).    

        
MUDANÇA AGENDADA PARA DIA ${dataVisita} ${horaVisita} HRS.`;


const textoOS = `${cliente.split(' ')[0]} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU MUDANÇA DE ENDEREÇO, RETIRAR EQUIPAMENTOS DO ENDEREÇO <b>${logradouroAntigo} - ${bairroAntigo}.</b> E INSTALAR NO ENDEREÇO DA O.S. ${cliente.split(' ')[0]} AUTORIZOU ${autorizado} (${parente}) A ENTREGAR EQUIPAMENTOS AO TÉCNICO NO ANTIGO ENDEREÇO (CONTATO DE ${autorizado.split(' ')[0]}: ${contatoAut}). INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cliente.split(' ')[0]} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${dataVisita} ${horaVisita} HRS.


***********************************

INDICAÇÃO TÉCNICA:

REINSTALAR EQUIPAMENTOS NO LOCAL INDICADO PELO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$100,00 NO ATO DA VISITA EM ${formaPag}. <b>${onuOnt}</b>`;


const textoAgenda = `MUD END ${cliente} PROT:${protocolo} ${formaPag} (${operador}) - ${bairro} ${prumada}`;

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


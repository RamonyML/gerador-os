document.title = "PONTO ADICIONAL";

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
    const bairro = document.getElementById("bairro").value.toUpperCase();
    const dataVisita = document.getElementById('dataVisita').value;
    const horaVisita = document.getElementById('horaVisita').value;
    const protocolo = document.getElementById('protocolo').value;
    const operador = document.getElementById('operador').value;
    const parcela = document.getElementById('parcela').value;
    const formaPag = document.getElementById('formaPag').value;
    // Verifique se o campo de entrada do sinal da ONU está vazio
    if (operador === "" && !document.getElementById('operador').checked) {
        // Se estiver vazio e a caixa de seleção não estiver marcada, insira "SEM SINAL" no texto do protocolo
        operador = "SEM SINAL";
    }
    
    // Crie os textos com os valores

const textoOS = `POR ${canal} (${contato}) ${cliente.split(' ')[0]} SOLICITOU A COMPRA DE 01 ROTEADOR ADICIONAL PARA EXPANDIR A ABRANGÊNCIA DA REDE WI-FI DENTRO DA MESMA RESIDÊNCIA EM QUE FOI INSTALADO O PONTO PRINCIPAL (ROTEADOR PRIMÁRIO). VALOR ACORDADO DO ROTEADOR R$360,00 QUE SERÁ PAGO EM ${parcela} NO ${formaPag}. E INSTALAÇÃO/CONFIGURAÇÃO GRÁTIS. VISITA AGENDADA PARA INSTALAÇÃO DO EQUIPAMENTO EM ${dataVisita} ÀS ${horaVisita} HORAS.

***********************************

INDICAÇÃO TÉCNICA:

TÉCNICO: INSTALAR ROTEADOR H-199A OU H-196A EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. CONFIGURAR REDE, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO ESTIVER NO PADRÃO. RECEBER O VALOR DO EQUIPAMENTO E SERVIÇO NA FORMA COMBINADA. TEMPO ESTIMADO 60 MIN.`;


const textoAgenda = `PONTO ADICIONAL ${cliente} PROT:${protocolo} ${formaPag.split(' ')[0]} (${operador}) - ${bairro}`;

    // Preencha os campos de saída
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

    document.addEventListener('DOMContentLoaded', function () {
        flatpickr("#dataVisita", {
            dateFormat: "d/m/Y",
            locale: "pt",
            onChange: function(selectedDates, dateStr, instance) {
                const date = new Date(dateStr.split('/').reverse().join('-'));
                const day = date.getDay();
                const horaVisita = document.getElementById('horaVisita');
    
                if (day === 5) { // Sábado
                    horaVisita.innerHTML = `
                        <option value="08:30">08:30</option>
                        <option value="09:30">09:30</option>
                        <option value="10:30">10:30</option>
                        <option value="11:30">11:30</option>
                    `;
                    horaVisita.disabled = false;
                } else if (day === 6) { // Domingo
                    horaVisita.innerHTML = '';
                    horaVisita.disabled = true;
                } else {
                    horaVisita.innerHTML = `
                        <option value="08:30">08:30</option>
                        <option value="09:30">09:30</option>
                        <option value="10:30">10:30</option>
                        <option value="11:30">11:30</option>
                        <option value="13:30">13:30</option>
                        <option value="14:30">14:30</option>
                        <option value="15:30">15:30</option>
                        <option value="16:30">16:30</option>
                        <option value="17:30">17:30</option>
                    `;
                    horaVisita.disabled = false;
                }
            }
        });
    });

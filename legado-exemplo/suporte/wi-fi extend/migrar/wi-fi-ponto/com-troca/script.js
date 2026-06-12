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
    const roteador = document.getElementById('roteador').value;
    // Verifique se o campo de entrada do sinal da ONU está vazio
    if (operador === "" && !document.getElementById('operador').checked) {
        // Se estiver vazio e a caixa de seleção não estiver marcada, insira "SEM SINAL" no texto do protocolo
        operador = "SEM SINAL";
    }
    
    // Crie os textos com os valores

const textoOS = `POR ${canal} (${contato}) ${cliente.split(' ')[0]} SOLICITOU A COMPRA DE 01 ROTEADOR ADICIONAL PARA EXPANDIR A ABRANGÊNCIA DA REDE WI-FI DENTRO DA MESMA RESIDÊNCIA EM QUE FOI INSTALADO O PONTO PRINCIPAL (ROTEADOR PRIMÁRIO). VALOR ACORDADO DO ROTEADOR R$360,00 QUE SERÁ PAGO EM ${parcela} NO ${formaPag}. INSTALAÇÃO/CONFIGURAÇÃO GRÁTIS. VISITA AGENDADA PARA INSTALAÇÃO DO EQUIPAMENTO EM ${dataVisita} ÀS ${horaVisita} HORAS.

***********************************

INDICAÇÃO TÉCNICA:

TÉCNICO: CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ${roteador} POR ROTEADOR H-199A E CONFIGURAR COMO PONTO PRINCIPAL. INSTALAR ROTEADOR EXTEND H-199A OU H-196A EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP'S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV'S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO, DAR EXPLICAÇÕES. RECEBER O VALOR DO EQUIPAMENTO E SERVIÇO NA FORMA COMBINADA. TEMPO ESTIMADO 60 MIN.


`;


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

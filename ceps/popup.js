// Função para formatar o CEP
function formatarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 5) {
        cep = cep.substring(0, 5) + '-' + cep.substring(5);
    }
    return cep;
}

// Variáveis globais para paginação
let resultadosCompletos = [];
let paginaAtual = 0;
const resultadosPorPagina = 20;

// Adiciona todos os event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para formatação do CEP
    const cepInput = document.getElementById('cepBusca');
    cepInput.addEventListener('input', function(e) {
        this.value = formatarCEP(this.value);
    });

    // Event listener para Enter no campo de logradouro
    const logradouroInput = document.getElementById('logradouro');
    logradouroInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarEndereco();
        }
    });

    // Event listener para Enter no campo de CEP
    cepInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarPorCEP();
        }
    });

    // Event listeners para os botões
    document.getElementById('btnBuscarLogradouro').addEventListener('click', buscarEndereco);
    document.getElementById('btnBuscarCEP').addEventListener('click', buscarPorCEP);
    document.getElementById('btnLimpar').addEventListener('click', limparCampos);
});

// Função para mostrar/ocultar loading
function toggleLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'flex' : 'none';
}

// Função auxiliar para buscar CEP com fallback
async function buscarCEPComFallback(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('ViaCEP fora do ar');
        const data = await response.json();
        if (data.erro) throw new Error('CEP não encontrado');
        return {
            cep: data.cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf
        };
    } catch (e) {

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!response.ok) throw new Error('BrasilAPI fora do ar');
            const data = await response.json();
            if (data.errors) throw new Error('CEP não encontrado');
            return {
                cep: data.cep,
                logradouro: data.street,
                bairro: data.neighborhood,
                localidade: data.city,
                uf: data.state
            };
        } catch (e2) {
            throw new Error('Nenhum serviço de CEP disponível no momento.');
        }
    }
}

// Função auxiliar para buscar logradouro com fallback
async function buscarLogradouroComFallback(uf, cidade, logradouro) {
    // Tenta ViaCEP primeiro
    try {
        const url = `https://viacep.com.br/ws/${uf}/${cidade}/${encodeURIComponent(logradouro)}/json/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('ViaCEP fora do ar');
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Nenhum endereço encontrado');
        return data;
    } catch (e) {
        // Fallback para BrasilAPI
        try {
            const url = `https://brasilapi.com.br/api/cep/v2/${encodeURIComponent(logradouro)}?city=${encodeURIComponent(cidade)}&state=${uf}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('BrasilAPI fora do ar');
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Nenhum endereço encontrado');
            // Adaptar formato para o mesmo da ViaCEP
            return data.map(item => ({
                cep: item.cep,
                logradouro: item.street,
                bairro: item.neighborhood,
                localidade: item.city,
                uf: item.state
            }));
        } catch (e2) {
            throw new Error('Nenhum serviço de endereço disponível no momento.');
        }
    }
}

// Função para buscar endereço por CEP
async function buscarPorCEP() {
    const cepInput = document.getElementById('cepBusca');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        mostrarAlerta('Por favor, digite um CEP válido com 8 dígitos.', 'warning');
        return;
    }

    // Reset da paginação
    paginaAtual = 0;
    resultadosCompletos = [];

    toggleLoading(true);
    
    try {
        console.log('Iniciando busca por CEP:', cep);
        const data = await buscarCEPComFallback(cep);
        // Verifica se o endereço é de Uberlândia
        if (data.localidade.toUpperCase() !== 'UBERLÂNDIA' || data.uf !== 'MG') {
            throw new Error('CEP não pertence a Uberlândia-MG');
        }
        resultadosCompletos = [data];
        mostrarResultadoPaginado();
    } catch (error) {
        console.error('Erro detalhado ao buscar CEP:', error);
        let mensagem = 'CEP não encontrado. Verifique se o CEP está correto.';
        if (error.message === 'CEP não pertence a Uberlândia-MG') {
            mensagem = 'Este CEP não pertence a Uberlândia-MG';
        } else if (error.message.includes('Nenhum serviço')) {
            mensagem = error.message;
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            mensagem = 'Erro de conexão. Verifique sua internet ou se os serviços de CEP estão acessíveis.';
        } else if (error.message.includes('CORS')) {
            mensagem = 'Erro de CORS. Tente novamente em alguns instantes.';
        }
        mostrarAlerta(mensagem, 'warning');
    } finally {
        toggleLoading(false);
    }
}

// Função para buscar endereço por logradouro
async function buscarEndereco() {
    const logradouro = document.getElementById("logradouro").value.trim();
    if (!logradouro) {
        mostrarAlerta('Por favor, digite um logradouro para pesquisar.', 'warning');
        return;
    }
    // Reset da paginação
    paginaAtual = 0;
    resultadosCompletos = [];
    toggleLoading(true);
    try {
        console.log('Iniciando busca por logradouro:', logradouro);
        // 60 segundos de timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        let data;
        try {
            data = await buscarLogradouroComFallback('MG', 'Uberlandia', logradouro);
        } finally {
            clearTimeout(timeoutId);
        }
        resultadosCompletos = data;
        mostrarResultadoPaginado();
    } catch (error) {
        console.error('Erro detalhado ao buscar endereço:', error);
        let mensagem = 'Erro ao buscar endereço. ';
        if (error.name === 'AbortError') {
            mensagem = 'A busca demorou muito. Tente um termo mais específico (ex: "rua maria" em vez de apenas "maria").';
        } else if (error.message.includes('Nenhum serviço')) {
            mensagem = error.message;
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            mensagem += 'Verifique sua conexão com a internet ou se os serviços de CEP estão acessíveis.';
        } else if (error.message.includes('CORS')) {
            mensagem += 'Erro de CORS. Tente novamente em alguns instantes.';
        } else {
            mensagem += error.message;
        }
        mostrarAlerta(mensagem, 'warning');
    } finally {
        toggleLoading(false);
    }
}

// Função para mostrar resultado com paginação
function mostrarResultadoPaginado() {
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "";
    
    if (!resultadosCompletos || resultadosCompletos.length === 0) {
        mostrarAlerta('Nenhum endereço encontrado para o logradouro informado.', 'warning');
        return;
    }

    // Calcular resultados da página atual
    const inicio = paginaAtual * resultadosPorPagina;
    const fim = inicio + resultadosPorPagina;
    const resultadosPagina = resultadosCompletos.slice(inicio, fim);
    const totalPaginas = Math.ceil(resultadosCompletos.length / resultadosPorPagina);

    let html = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #38af47;">✅ ${resultadosCompletos.length} endereço(s) encontrado(s)</strong>
            ${resultadosCompletos.length > resultadosPorPagina ? 
                `<br><small style="color: #666;">Mostrando ${inicio + 1}-${Math.min(fim, resultadosCompletos.length)} de ${resultadosCompletos.length} (Página ${paginaAtual + 1} de ${totalPaginas})</small>` : 
                ''
            }
        </div>
    `;

    // Adicionar controles de paginação se necessário
    if (resultadosCompletos.length > resultadosPorPagina) {
        html += `
            <div style="margin-bottom: 10px; display: flex; gap: 5px; justify-content: center;">
                <button id="btnAnterior" 
                        style="padding: 5px 10px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px;"
                        ${paginaAtual === 0 ? 'disabled' : ''}>
                    ← Anterior
                </button>
                <span style="padding: 5px 10px; background: #f5f5f5; border-radius: 3px;">
                    ${paginaAtual + 1} / ${totalPaginas}
                </span>
                <button id="btnProximo" 
                        style="padding: 5px 10px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px;"
                        ${paginaAtual >= totalPaginas - 1 ? 'disabled' : ''}>
                    Próximo →
                </button>
            </div>
        `;
    }

    // Tabela de resultados
    html += `
        <table class="table">
            <thead>
                <tr>
                    <th>CEP</th>
                    <th>Bairro</th>
                    <th>Logradouro</th>
                </tr>
            </thead>
            <tbody>
    `;

    resultadosPagina.forEach(function(endereco) {
        html += `
            <tr>
                <td><strong>${endereco.cep || 'N/A'}</strong></td>
                <td>${endereco.bairro || 'N/A'}</td>
                <td>${endereco.logradouro || 'N/A'}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    // Adicionar dica para muitos resultados
    if (resultadosCompletos.length > 50) {
        html += `
            <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; font-size: 11px;">
                💡 <strong>Dica:</strong> Para resultados mais precisos, tente usar termos mais específicos como "rua maria" ou "avenida maria" em vez de apenas "maria".
            </div>
        `;
    }

    resultadoDiv.innerHTML = html;

    // Adicionar event listeners para os botões de paginação
    if (resultadosCompletos.length > resultadosPorPagina) {
        const btnAnterior = document.getElementById('btnAnterior');
        const btnProximo = document.getElementById('btnProximo');
        
        if (btnAnterior) {
            btnAnterior.addEventListener('click', function() {
                mudarPagina(paginaAtual - 1);
            });
        }
        
        if (btnProximo) {
            btnProximo.addEventListener('click', function() {
                mudarPagina(paginaAtual + 1);
            });
        }
    }
}

// Função para mudar página
function mudarPagina(novaPagina) {
    const totalPaginas = Math.ceil(resultadosCompletos.length / resultadosPorPagina);
    
    if (novaPagina >= 0 && novaPagina < totalPaginas) {
        paginaAtual = novaPagina;
        mostrarResultadoPaginado();
    }
}

// Função para mostrar alertas
function mostrarAlerta(mensagem, tipo) {
    const resultadoDiv = document.getElementById("resultado");
    const alertClass = tipo === 'warning' ? 'alert-warning' : 'alert-success';
    const icon = tipo === 'warning' ? '⚠️' : '✅';
    
    resultadoDiv.innerHTML = `
        <div class="alert ${alertClass}">
            <span>${icon}</span>
            <span>${mensagem}</span>
        </div>
    `;
}

// Função para limpar campos
function limparCampos() {
    document.getElementById("logradouro").value = "";
    document.getElementById("cepBusca").value = "";
    document.getElementById("resultado").innerHTML = "";
    // Reset da paginação
    paginaAtual = 0;
    resultadosCompletos = [];
}

// Função para copiar CEP para a área de transferência
function copiarCEP(cep) {
    navigator.clipboard.writeText(cep).then(function() {
        // Mostrar feedback visual
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✅ Copiado!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#38af47';
        }, 2000);
    }).catch(function(err) {
        console.error('Erro ao copiar: ', err);
    });
}

// Adicionar funcionalidade de copiar CEP quando clicar na célula
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'TD' && e.target.textContent.match(/^\d{5}-\d{3}$/)) {
        copiarCEP(e.target.textContent);
    }
}); 
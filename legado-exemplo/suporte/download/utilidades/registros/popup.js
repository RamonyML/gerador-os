// Classe principal para gerenciar as mensagens
class MensagensRapidas {
    constructor() {
        this.messages = [];
        this.currentEditId = null;
        this.init();
    }

    // Inicialização da extensão
    async init() {
        await this.loadMessages();
        this.setupEventListeners();
        this.renderMessages();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botão adicionar
        document.getElementById('addButton').addEventListener('click', () => {
            this.addMessage();
        });

        // Barra de pesquisa
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterMessages(e.target.value);
        });

        // Modal de edição
        const modal = document.getElementById('editModal');
        const closeBtn = document.querySelector('.close');
        const saveEditBtn = document.getElementById('saveEditButton');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        saveEditBtn.addEventListener('click', () => {
            this.saveEdit();
        });

        // Enter para adicionar mensagem
        document.getElementById('titleInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addMessage();
            }
        });

        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.addMessage();
            }
        });

        // Botão exportar para TXT
        document.getElementById('exportTxtButton').addEventListener('click', () => {
            this.exportToTxt();
        });

        // Botão importar TXT
        document.getElementById('importTxtButton').addEventListener('click', () => {
            document.getElementById('importTxtInput').click();
        });
        document.getElementById('importTxtInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.importFromTxt(file);
            e.target.value = '';
        });

        // Delegação de eventos para botões de ação
        document.getElementById('messagesList').addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            if (action === 'copy') this.copyMessageById(Number(id));
            if (action === 'edit') this.editMessage(Number(id));
            if (action === 'delete') this.deleteMessage(Number(id));
        });
    }

    // Carregar mensagens do storage
    async loadMessages() {
        try {
            const result = await chrome.storage.local.get(['messages']);
            this.messages = result.messages || [];
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            this.messages = [];
        }
    }

    // Salvar mensagens no storage
    async saveMessages() {
        try {
            await chrome.storage.local.set({ messages: this.messages });
        } catch (error) {
            console.error('Erro ao salvar mensagens:', error);
        }
    }

    // Adicionar nova mensagem
    addMessage() {
        const titleInput = document.getElementById('titleInput');
        const messageInput = document.getElementById('messageInput');
        
        const title = titleInput.value.trim();
        const message = messageInput.value.trim();

        if (!title || !message) {
            this.showNotification('Por favor, preencha o título e a mensagem!', 'error');
            return;
        }

        const newMessage = {
            id: Date.now(),
            title: title,
            message: message,
            createdAt: new Date().toISOString()
        };

        this.messages.unshift(newMessage);
        this.saveMessages();
        this.renderMessages();

        // Limpar campos
        titleInput.value = '';
        messageInput.value = '';
        titleInput.focus();

        this.showNotification('Mensagem salva com sucesso!', 'success');
    }

    // Editar mensagem
    editMessage(id) {
        const message = this.messages.find(m => m.id === id);
        if (!message) return;

        this.currentEditId = id;
        
        document.getElementById('editTitleInput').value = message.title;
        document.getElementById('editMessageInput').value = message.message;
        
        document.getElementById('editModal').style.display = 'block';
    }

    // Salvar edição
    saveEdit() {
        const title = document.getElementById('editTitleInput').value.trim();
        const message = document.getElementById('editMessageInput').value.trim();

        if (!title || !message) {
            this.showNotification('Por favor, preencha o título e a mensagem!', 'error');
            return;
        }

        const index = this.messages.findIndex(m => m.id === this.currentEditId);
        if (index !== -1) {
            this.messages[index].title = title;
            this.messages[index].message = message;
            this.messages[index].updatedAt = new Date().toISOString();

            this.saveMessages();
            this.renderMessages();
            
            document.getElementById('editModal').style.display = 'none';
            this.currentEditId = null;

            this.showNotification('Mensagem atualizada com sucesso!', 'success');
        }
    }

    // Excluir mensagem
    deleteMessage(id) {
        if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
            this.messages = this.messages.filter(m => m.id !== id);
            this.saveMessages();
            this.renderMessages();
            this.showNotification('Mensagem excluída com sucesso!', 'success');
        }
    }

    // Copiar mensagem para clipboard
    async copyMessage(message) {
        try {
            await navigator.clipboard.writeText(message);
            this.showNotification('Mensagem copiada para a área de transferência!', 'success');
        } catch (error) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = message;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Mensagem copiada para a área de transferência!', 'success');
        }
    }

    // Filtrar mensagens
    filterMessages(searchTerm) {
        const messageItems = document.querySelectorAll('.message-item');
        const searchLower = searchTerm.toLowerCase();

        messageItems.forEach(item => {
            const title = item.querySelector('.message-title').textContent.toLowerCase();
            const content = item.querySelector('.message-content').textContent.toLowerCase();
            
            if (title.includes(searchLower) || content.includes(searchLower)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Renderizar mensagens na interface
    renderMessages() {
        const messagesList = document.getElementById('messagesList');
        
        if (this.messages.length === 0) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <p>📝 Nenhuma mensagem salva ainda</p>
                    <p>Adicione sua primeira mensagem rápida acima!</p>
                </div>
            `;
            return;
        }

        messagesList.innerHTML = this.messages.map(message => `
            <div class="message-item" data-id="${message.id}">
                <div class="message-header">
                    <div class="message-title">${this.escapeHtml(message.title)}</div>
                    <div class="message-actions">
                        <button class="action-btn btn-success" data-action="copy" data-id="${message.id}" title="Copiar">📋</button>
                        <button class="action-btn btn-secondary" data-action="edit" data-id="${message.id}" title="Editar">✏️</button>
                        <button class="action-btn btn-danger" data-action="delete" data-id="${message.id}" title="Excluir">🗑️</button>
                    </div>
                </div>
                <div class="message-content">${this.escapeHtml(message.message)}</div>
            </div>
        `).join('');
    }

    // Escapar HTML para segurança
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Remover notificação anterior se existir
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Cores baseadas no tipo
        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#17a2b8';
        }

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Exportar mensagens para TXT
    exportToTxt() {
        if (!this.messages.length) {
            this.showNotification('Nenhuma mensagem para exportar!', 'error');
            return;
        }
        let txt = '';
        this.messages.forEach((msg, idx) => {
            txt += `Título: ${msg.title}\nMensagem: ${msg.message}\n`;
            if (idx < this.messages.length - 1) txt += '\n';
        });
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mensagens-rapidas.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(a.href);
            a.remove();
        }, 100);
    }

    // Copiar mensagem por ID
    copyMessageById(id) {
        const msg = this.messages.find(m => m.id === id);
        if (msg) this.copyMessage(msg.message);
    }

    // Importar mensagens de TXT
    async importFromTxt(file) {
        try {
            const text = await file.text();
            // Espera formato: Título: ...\nMensagem: ...\n\n
            const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
            let importCount = 0;
            for (const block of blocks) {
                const titleMatch = block.match(/^Título: (.*)$/m);
                const msgMatch = block.match(/^Mensagem: ([\s\S]*)$/m);
                if (titleMatch && msgMatch) {
                    const title = titleMatch[1].trim();
                    const message = msgMatch[1].trim();
                    // Evitar duplicatas exatas
                    if (!this.messages.some(m => m.title === title && m.message === message)) {
                        this.messages.unshift({
                            id: Date.now() + Math.floor(Math.random()*10000),
                            title,
                            message,
                            importedAt: new Date().toISOString()
                        });
                        importCount++;
                    }
                }
            }
            if (importCount > 0) {
                await this.saveMessages();
                this.renderMessages();
                this.showNotification(`Importado com sucesso: ${importCount} mensagem(ns)!`, 'success');
            } else {
                this.showNotification('Nenhuma mensagem válida encontrada no arquivo.', 'error');
            }
        } catch (err) {
            this.showNotification('Erro ao importar arquivo TXT.', 'error');
        }
    }
}

// Adicionar estilos CSS para animações de notificação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar a extensão
const mensagensRapidas = new MensagensRapidas(); 
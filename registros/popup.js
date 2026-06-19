firebase.initializeApp(window.__REGISTROS_FIREBASE_CONFIG__);

function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString('pt-BR');
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString('pt-BR');
    }
  } catch (_) {
    /* ignore */
  }
  return '';
}

class MensagensRapidas {
  constructor() {
    this.messages = [];
    this.currentEditId = null;
    this.firestoreUnsub = null;
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.currentUser = null;
    this.cacheDom();
    this.setupEventListeners();
    this.auth.onAuthStateChanged(
      (user) => this.handleAuth(user),
      (err) => {
        console.error(err);
        this.showScreen('login');
        this.showLoginError('Não foi possível verificar a sessão.');
      }
    );
  }

  cacheDom() {
    this.screens = {
      loading: document.getElementById('screenLoading'),
      login: document.getElementById('screenLogin'),
      app: document.getElementById('screenApp')
    };
    this.el = {
      loginEmail: document.getElementById('loginEmail'),
      loginPassword: document.getElementById('loginPassword'),
      loginButton: document.getElementById('loginButton'),
      loginError: document.getElementById('loginError'),
      logoutButton: document.getElementById('logoutButton'),
      userEmail: document.getElementById('userEmail'),
      titleInput: document.getElementById('titleInput'),
      messageInput: document.getElementById('messageInput'),
      addButton: document.getElementById('addButton'),
      searchInput: document.getElementById('searchInput'),
      messagesList: document.getElementById('messagesList'),
      exportTxtButton: document.getElementById('exportTxtButton'),
      editModal: document.getElementById('editModal'),
      editTitleInput: document.getElementById('editTitleInput'),
      editMessageInput: document.getElementById('editMessageInput'),
      saveEditButton: document.getElementById('saveEditButton'),
      syncBanner: document.getElementById('syncBanner'),
      syncBannerText: document.getElementById('syncBannerText')
    };
  }

  showScreen(name) {
    Object.entries(this.screens).forEach(([key, el]) => {
      el.classList.toggle('screen-active', key === name);
    });
  }

  showLoginError(text) {
    this.el.loginError.textContent = text;
    this.el.loginError.hidden = false;
  }

  hideLoginError() {
    this.el.loginError.hidden = true;
    this.el.loginError.textContent = '';
  }

  mapAuthError(err) {
    const code = err && err.code;
    const map = {
      'auth/invalid-email': 'E-mail inválido.',
      'auth/user-disabled': 'Esta conta foi desativada.',
      'auth/user-not-found': 'Usuário ou senha incorretos.',
      'auth/wrong-password': 'Usuário ou senha incorretos.',
      'auth/invalid-credential': 'Usuário ou senha incorretos.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco.',
      'auth/network-request-failed': 'Sem conexão. Verifique a internet.'
    };
    return map[code] || 'Não foi possível entrar. Tente novamente.';
  }

  mapFirestoreError(err) {
    const code = err && err.code;
    if (code === 'permission-denied') {
      return 'Sem permissão no Firestore. Verifique CONFIGURACAO.txt (regras e domínio da extensão).';
    }
    if (code === 'failed-precondition') {
      return 'Índice do Firestore pendente ou consulta inválida. Veja o console do Firebase.';
    }
    return 'Erro ao sincronizar dados. Tente de novo.';
  }

  handleAuth(user) {
    this.hideLoginError();
    if (!user) {
      this.detachFirestore();
      this.currentUser = null;
      this.showScreen('login');
      this.el.loginPassword.value = '';
      return;
    }
    this.currentUser = user;
    this.el.userEmail.textContent = user.email || user.uid;
    this.showScreen('app');
    this.attachFirestore(user.uid);
  }

  detachFirestore() {
    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }
    this.messages = [];
    this.renderMessages();
    this.hideSyncError();
  }

  attachFirestore(uid) {
    this.detachFirestore();
    const q = this.db
      .collection('mensagensRapidas')
      .doc(uid)
      .collection('itens')
      .orderBy('createdAt', 'desc');

    this.firestoreUnsub = q.onSnapshot(
      (snap) => {
        this.messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        this.hideSyncError();
        this.renderMessages();
      },
      (err) => {
        console.error(err);
        this.showSyncError(this.mapFirestoreError(err));
      }
    );
  }

  itemsCol() {
    return this.db.collection('mensagensRapidas').doc(this.currentUser.uid).collection('itens');
  }

  showSyncError(msg) {
    this.el.syncBanner.hidden = false;
    this.el.syncBannerText.textContent = msg;
  }

  hideSyncError() {
    this.el.syncBanner.hidden = true;
    this.el.syncBannerText.textContent = '';
  }

  setupEventListeners() {
    this.el.loginButton.addEventListener('click', () => this.doLogin());
    this.el.loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.doLogin();
    });

    this.el.logoutButton.addEventListener('click', () => this.auth.signOut());

    this.el.addButton.addEventListener('click', () => this.addMessage());
    this.el.titleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addMessage();
    });
    this.el.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) this.addMessage();
    });

    this.el.searchInput.addEventListener('input', (e) => this.filterMessages(e.target.value));

    this.el.exportTxtButton.addEventListener('click', () => this.exportToTxt());

    const modal = this.el.editModal;
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        modal.style.display = 'none';
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    this.el.saveEditButton.addEventListener('click', () => this.saveEdit());

    this.el.messagesList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'copy') this.copyMessageById(id);
      if (action === 'edit') this.editMessage(id);
      if (action === 'delete') this.deleteMessage(id);
    });
  }

  async doLogin() {
    const email = this.el.loginEmail.value.trim();
    const password = this.el.loginPassword.value;
    this.hideLoginError();
    if (!email || !password) {
      this.showLoginError('Informe e-mail e senha.');
      return;
    }
    this.el.loginButton.disabled = true;
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      this.showLoginError(this.mapAuthError(err));
    } finally {
      this.el.loginButton.disabled = false;
    }
  }

  async addMessage() {
    if (!this.currentUser) return;

    const title = this.el.titleInput.value.trim();
    const message = this.el.messageInput.value.trim();

    if (!title || !message) {
      this.showNotification('Preencha título e mensagem.', 'error');
      return;
    }

    try {
      await this.itemsCol().add({
        title,
        message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.el.titleInput.value = '';
      this.el.messageInput.value = '';
      this.el.titleInput.focus();
      this.showNotification('Mensagem salva.', 'success');
    } catch (err) {
      console.error(err);
      this.showNotification('Erro ao salvar.', 'error');
    }
  }

  editMessage(id) {
    const message = this.messages.find((m) => m.id === id);
    if (!message) return;

    this.currentEditId = id;
    this.el.editTitleInput.value = message.title;
    this.el.editMessageInput.value = message.message;
    this.el.editModal.style.display = 'block';
  }

  async saveEdit() {
    if (!this.currentUser || !this.currentEditId) return;

    const title = this.el.editTitleInput.value.trim();
    const message = this.el.editMessageInput.value.trim();

    if (!title || !message) {
      this.showNotification('Preencha título e mensagem.', 'error');
      return;
    }

    try {
      await this.itemsCol().doc(this.currentEditId).update({
        title,
        message,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.el.editModal.style.display = 'none';
      this.currentEditId = null;
      this.showNotification('Mensagem atualizada.', 'success');
    } catch (err) {
      console.error(err);
      this.showNotification('Erro ao atualizar.', 'error');
    }
  }

  async deleteMessage(id) {
    if (!this.currentUser) return;
    if (!confirm('Excluir esta mensagem?')) return;

    try {
      await this.itemsCol().doc(id).delete();
      this.showNotification('Mensagem excluída.', 'success');
    } catch (err) {
      console.error(err);
      this.showNotification('Erro ao excluir.', 'error');
    }
  }

  async copyMessage(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copiado.', 'success');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('Copiado.', 'success');
    }
  }

  filterMessages(searchTerm) {
    const messageItems = document.querySelectorAll('.message-item');
    const searchLower = searchTerm.toLowerCase();

    messageItems.forEach((item) => {
      const title = item.querySelector('.message-title').textContent.toLowerCase();
      const content = item.querySelector('.message-content').textContent.toLowerCase();

      item.style.display =
        title.includes(searchLower) || content.includes(searchLower) ? 'block' : 'none';
    });
  }

  renderMessages() {
    const messagesList = this.el.messagesList;

    if (!this.messages.length) {
      messagesList.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma mensagem ainda.</p>
                    <p>Adicione a primeira ao lado.</p>
                </div>
            `;
      return;
    }

    messagesList.innerHTML = this.messages
      .map((message) => {
        const meta = formatTimestamp(message.updatedAt || message.createdAt);
        const metaHtml = meta
          ? `<div class="message-meta">${this.escapeHtml(meta)}</div>`
          : '';
        return `
                <div class="message-item" data-id="${this.escapeHtml(message.id)}">
                    <div class="message-header">
                        <div class="message-title">${this.escapeHtml(message.title)}</div>
                        <div class="message-actions">
                            <button type="button" class="action-btn btn-success" data-action="copy" data-id="${this.escapeHtml(message.id)}" title="Copiar">Copiar</button>
                            <button type="button" class="action-btn btn-secondary" data-action="edit" data-id="${this.escapeHtml(message.id)}" title="Editar">Editar</button>
                            <button type="button" class="action-btn btn-danger" data-action="delete" data-id="${this.escapeHtml(message.id)}" title="Excluir">Excluir</button>
                        </div>
                    </div>
                    <div class="message-content">${this.escapeHtml(message.message)}</div>
                    ${metaHtml}
                </div>
            `;
      })
      .join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

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

    if (type === 'success') notification.style.background = '#28a745';
    else if (type === 'error') notification.style.background = '#dc3545';
    else notification.style.background = '#17a2b8';

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  exportToTxt() {
    if (!this.messages.length) {
      this.showNotification('Nada para exportar.', 'error');
      return;
    }
    let txt = '';
    this.messages.forEach((msg, idx) => {
      const upd = formatTimestamp(msg.updatedAt || msg.createdAt);
      txt += `Título: ${msg.title}\nMensagem: ${msg.message}\n`;
      if (upd) txt += `Atualizado: ${upd}\n`;
      if (idx < this.messages.length - 1) txt += '\n';
    });
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mensagens-rapidas.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 100);
    this.showNotification('Exportação iniciada.', 'success');
  }

  copyMessageById(id) {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) this.copyMessage(msg.message);
  }
}

const notificationKeyframes = document.createElement('style');
notificationKeyframes.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationKeyframes);

new MensagensRapidas();

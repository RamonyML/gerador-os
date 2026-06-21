# Planejamento — Chat Interno

> Criado em: 2026-06-21
> Status: Planejamento (não iniciado)

---

## Visão Geral

Chat interno expansível no canto inferior direito da tela, estilo Facebook Messenger antigo. Permite comunicação em tempo real entre os usuários do sistema, integrado ao perfil e autenticação já existentes.

---

## Funcionalidades Planejadas

### Fase 1 — MVP (Chat básico)
- [ ] Widget flutuante no canto inferior direito com botão de abrir/fechar
- [ ] Lista de usuários do sistema (online e offline)
- [ ] Abrir conversa 1-a-1 clicando em um usuário
- [ ] Envio e recebimento de mensagens em tempo real (Firestore)
- [ ] Indicador de presença online (ponto verde)
- [ ] Notificação de mensagem não lida (badge com número no botão do chat)

### Fase 2 — Melhorias
- [ ] Indicador de "digitando..."
- [ ] Marcar mensagens como lidas
- [ ] Histórico de conversas (últimas 50 mensagens por conversa)
- [ ] Suporte a emoji (picker simples)
- [ ] Notificação do navegador (Browser Notification API) quando minimizado

### Fase 3 — Extras (futuro)
- [ ] Menções com `@nome`
- [ ] Reações em mensagens
- [ ] Grupos/canais por setor
- [ ] Envio de imagens

---

## Arquitetura — Firestore

### Coleções

```
/chats/{chatId}
  participants: [uid1, uid2]        // array com os 2 participantes
  lastMessage: string               // preview da última mensagem
  lastMessageAt: Timestamp
  unreadCount: { [uid]: number }    // contagem por usuário

/chats/{chatId}/messages/{msgId}
  senderId: string                  // uid do remetente
  senderName: string
  text: string
  createdAt: Timestamp
  readBy: string[]                  // uids que já leram

/presence/{uid}
  online: boolean
  lastSeen: Timestamp
  displayName: string
  photoURL: string | null
```

### Geração do chatId

Para conversas 1-a-1, o `chatId` é gerado ordenando os dois UIDs e concatenando:
```ts
const chatId = [uid1, uid2].sort().join('_')
```
Isso garante que dois usuários sempre acessem o mesmo documento, independente de quem iniciou.

### Presença Online (Firestore + onDisconnect)

```ts
// Ao logar: marca como online
await setDoc(doc(db, 'presence', uid), { online: true, lastSeen: serverTimestamp() })

// Ao desconectar: Firestore não tem onDisconnect nativo como o RTDB.
// Alternativa: usar Realtime Database APENAS para presença + Firestore para mensagens.
//   /status/{uid} no RTDB → { state: 'online'|'offline', last_changed: timestamp }
// Ao detectar mudança no RTDB, uma Cloud Function espelha para /presence/{uid} no Firestore.
```

> **Nota:** O Realtime Database já está disponível no mesmo projeto Firebase — não há custo adicional de infraestrutura.

---

## Arquitetura — Componentes React

```
AppLayout.tsx
  └── ChatProvider (Context)          ← estado global do chat: conversas abertas, não lidos
        └── ChatWidget                ← botão flutuante + painel expansível
              ├── ChatUserList        ← lista de usuários com status online
              └── ChatConversation    ← janela de conversa aberta
                    ├── ChatHeader    ← nome + status do outro usuário
                    ├── ChatMessages  ← lista de mensagens com scroll automático
                    └── ChatInput     ← campo de texto + botão enviar
```

### Posicionamento

```tsx
// Fixo no canto inferior direito, acima do conteúdo principal
position: 'fixed'
bottom: 24
right: 24
zIndex: theme.zIndex.fab  // 1050
```

O widget tem dois estados:
- **Fechado:** botão circular com ícone de chat + badge de não lidos
- **Aberto:** painel de ~340×480px com animação `Slide` de baixo para cima (MUI)

---

## Arquitetura — Cloud Functions

### `onPresenceWrite` (Realtime Database trigger)
Espelha o status de presença do RTDB para o Firestore:
```
RTDB: /status/{uid} → Firestore: /presence/{uid}
```

### `onMessageCreate` (Firestore trigger) — Fase 2
Incrementa `unreadCount` para o destinatário quando uma nova mensagem é criada.

---

## Regras de Segurança — Firestore

```
// /chats/{chatId}
allow read, write: if request.auth.uid in resource.data.participants;

// /chats/{chatId}/messages/{msgId}
allow read: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
allow create: if request.auth.uid == request.resource.data.senderId;

// /presence/{uid}
allow read: if request.auth != null;
allow write: if request.auth.uid == uid;
```

---

## Integração com o Sistema Existente

- **Autenticação:** usa `useAuth()` já existente — sem nenhuma mudança
- **Perfis:** lê `displayName`, `photoURL`, `sector` de `users/{uid}` já existente
- **Tema:** usa `useColorMode()` já existente — dark/light automático
- **AppLayout:** o `ChatWidget` é adicionado como filho direto do `AppLayout`, fora do `<main>`

---

## Ordem de Implementação

| # | Tarefa | Depende de |
|---|--------|-----------|
| 1 | Regras Firestore para `/chats` e `/presence` | — |
| 2 | Configurar presença via RTDB + Cloud Function espelho | — |
| 3 | `ChatProvider` + Context com estado de conversas abertas | — |
| 4 | `ChatWidget` (botão flutuante + animação de abertura) | 3 |
| 5 | `ChatUserList` com lista de usuários e status online | 2, 3 |
| 6 | `lib/chatFirestore.ts` — funções de leitura/escrita | 1 |
| 7 | `ChatMessages` + `ChatInput` + envio em tempo real | 5, 6 |
| 8 | Badge de não lidos no botão | 6, 7 |
| 9 | Notificação do navegador | 8 |

---

## Estimativa de Esforço

| Fase | Complexidade | Observação |
|------|-------------|------------|
| Fase 1 — MVP | Média | ~1–2 dias de desenvolvimento |
| Fase 2 — Melhorias | Baixa | Incrementos simples sobre o MVP |
| Fase 3 — Extras | Alta | Grupos e menções exigem modelagem mais complexa |

---

## Referências

- [Firebase Realtime Database — Presença online](https://firebase.google.com/docs/firestore/solutions/presence)
- [MUI Slide + Collapse para animação do widget](https://mui.com/material-ui/transitions/)
- [Firestore onSnapshot para mensagens em tempo real](https://firebase.google.com/docs/firestore/query-data/listen)

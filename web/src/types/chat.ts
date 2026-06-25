export type UserStatus = 'online' | 'ausente' | 'ocupado' | 'em_pausa' | 'offline'

export type UserPresence = {
  uid: string
  displayName: string
  photoURL: string | null
  status: UserStatus
  sector: string
  updatedAt: Date
}

export type ChatMessage = {
  id: string
  senderId: string
  senderName: string
  text: string
  createdAt: Date
}

export type Chat = {
  id: string
  participants: string[]
  lastMessage: string
  lastMessageAt: Date | null
  unreadCount: Record<string, number>
}

export const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  online:   { label: 'Online',   color: '#4caf50' },
  ausente:  { label: 'Ausente',  color: '#ff9800' },
  ocupado:  { label: 'Ocupado',  color: '#f44336' },
  em_pausa: { label: 'Em pausa', color: '#9c27b0' },
  offline:  { label: 'Offline',  color: '#9e9e9e' },
}

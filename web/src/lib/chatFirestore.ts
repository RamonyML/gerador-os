import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Chat, ChatMessage, ReplyRef } from '../types/chat'

export function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_')
}

export async function sendMessage(
  chatId: string,
  myUid: string,
  otherUid: string,
  senderName: string,
  text: string,
  replyTo?: ReplyRef,
): Promise<void> {
  const chatRef = doc(db, 'chats', chatId)
  await setDoc(
    chatRef,
    {
      participants: [myUid, otherUid].sort(),
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    },
    { merge: true },
  )
  await updateDoc(chatRef, {
    [`unreadCount.${otherUid}`]: increment(1),
  })
  const msgData: Record<string, unknown> = {
    senderId: myUid,
    senderName,
    text,
    createdAt: serverTimestamp(),
  }
  if (replyTo) msgData.replyTo = replyTo
  await addDoc(collection(db, 'chats', chatId, 'messages'), msgData)
}

export async function markAsRead(chatId: string, myUid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'chats', chatId), { [`unreadCount.${myUid}`]: 0 })
  } catch {
    // doc pode não existir ainda
  }
}

export function subscribeMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100),
  )
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const replyRaw = data.replyTo as Record<string, unknown> | undefined
        return {
          id: d.id,
          senderId: data.senderId ?? '',
          senderName: data.senderName ?? '',
          text: data.text ?? '',
          replyTo: replyRaw
            ? { id: String(replyRaw.id ?? ''), senderName: String(replyRaw.senderName ?? ''), text: String(replyRaw.text ?? '') }
            : undefined,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        }
      }),
    )
  })
}

// ---- Indicador de digitação ----
// Escreve/apaga chats/{chatId}/typing/{uid} com timestamp.
// subscribeTyping considera stale se o doc tiver mais de 5s (fallback p/ perda de cleanup).

// Date.now() em vez de serverTimestamp(): evita o snapshot local com at=null
// que faria age = Date.now() - 0 >> 5000 → callback(false) imediato.
export async function setTyping(chatId: string, uid: string): Promise<void> {
  await setDoc(doc(db, 'chats', chatId, 'typing', uid), { at: Date.now() }, { merge: true })
}

export async function clearTyping(chatId: string, uid: string): Promise<void> {
  try { await deleteDoc(doc(db, 'chats', chatId, 'typing', uid)) } catch { /* doc pode não existir */ }
}

export function subscribeTyping(
  chatId: string,
  otherUid: string,
  callback: (isTyping: boolean) => void,
): () => void {
  return onSnapshot(doc(db, 'chats', chatId, 'typing', otherUid), (snap) => {
    if (!snap.exists()) { callback(false); return }
    const age = Date.now() - (snap.data().at as number ?? 0)
    callback(age < 5000)
  })
}

export function subscribeMyChats(
  myUid: string,
  callback: (chats: Chat[]) => void,
): () => void {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', myUid),
  )
  return onSnapshot(q, (snap) => {
    const chats: Chat[] = snap.docs
      .map((d) => {
        const data = d.data()
        return {
          id: d.id,
          participants: data.participants ?? [],
          lastMessage: data.lastMessage ?? '',
          lastMessageAt: data.lastMessageAt?.toDate() ?? null,
          unreadCount: data.unreadCount ?? {},
        }
      })
      .sort((a, b) => {
        if (!a.lastMessageAt) return 1
        if (!b.lastMessageAt) return -1
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
      })
    callback(chats)
  })
}

import {
  addDoc,
  collection,
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
import type { Chat, ChatMessage } from '../types/chat'

export function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_')
}

export async function sendMessage(
  chatId: string,
  myUid: string,
  otherUid: string,
  senderName: string,
  text: string,
): Promise<void> {
  const chatRef = doc(db, 'chats', chatId)
  // setDoc cria o documento se não existir (sem dot-notation)
  await setDoc(
    chatRef,
    {
      participants: [myUid, otherUid].sort(),
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    },
    { merge: true },
  )
  // updateDoc interpreta dot-notation como caminho aninhado — necessário para increment
  await updateDoc(chatRef, {
    [`unreadCount.${otherUid}`]: increment(1),
  })
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: myUid,
    senderName,
    text,
    createdAt: serverTimestamp(),
  })
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
        return {
          id: d.id,
          senderId: data.senderId ?? '',
          senderName: data.senderName ?? '',
          text: data.text ?? '',
          createdAt: data.createdAt?.toDate() ?? new Date(),
        }
      }),
    )
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

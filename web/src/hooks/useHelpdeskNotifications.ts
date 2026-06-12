import { useCallback, useEffect, useMemo, useState } from 'react'
import { db } from '../lib/firebase'
import { canManageHelpdesk } from '../lib/helpdeskAccess'
import {
  subscribeAllTickets,
  subscribeMyTickets,
} from '../lib/ticketsFirestore'
import type { Ticket } from '../types/ticket'
import type { UserProfile } from '../types/profile'

export type HelpdeskNotification = {
  /** Chave única (canal + chamado). */
  id: string
  ticketId: string
  title: string
  /** `novo` = chamado recém-aberto (visão T.I); `resposta` = T.I respondeu (visão autor). */
  kind: 'novo' | 'resposta'
  /** Quem gerou o evento (autor do chamado ou agente do T.I). */
  who: string
  at: Date
}

/** Lê o "visto até" do canal, inicializando com o momento atual na primeira vez. */
function initSeen(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (raw != null) {
      const n = Number(raw)
      return Number.isFinite(n) ? n : Date.now()
    }
    const now = Date.now()
    localStorage.setItem(key, String(now))
    return now
  } catch {
    return Date.now()
  }
}

/**
 * Notificações do helpdesk para o sininho, derivadas no cliente (sem Cloud
 * Functions): T.I recebe os chamados recém-abertos; o autor recebe quando o T.I
 * responde no seu chamado. O "visto" é por usuário (localStorage) e por canal.
 */
export function useHelpdeskNotifications(params: {
  uid: string | null
  profile: UserProfile | null
}) {
  const { uid, profile } = params
  const isAgent = canManageHelpdesk(profile)

  const [myTickets, setMyTickets] = useState<Ticket[]>([])
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [lastSeenTi, setLastSeenTi] = useState(0)
  const [lastSeenAuthor, setLastSeenAuthor] = useState(0)

  useEffect(() => {
    if (!uid) {
      setLastSeenTi(0)
      setLastSeenAuthor(0)
      return
    }
    setLastSeenTi(initSeen(`helpdesk:ti:${uid}`))
    setLastSeenAuthor(initSeen(`helpdesk:author:${uid}`))
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setMyTickets([])
      return
    }
    const unsub = subscribeMyTickets(
      db,
      uid,
      (list) => setMyTickets(list),
      () => setMyTickets([]),
    )
    return () => unsub()
  }, [uid])

  useEffect(() => {
    if (!uid || !isAgent) {
      setAllTickets([])
      return
    }
    const unsub = subscribeAllTickets(
      db,
      { status: null },
      (list) => setAllTickets(list),
      () => setAllTickets([]),
    )
    return () => unsub()
  }, [uid, isAgent])

  const items = useMemo<HelpdeskNotification[]>(() => {
    const out: HelpdeskNotification[] = []

    if (isAgent) {
      for (const t of allTickets) {
        if (t.authorUid === uid) continue
        if (t.status === 'resolvido') continue
        if (t.createdAt.getTime() > lastSeenTi) {
          out.push({
            id: `novo:${t.id}`,
            ticketId: t.id,
            title: t.title,
            kind: 'novo',
            who: t.authorName,
            at: t.createdAt,
          })
        }
      }
    }

    for (const t of myTickets) {
      if (
        t.lastReplyRole === 'ti' &&
        t.lastReplyAt &&
        t.lastReplyByUid !== uid &&
        t.lastReplyAt.getTime() > lastSeenAuthor
      ) {
        out.push({
          id: `resposta:${t.id}`,
          ticketId: t.id,
          title: t.title,
          kind: 'resposta',
          who: t.assigneeName ?? 'T.I',
          at: t.lastReplyAt,
        })
      }
    }

    out.sort((a, b) => b.at.getTime() - a.at.getTime())
    return out
  }, [isAgent, allTickets, myTickets, uid, lastSeenTi, lastSeenAuthor])

  const markSeenAll = useCallback(() => {
    if (!uid) return
    const now = Date.now()
    try {
      localStorage.setItem(`helpdesk:ti:${uid}`, String(now))
      localStorage.setItem(`helpdesk:author:${uid}`, String(now))
    } catch {
      // ignora indisponibilidade de localStorage
    }
    setLastSeenTi(now)
    setLastSeenAuthor(now)
  }, [uid])

  return { items, unreadCount: items.length, markSeenAll }
}

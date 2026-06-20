import { useCallback, useEffect, useRef, useState } from 'react'
import type { Notice } from '../types/notices'
import { getAnnouncedIds, markAsAnnounced } from '../lib/announcedNotices'

export type ToastNotice = {
  id: string
  title?: string
  message: string
  priority: 'important' | 'critical'
  authorName: string
}

function showBrowserNotification(toast: ToastNotice) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') return
  try {
    const n = new Notification(toast.title ?? `Aviso de ${toast.authorName}`, {
      body: toast.message.slice(0, 120),
      tag: toast.id,
    })
    n.onclick = () => { window.focus(); n.close() }
  } catch {
    // contexto sem suporte (ex.: iframe sandboxed)
  }
}

export function useNotificationToasts(notices: Notice[], ready: boolean) {
  const [queue, setQueue] = useState<ToastNotice[]>([])
  const seenIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!ready) return

    const announced = getAnnouncedIds()
    const newToasts: ToastNotice[] = []

    for (const notice of notices) {
      // Já processado nesta sessão
      if (seenIdsRef.current.has(notice.id)) continue
      seenIdsRef.current.add(notice.id)

      // Normal não gera toast — apenas badge no sino
      if (notice.priority === 'normal') continue

      // Já foi anunciado em uma sessão anterior
      if (announced.has(notice.id)) continue

      newToasts.push({
        id: notice.id,
        title: notice.title,
        message: notice.message,
        priority: notice.priority,
        authorName: notice.authorName,
      })
    }

    if (newToasts.length === 0) return

    markAsAnnounced(newToasts.map((t) => t.id))
    setQueue((prev) => [...prev, ...newToasts])

    for (const toast of newToasts) showBrowserNotification(toast)
  }, [notices, ready])

  const dismissCurrent = useCallback(() => {
    setQueue((prev) => prev.slice(1))
  }, [])

  return { queue, dismissCurrent }
}

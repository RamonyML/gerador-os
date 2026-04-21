import { useCallback, useEffect, useMemo, useState } from 'react'
import { db } from '../lib/firebase'
import type { Notice } from '../types/notices'
import type { UserProfile } from '../types/profile'
import {
  listReadNoticeIdsForUser,
  subscribeRelevantNotices,
  markNoticeAsRead,
} from '../lib/noticesFirestore'

type NoticesState =
  | { status: 'idle'; notices: Notice[]; unreadIds: Set<string> }
  | { status: 'loading'; notices: Notice[]; unreadIds: Set<string> }
  | { status: 'ready'; notices: Notice[]; unreadIds: Set<string> }
  | { status: 'error'; notices: Notice[]; unreadIds: Set<string>; message: string }

export function useNotices(params: { uid: string | null; profile: UserProfile | null }) {
  const { uid, profile } = params
  const [state, setState] = useState<NoticesState>({
    status: 'idle',
    notices: [],
    unreadIds: new Set<string>(),
  })
  const [pageSize, setPageSize] = useState(30)

  useEffect(() => {
    if (!uid || !profile) {
      setState({ status: 'idle', notices: [], unreadIds: new Set() })
      return
    }

    setState((prev) => ({ ...prev, status: 'loading' }))

    const unsubscribe = subscribeRelevantNotices(
      db,
      profile,
      { pageSize },
      async (notices) => {
        try {
          const readIds = await listReadNoticeIdsForUser(
            db,
            uid,
            notices.map((n) => n.id),
          )
          const unreadIds = new Set<string>(
            notices.filter((n) => !readIds.has(n.id)).map((n) => n.id),
          )
          setState({ status: 'ready', notices, unreadIds })
        } catch (e) {
          setState({
            status: 'error',
            notices: [],
            unreadIds: new Set(),
            message: e instanceof Error ? e.message : 'Falha ao carregar avisos.',
          })
        }
      },
      (err) => {
        setState({
          status: 'error',
          notices: [],
          unreadIds: new Set(),
          message: err instanceof Error ? err.message : 'Falha ao carregar avisos.',
        })
      },
    )

    return () => unsubscribe()
  }, [uid, profile?.sector, pageSize])

  const unreadCount = state.unreadIds.size

  const markAsRead = useCallback(
    async (noticeId: string) => {
      if (!uid) return
      await markNoticeAsRead(db, uid, noticeId)
      setState((prev) => {
        const nextUnread = new Set(prev.unreadIds)
        nextUnread.delete(noticeId)
        return { ...prev, unreadIds: nextUnread }
      })
    },
    [uid],
  )

  const unreadNotices = useMemo(
    () => state.notices.filter((n) => state.unreadIds.has(n.id)),
    [state.notices, state.unreadIds],
  )

  return {
    state,
    unreadCount,
    unreadNotices,
    markAsRead,
    pageSize,
    loadMore: () => setPageSize((s) => Math.min(120, s + 30)),
  }
}


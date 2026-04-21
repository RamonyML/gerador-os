import type { Sector } from './profile'

export type NoticeTarget =
  | { scope: 'all' }
  | { scope: 'sector'; sector: Sector }

export type NoticeStatus = 'draft' | 'published'
export type NoticePriority = 'normal' | 'important' | 'critical'

export type Notice = {
  id: string
  message: string
  authorUid: string
  authorName: string
  createdAt: Date
  target: NoticeTarget
  active: boolean
  status: NoticeStatus
  pinned: boolean
  priority: NoticePriority
  startsAt: Date | null
  endsAt: Date | null
  stats?: {
    readCount?: number
  }
}

export type NoticeDraft = {
  message: string
  target: NoticeTarget
  status: NoticeStatus
  pinned: boolean
  priority: NoticePriority
  startsAt: Date | null
  endsAt: Date | null
}


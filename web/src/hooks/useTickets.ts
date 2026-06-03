import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import {
  subscribeAllTickets,
  subscribeMyTickets,
} from '../lib/ticketsFirestore'
import type { Ticket, TicketStatus } from '../types/ticket'

type TicketsState =
  | { status: 'loading'; tickets: Ticket[] }
  | { status: 'ready'; tickets: Ticket[] }
  | { status: 'error'; tickets: Ticket[]; message: string }

type Params =
  | { scope: 'mine'; uid: string | null }
  | { scope: 'all'; statusFilter: TicketStatus | null }

/**
 * Assina a coleção de chamados.
 * - `mine`: chamados do solicitante autenticado.
 * - `all`: todos os chamados (gestão T.I), com filtro de status opcional.
 */
export function useTickets(params: Params) {
  const [state, setState] = useState<TicketsState>({
    status: 'loading',
    tickets: [],
  })

  const scope = params.scope
  const uid = params.scope === 'mine' ? params.uid : null
  const statusFilter = params.scope === 'all' ? params.statusFilter : null

  useEffect(() => {
    setState((prev) => ({ ...prev, status: 'loading' }))

    const onNext = (tickets: Ticket[]) =>
      setState({ status: 'ready', tickets })
    const onError = (err: unknown) =>
      setState({
        status: 'error',
        tickets: [],
        message: err instanceof Error ? err.message : 'Falha ao carregar chamados.',
      })

    if (scope === 'mine') {
      if (!uid) {
        setState({ status: 'ready', tickets: [] })
        return
      }
      return subscribeMyTickets(db, uid, onNext, onError)
    }

    return subscribeAllTickets(db, { status: statusFilter }, onNext, onError)
  }, [scope, uid, statusFilter])

  return state
}

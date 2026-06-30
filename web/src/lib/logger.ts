import * as Sentry from '@sentry/react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const isDev = import.meta.env.DEV
const env = import.meta.env.MODE as string

function saveLog(level: 'warn' | 'error', message: string, context?: Record<string, unknown>) {
  addDoc(collection(db, 'appLogs'), {
    timestamp: serverTimestamp(),
    level,
    message,
    context: context ?? null,
    env,
  }).catch(() => undefined)
}

export const logger = {
  debug(...args: unknown[]) {
    if (isDev) console.debug('[debug]', ...args)
  },

  info(...args: unknown[]) {
    if (isDev) console.info('[info]', ...args)
  },

  warn(...args: unknown[]) {
    if (isDev) console.warn('[warn]', ...args)
    else Sentry.captureMessage(String(args[0]), 'warning')
    saveLog('warn', String(args[0]))
  },

  error(err: unknown, context?: Record<string, unknown>) {
    const message = err instanceof Error ? err.message : String(err)
    if (isDev) console.error('[error]', err, context)
    else if (err instanceof Error) {
      Sentry.captureException(err, context ? { extra: context } : undefined)
    } else {
      Sentry.captureMessage(message, { level: 'error', extra: context })
    }
    saveLog('error', message, context)
  },
}

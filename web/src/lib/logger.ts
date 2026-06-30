import * as Sentry from '@sentry/react'

const isDev = import.meta.env.DEV

export const logger = {
  debug(...args: unknown[]) {
    if (isDev) console.debug('[debug]', ...args)
  },

  info(...args: unknown[]) {
    if (isDev) console.info('[info]', ...args)
  },

  warn(...args: unknown[]) {
    if (isDev) console.warn('[warn]', ...args)
    if (!isDev) Sentry.captureMessage(String(args[0]), 'warning')
  },

  error(err: unknown, context?: Record<string, unknown>) {
    if (isDev) console.error('[error]', err, context)
    if (err instanceof Error) {
      Sentry.captureException(err, context ? { extra: context } : undefined)
    } else {
      Sentry.captureMessage(String(err), { level: 'error', extra: context })
    }
  },
}

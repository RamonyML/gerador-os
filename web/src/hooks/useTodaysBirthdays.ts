import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { subscribeUsersDirectory, type PublicProfile } from '../lib/usersPublic'

function todayMMDD(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${mm}-${dd}`
}

/** Retorna os usuários cujo aniversário é hoje (MM-DD == data atual). */
export function useTodaysBirthdays(): PublicProfile[] {
  const [birthdays, setBirthdays] = useState<PublicProfile[]>([])

  useEffect(() => {
    const today = todayMMDD()
    const unsub = subscribeUsersDirectory(db, (users) => {
      setBirthdays(users.filter((u) => u.birthday === today))
    })
    return unsub
  }, [])

  return birthdays
}

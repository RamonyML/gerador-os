import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { subscribeUsersPublic, type PublicProfile } from '../lib/usersPublic'

export function useUsersPublic(): Record<string, PublicProfile> {
  const [map, setMap] = useState<Record<string, PublicProfile>>({})
  useEffect(() => subscribeUsersPublic(db, setMap), [])
  return map
}

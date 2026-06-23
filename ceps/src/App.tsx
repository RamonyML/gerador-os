import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { LoginPage } from './pages/LoginPage'
import { MapaPage } from './pages/MapaPage'
import { RegistrosPage } from './pages/RegistrosPage'
import { CondominiosPage } from './pages/CondominiosPage'
import { EscalaPage } from './pages/EscalaPage'

const isFullMode = new URLSearchParams(window.location.search).get('full') === '1'
const TAB_KEY = 'mztools_tab'
type Tab = 'registros' | 'mapa' | 'condominios' | 'escala'

function openPerfil() {
  chrome.tabs.create({ url: 'https://gerador-de-os-3ba02.firebaseapp.com' })
}

function initials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
    : parts[0]!.slice(0, 2).toUpperCase()
}

function UserAvatar({ user }: { user: User }) {
  const [imgError, setImgError] = useState(false)
  if (user.photoURL && !imgError) {
    return (
      <img
        className="user-avatar"
        src={user.photoURL}
        alt={user.displayName ?? ''}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className="user-avatar user-avatar-initials">
      {initials(user.displayName)}
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'registros',
    label: 'Registros',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    ),
  },
  {
    id: 'mapa',
    label: 'Mapa',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    id: 'condominios',
    label: 'Condomínios',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
      </svg>
    ),
  },
  {
    id: 'escala',
    label: 'Escala',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
      </svg>
    ),
  },
]

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem(TAB_KEY) as Tab | null
    return saved && ['registros', 'mapa', 'condominios', 'escala'].includes(saved) ? saved : 'registros'
  })

  useEffect(() => {
    if (isFullMode) document.body.classList.add('full-mode')
  }, [])

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const handleTab = (tab: Tab) => {
    setActiveTab(tab)
    localStorage.setItem(TAB_KEY, tab)
  }

  if (user === undefined) {
    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="app-shell">
      <div className="user-strip">
        <UserAvatar user={user} />
        <div className="user-strip-info">
          <span className="user-strip-name">{user.displayName ?? 'Usuário'}</span>
          <span className="user-strip-email">{user.email}</span>
        </div>
        <div className="user-strip-actions">
          <button className="btn-perfil" onClick={openPerfil}>Meu Perfil</button>
          <button className="btn-strip-logout" onClick={() => void signOut(auth)}>Sair</button>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => handleTab(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'registros' && <RegistrosPage uid={user.uid} />}
        {activeTab === 'mapa' && <MapaPage isFullMode={isFullMode} />}
        {activeTab === 'condominios' && <CondominiosPage />}
        {activeTab === 'escala' && <EscalaPage user={user} />}
      </div>
    </div>
  )
}

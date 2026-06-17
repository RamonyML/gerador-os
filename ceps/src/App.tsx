import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { LoginPage } from './pages/LoginPage'
import { MapaPage } from './pages/MapaPage'
import { RegistrosPage } from './pages/RegistrosPage'

const isFullMode = new URLSearchParams(window.location.search).get('full') === '1'

function openPerfil() {
  chrome.tabs.create({ url: 'https://gerador-de-os-3ba02.firebaseapp.com' })
}

type Tab = 'mapa' | 'registros'

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<Tab>('mapa')

  useEffect(() => {
    if (isFullMode) document.body.classList.add('full-mode')
  }, [])

  useEffect(() => onAuthStateChanged(auth, setUser), [])

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
      {/* Faixa de usuário */}
      <div className="user-strip">
        <div className="user-strip-info">
          <span className="user-strip-name">{user.displayName ?? 'Usuário'}</span>
          <span className="user-strip-email">{user.email}</span>
        </div>
        <div className="user-strip-actions">
          <button className="btn-perfil" onClick={openPerfil}>Meu Perfil</button>
          <button className="btn-strip-logout" onClick={() => void signOut(auth)}>Sair</button>
        </div>
      </div>

      {/* Abas */}
      <div className="tab-bar">
        <button
          className={`tab-btn${activeTab === 'mapa' ? ' active' : ''}`}
          onClick={() => setActiveTab('mapa')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Mapa
        </button>
        <button
          className={`tab-btn${activeTab === 'registros' ? ' active' : ''}`}
          onClick={() => setActiveTab('registros')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          Registros
        </button>
      </div>

      {/* Conteúdo da aba */}
      <div className="tab-content">
        {activeTab === 'mapa'
          ? <MapaPage isFullMode={isFullMode} />
          : <RegistrosPage uid={user.uid} />
        }
      </div>
    </div>
  )
}

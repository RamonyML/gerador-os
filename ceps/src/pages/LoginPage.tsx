import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !senha) return
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha)
    } catch {
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.png" alt="MZ NET" className="login-brand-logo" />

        <h1 className="login-title">MZ Tools</h1>
        <p className="login-sub">
          Ferramentas internas MZ NET
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="field-group" style={{ marginBottom: 10 }}>
            <label>E-mail</label>
            <input
              type="text"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="field-group" style={{ marginBottom: 18 }}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            disabled={loading || !email.trim() || !senha}
          >
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Entrando…</>
              : 'Entrar'
            }
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}

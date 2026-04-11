import { app } from './lib/firebase'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <h1>Gerador de O.S — MZ NET</h1>
      <p>
        App conectado ao Firebase (<code>{app.options.projectId}</code>).
      </p>
      <p className="muted">
        Próximo passo: login, perfil em Firestore e gerador de texto.
      </p>
    </main>
  )
}

export default App

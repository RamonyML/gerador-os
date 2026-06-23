import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { subscribeCondominios } from '../lib/condominiosFirestore'
import { type Condominio, type CondominioCategoria } from '../types/condominio'

export function CondominiosPage() {
  const [items, setItems] = useState<Condominio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Record<CondominioCategoria, boolean>>({ viavel: true, inviavel: true })
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    return subscribeCondominios(db, (list) => {
      setItems(list)
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const filtered = items.filter((c) => {
    if (!filter[c.categoria]) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.nome.toLowerCase().includes(q) ||
      c.bairro.toLowerCase().includes(q) ||
      c.rua.toLowerCase().includes(q)
    )
  })

  const handleCopy = (c: Condominio) => {
    const parts = [
      c.nome,
      c.rua && c.numero ? `${c.rua}, ${c.numero}` : c.rua,
      c.bairro,
      c.cep,
    ].filter(Boolean)
    void navigator.clipboard.writeText(parts.join(' — '))
    setCopied(c.id)
    setTimeout(() => setCopied(null), 1800)
  }

  const toggleFilter = (cat: CondominioCategoria) =>
    setFilter((prev) => ({ ...prev, [cat]: !prev[cat] }))

  const counts = {
    viavel: items.filter((c) => c.categoria === 'viavel').length,
    inviavel: items.filter((c) => c.categoria === 'inviavel').length,
  }

  return (
    <div className="condo-root">
      <div className="condo-toolbar">
        <input
          className="reg-search"
          type="text"
          placeholder="Buscar condomínio, bairro, rua…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="condo-filters">
          {(['viavel', 'inviavel'] as CondominioCategoria[]).map((cat) => (
            <button
              key={cat}
              className={`filter-toggle ${cat}${filter[cat] ? ' active' : ''}`}
              onClick={() => toggleFilter(cat)}
            >
              <div className={`filter-dot ${cat}`} />
              {cat === 'viavel' ? 'Viável' : 'Inviável'} ({counts[cat]})
            </button>
          ))}
        </div>
      </div>

      <div className="condo-list">
        {loading && (
          <div className="reg-empty">
            <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="reg-empty">
            <p>{search ? 'Nenhum resultado.' : 'Nenhum condomínio cadastrado.'}</p>
          </div>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="condo-item">
            <span className={`condo-badge ${c.categoria}`}>
              {c.categoria === 'viavel' ? 'Viável' : 'Inviável'}
            </span>
            <div className="condo-body">
              <div className="condo-nome">{c.nome}</div>
              {(c.bairro || c.rua) && (
                <div className="condo-addr">
                  {[c.bairro, c.rua && c.numero ? `${c.rua}, ${c.numero}` : c.rua]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
              {c.obs && <div className="condo-obs">{c.obs}</div>}
            </div>
            <button
              className={`reg-action-btn${copied === c.id ? ' copied' : ''}`}
              onClick={() => handleCopy(c)}
              title="Copiar endereço"
            >
              {copied === c.id
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

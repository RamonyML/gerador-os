import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'

interface Registro {
  id: string
  title: string
  message: string
}

function fromDoc(id: string, data: DocumentData): Registro {
  return { id, title: data.title ?? '', message: data.message ?? '' }
}

export function RegistrosPage({ uid }: { uid: string }) {
  const [items, setItems] = useState<Registro[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: Registro } | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  useEffect(() => {
    const q = query(
      collection(db, 'mensagensRapidas', uid, 'itens'),
      orderBy('updatedAt', 'desc'),
    )
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => fromDoc(d.id, d.data())))
      setLoading(false)
    }, () => setLoading(false))
  }, [uid])

  const filtered = search.trim()
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.message.toLowerCase().includes(search.toLowerCase()),
      )
    : items

  const openAdd = () => { setTitle(''); setMessage(''); setModal({ mode: 'add' }) }
  const openEdit = (item: Registro) => { setTitle(item.title); setMessage(item.message); setModal({ mode: 'edit', item }) }
  const closeModal = () => { setModal(null); setTitle(''); setMessage('') }

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) return
    setSaving(true)
    try {
      if (modal?.mode === 'add') {
        await addDoc(collection(db, 'mensagensRapidas', uid, 'itens'), {
          title: title.trim(),
          message: message.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else if (modal?.mode === 'edit' && modal.item) {
        await updateDoc(doc(db, 'mensagensRapidas', uid, 'itens', modal.item.id), {
          title: title.trim(),
          message: message.trim(),
          updatedAt: serverTimestamp(),
        })
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'mensagensRapidas', uid, 'itens', id))
    setConfirmDelete(null)
  }

  const handleCopy = (item: Registro) => {
    void navigator.clipboard.writeText(item.message)
    setCopied(item.id)
    setTimeout(() => setCopied(null), 1800)
  }

  const handleExport = () => {
    const content = items.map((i) => `[${i.title}]\n${i.message}`).join('\n\n---\n\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'mensagens-rapidas.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reg-root">
      {/* Toolbar */}
      <div className="reg-toolbar">
        <input
          className="reg-search"
          type="text"
          placeholder="Buscar mensagens…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary reg-add-btn" onClick={openAdd} title="Nova mensagem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        {items.length > 0 && (
          <button className="btn-clear reg-export-btn" onClick={handleExport} title="Exportar TXT">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="reg-list">
        {loading && (
          <div className="reg-empty">
            <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="reg-empty">
            <p>{search ? 'Nenhuma mensagem encontrada.' : 'Nenhuma mensagem salva ainda.'}</p>
            {!search && (
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>
                Criar primeira mensagem
              </button>
            )}
          </div>
        )}
        {filtered.map((item) => {
          const isExpanded = expanded.has(item.id)
          return (
          <div key={item.id} className="reg-item">
            <div className="reg-item-body">
              <div className="reg-item-title">{item.title}</div>
              <div className={`reg-item-msg${isExpanded ? ' expanded' : ''}`}>{item.message}</div>
            </div>
            <div className="reg-item-actions">
              <button
                className={`reg-action-btn expand${isExpanded ? ' active' : ''}`}
                onClick={() => toggleExpand(item.id)}
                title={isExpanded ? 'Recolher' : 'Ver mensagem completa'}
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
              <button
                className={`reg-action-btn${copied === item.id ? ' copied' : ''}`}
                onClick={() => handleCopy(item)}
                title="Copiar mensagem"
              >
                {copied === item.id
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                }
              </button>
              <button className="reg-action-btn" onClick={() => openEdit(item)} title="Editar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button
                className="reg-action-btn danger"
                onClick={() => setConfirmDelete(item.id)}
                title="Excluir"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        )})}
      </div>

      {/* Modal Add/Edit */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Nova mensagem' : 'Editar mensagem'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="field-group" style={{ marginBottom: 10 }}>
              <label>Título</label>
              <input
                type="text"
                placeholder="Nome da mensagem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label>Mensagem</label>
              <textarea
                className="reg-textarea"
                placeholder="Texto completo da mensagem…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-clear" onClick={closeModal}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={() => void handleSave()}
                disabled={saving || !title.trim() || !message.trim()}
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Excluir mensagem</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ marginBottom: 20, color: 'var(--text-2)', fontSize: 14, lineHeight: 1.5 }}>
              Tem certeza? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-actions">
              <button className="btn-clear" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => void handleDelete(confirmDelete)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

interface Notebook { id: string; title: string; color: string }
interface NoteSection { id: string; title: string }
interface NotePage { id: string; title: string; content: string; pinned: boolean; tags: string[] }

type Level = 'notebooks' | 'sections' | 'pages' | 'content'

// ── TipTap JSON → React nodes ─────────────────────────────
interface TipNode {
  type: string
  text?: string
  content?: TipNode[]
  marks?: { type: string }[]
  attrs?: Record<string, unknown>
}

function renderTipNode(node: TipNode, key: number): React.ReactNode {
  if (node.type === 'text') {
    let el: React.ReactNode = node.text ?? ''
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold')      el = <strong key={key}>{el}</strong>
      if (mark.type === 'italic')    el = <em key={key}>{el}</em>
      if (mark.type === 'underline') el = <u key={key}>{el}</u>
      if (mark.type === 'strike')    el = <s key={key}>{el}</s>
      if (mark.type === 'code')      el = <code key={key}>{el}</code>
    }
    return el
  }
  if (node.type === 'hardBreak') return <br key={key} />

  const children = node.content?.map((n, i) => renderTipNode(n, i)) ?? []

  if (node.type === 'paragraph')  return <p key={key}>{children}</p>
  if (node.type === 'heading') {
    const lvl = (node.attrs?.level as number) ?? 2
    const Tag = `h${lvl}` as 'h1' | 'h2' | 'h3'
    return <Tag key={key}>{children}</Tag>
  }
  if (node.type === 'bulletList')  return <ul key={key}>{children}</ul>
  if (node.type === 'orderedList') return <ol key={key}>{children}</ol>
  if (node.type === 'listItem')    return <li key={key}>{children}</li>
  if (node.type === 'blockquote')  return <blockquote key={key}>{children}</blockquote>
  if (node.type === 'codeBlock')   return <pre key={key}><code>{children}</code></pre>
  return <React.Fragment key={key}>{children}</React.Fragment>
}

function renderContent(raw: string): React.ReactNode {
  if (!raw.trimStart().startsWith('{')) {
    return <pre className="notes-content-text">{raw}</pre>
  }
  try {
    const doc = JSON.parse(raw) as TipNode
    const nodes = doc.content?.map((n, i) => renderTipNode(n, i)) ?? []
    return <div className="notes-rich-content">{nodes}</div>
  } catch {
    return <pre className="notes-content-text">{raw}</pre>
  }
}
// ─────────────────────────────────────────────────────────

function parseTs(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

interface Props { uid: string; onClose: () => void }

export function NotesViewer({ uid, onClose }: Props) {
  const [level, setLevel] = useState<Level>('notebooks')
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [sections, setSections] = useState<NoteSection[]>([])
  const [pages, setPages] = useState<NotePage[]>([])
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [section, setSection] = useState<NoteSection | null>(null)
  const [page, setPage] = useState<NotePage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'users', uid, 'notebooks'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, (snap) => {
      setNotebooks(snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          title: typeof data.title === 'string' ? data.title : 'Sem título',
          color: typeof data.color === 'string' ? data.color : '#1976d2',
        }
      }))
      setLoading(false)
    }, () => setLoading(false))
  }, [uid])

  useEffect(() => {
    if (!notebook) return
    setLoading(true)
    const q = query(
      collection(db, 'users', uid, 'notebooks', notebook.id, 'sections'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      setSections(snap.docs.map((d) => ({
        id: d.id,
        title: typeof d.data().title === 'string' ? d.data().title : 'Sem título',
      })))
      setLoading(false)
    }, () => setLoading(false))
  }, [uid, notebook])

  useEffect(() => {
    if (!notebook || !section) return
    setLoading(true)
    const q = query(
      collection(db, 'users', uid, 'notebooks', notebook.id, 'sections', section.id, 'pages'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      const result: NotePage[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          title: typeof data.title === 'string' ? data.title : 'Sem título',
          content: typeof data.content === 'string' ? data.content : '',
          pinned: data.pinned === true,
          tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
          _createdAt: parseTs(data.createdAt),
        } as NotePage & { _createdAt: Date }
      })
      result.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return (a as unknown as { _createdAt: Date })._createdAt.getTime() -
               (b as unknown as { _createdAt: Date })._createdAt.getTime()
      })
      setPages(result)
      setLoading(false)
    }, () => setLoading(false))
  }, [uid, notebook, section])

  const goBack = () => {
    if (level === 'notebooks') { onClose(); return }
    if (level === 'sections') { setLevel('notebooks'); setNotebook(null) }
    else if (level === 'pages') { setLevel('sections'); setSection(null) }
    else if (level === 'content') { setLevel('pages'); setPage(null) }
  }

  const pickNotebook = (nb: Notebook) => {
    setNotebook(nb); setSections([]); setLoading(true); setLevel('sections')
  }
  const pickSection = (sec: NoteSection) => {
    setSection(sec); setPages([]); setLoading(true); setLevel('pages')
  }
  const pickPage = (pg: NotePage) => {
    setPage(pg); setLevel('content')
  }

  const backLabel =
    level === 'notebooks' ? '← Registros'
    : level === 'sections' ? '← Cadernos'
    : level === 'pages' ? `← ${notebook?.title ?? 'Caderno'}`
    : `← ${section?.title ?? 'Seção'}`

  return (
    <div className="notes-root">
      <div className="notes-header">
        <button className="notes-back-btn" onClick={goBack}>{backLabel}</button>
        {level !== 'notebooks' && (
          <div className="notes-header-right">
            {level === 'sections' && notebook && (
              <span className="notes-nb-dot" style={{ background: notebook.color }} />
            )}
            <span className="notes-header-title">
              {level === 'sections' ? notebook?.title
               : level === 'pages' ? section?.title
               : page?.title}
            </span>
          </div>
        )}
        {level === 'notebooks' && (
          <span className="notes-header-title notes-header-main">Notas do Gerador</span>
        )}
      </div>

      {loading ? (
        <div className="notes-loading">
          <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
        </div>
      ) : level === 'notebooks' ? (
        <div className="notes-list">
          {notebooks.length === 0 ? (
            <div className="notes-empty"><p>Nenhum caderno encontrado.</p></div>
          ) : notebooks.map((nb) => (
            <button key={nb.id} className="notes-item" onClick={() => pickNotebook(nb)}>
              <span className="notes-nb-dot" style={{ background: nb.color }} />
              <span className="notes-item-title">{nb.title}</span>
              <svg className="notes-arrow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          ))}
        </div>
      ) : level === 'sections' ? (
        <div className="notes-list">
          {sections.length === 0 ? (
            <div className="notes-empty"><p>Nenhuma seção neste caderno.</p></div>
          ) : sections.map((sec) => (
            <button key={sec.id} className="notes-item" onClick={() => pickSection(sec)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-2)', flexShrink: 0 }}>
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
              <span className="notes-item-title">{sec.title}</span>
              <svg className="notes-arrow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          ))}
        </div>
      ) : level === 'pages' ? (
        <div className="notes-list">
          {pages.length === 0 ? (
            <div className="notes-empty"><p>Nenhuma página nesta seção.</p></div>
          ) : pages.map((pg) => (
            <button key={pg.id} className="notes-item" onClick={() => pickPage(pg)}>
              {pg.pinned ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--green)', flexShrink: 0 }}>
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-2)', flexShrink: 0 }}>
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
              )}
              <span className="notes-item-title">{pg.title}</span>
              {pg.tags.length > 0 && <span className="notes-tag">{pg.tags[0]}</span>}
              <svg className="notes-arrow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          ))}
        </div>
      ) : page ? (
        <div className="notes-content">
          {page.tags.length > 0 && (
            <div className="notes-tags-row">
              {page.tags.map((tag) => <span key={tag} className="notes-tag">{tag}</span>)}
            </div>
          )}
          {page.content
            ? renderContent(page.content)
            : <p className="notes-content-empty">Página sem conteúdo.</p>
          }
        </div>
      ) : null}
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import { useAuth } from '../contexts/AuthContext'
import {
  createNotebook,
  createPage,
  createSection,
  deleteNotebook,
  deletePage,
  deleteSection,
  subscribeNotebooks,
  subscribePages,
  subscribeSections,
  updateNotebook,
  updatePage,
  updateSection,
} from '../lib/notesFirestore'
import type { Notebook, NotePage, NoteSection } from '../types/notes'
import { NOTEBOOK_COLORS } from '../types/notes'
import { NoteEditor } from '../components/notes/NoteEditor'

type SaveState = 'saved' | 'saving' | 'unsaved'
type MidView = 'sections' | 'pages'

export function NotesPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [sections, setSections] = useState<NoteSection[]>([])
  const [pages, setPages] = useState<NotePage[]>([])

  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('saved')

  const [midView, setMidView] = useState<MidView>('sections')

  // Creation states
  const [creatingNb, setCreatingNb] = useState(false)
  const [newNbTitle, setNewNbTitle] = useState('')
  const [creatingSect, setCreatingSect] = useState(false)
  const [newSectTitle, setNewSectTitle] = useState('')
  const [creatingPage, setCreatingPage] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')

  // Rename states
  const [renamingNbId, setRenamingNbId] = useState<string | null>(null)
  const [renamingNbTitle, setRenamingNbTitle] = useState('')
  const [renamingSectId, setRenamingSectId] = useState<string | null>(null)
  const [renamingSectTitle, setRenamingSectTitle] = useState('')
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null)
  const [renamingPageTitle, setRenamingPageTitle] = useState('')

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<Partial<{ title: string; content: string }>>({})
  const idsRef = useRef({ uid, selectedNotebookId, selectedSectionId, selectedPageId })

  useEffect(() => {
    idsRef.current = { uid, selectedNotebookId, selectedSectionId, selectedPageId }
  })

  const flushSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    const { uid: u, selectedNotebookId: nb, selectedSectionId: s, selectedPageId: pg } = idsRef.current
    if (u && nb && s && pg && Object.keys(pendingRef.current).length > 0) {
      void updatePage(u, nb, s, pg, pendingRef.current)
      pendingRef.current = {}
    }
    setSaveState('saved')
  }, [])

  const scheduleSave = useCallback((patch: Partial<{ title: string; content: string }>) => {
    pendingRef.current = { ...pendingRef.current, ...patch }
    setSaveState('unsaved')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      const { uid: u, selectedNotebookId: nb, selectedSectionId: s, selectedPageId: pg } = idsRef.current
      if (!u || !nb || !s || !pg) return
      const pending = pendingRef.current
      if (Object.keys(pending).length === 0) return
      pendingRef.current = {}
      setSaveState('saving')
      try {
        await updatePage(u, nb, s, pg, pending)
        setSaveState('saved')
      } catch {
        setSaveState('unsaved')
      }
    }, 1500)
  }, [])

  // Subscriptions
  useEffect(() => {
    if (!uid) return
    return subscribeNotebooks(uid, setNotebooks)
  }, [uid])

  useEffect(() => {
    if (!uid || !selectedNotebookId) { setSections([]); return }
    return subscribeSections(uid, selectedNotebookId, setSections)
  }, [uid, selectedNotebookId])

  useEffect(() => {
    if (!uid || !selectedNotebookId || !selectedSectionId) { setPages([]); return }
    return subscribePages(uid, selectedNotebookId, selectedSectionId, setPages)
  }, [uid, selectedNotebookId, selectedSectionId])

  // Load page content only when the selected page ID changes (not on every pages update)
  useEffect(() => {
    if (!selectedPageId) { setLocalTitle(''); setLocalContent(''); return }
    const pg = pages.find((p) => p.id === selectedPageId)
    if (pg) { setLocalTitle(pg.title); setLocalContent(pg.content) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId])

  // ─── Notebook handlers ────────────────────────────────────────────────────

  const handleSelectNotebook = (id: string) => {
    flushSave()
    setSelectedNotebookId(id)
    setSelectedSectionId(null)
    setSelectedPageId(null)
    setMidView('sections')
  }

  const handleCreateNotebook = async () => {
    if (!uid || !newNbTitle.trim()) return
    const color = NOTEBOOK_COLORS[notebooks.length % NOTEBOOK_COLORS.length] ?? '#1976d2'
    const nbId = await createNotebook(uid, newNbTitle.trim(), color)
    setNewNbTitle('')
    setCreatingNb(false)
    setSelectedNotebookId(nbId)
    const sId = await createSection(uid, nbId, 'Geral')
    setSelectedSectionId(sId)
    setMidView('pages')
  }

  const handleRenameNotebook = async () => {
    if (!uid || !renamingNbId) { setRenamingNbId(null); return }
    const trimmed = renamingNbTitle.trim()
    if (trimmed) await updateNotebook(uid, renamingNbId, { title: trimmed })
    setRenamingNbId(null)
  }

  const handleDeleteNotebook = async (id: string) => {
    if (!uid) return
    if (!window.confirm('Excluir este caderno e todo seu conteúdo?')) return
    await deleteNotebook(uid, id)
    if (selectedNotebookId === id) {
      setSelectedNotebookId(null)
      setSelectedSectionId(null)
      setSelectedPageId(null)
    }
  }

  // ─── Section handlers ─────────────────────────────────────────────────────

  const handleSelectSection = (id: string) => {
    flushSave()
    setSelectedSectionId(id)
    setSelectedPageId(null)
    setMidView('pages')
  }

  const handleCreateSection = async () => {
    if (!uid || !selectedNotebookId || !newSectTitle.trim()) return
    const sId = await createSection(uid, selectedNotebookId, newSectTitle.trim())
    setNewSectTitle('')
    setCreatingSect(false)
    setSelectedSectionId(sId)
    setMidView('pages')
  }

  const handleRenameSection = async () => {
    if (!uid || !selectedNotebookId || !renamingSectId) { setRenamingSectId(null); return }
    const trimmed = renamingSectTitle.trim()
    if (trimmed) await updateSection(uid, selectedNotebookId, renamingSectId, { title: trimmed })
    setRenamingSectId(null)
  }

  const handleDeleteSection = async (id: string) => {
    if (!uid || !selectedNotebookId) return
    if (!window.confirm('Excluir esta seção e suas páginas?')) return
    await deleteSection(uid, selectedNotebookId, id)
    if (selectedSectionId === id) { setSelectedSectionId(null); setSelectedPageId(null) }
    setMidView('sections')
  }

  // ─── Page handlers ────────────────────────────────────────────────────────

  const handleSelectPage = (pg: NotePage) => {
    flushSave()
    setSelectedPageId(pg.id)
    setLocalTitle(pg.title)
    setLocalContent(pg.content)
  }

  const handleCreatePage = async () => {
    if (!uid || !selectedNotebookId || !selectedSectionId) return
    const title = newPageTitle.trim() || 'Nova página'
    const pgId = await createPage(uid, selectedNotebookId, selectedSectionId, title)
    setNewPageTitle('')
    setCreatingPage(false)
    setSelectedPageId(pgId)
    setLocalTitle(title)
    setLocalContent('')
  }

  const handleRenamePage = async () => {
    if (!uid || !selectedNotebookId || !selectedSectionId || !renamingPageId) {
      setRenamingPageId(null); return
    }
    const trimmed = renamingPageTitle.trim()
    if (trimmed) {
      await updatePage(uid, selectedNotebookId, selectedSectionId, renamingPageId, { title: trimmed })
      if (renamingPageId === selectedPageId) setLocalTitle(trimmed)
    }
    setRenamingPageId(null)
  }

  const handleDeletePage = async (id: string) => {
    if (!uid || !selectedNotebookId || !selectedSectionId) return
    if (!window.confirm('Excluir esta página?')) return
    await deletePage(uid, selectedNotebookId, selectedSectionId, id)
    if (selectedPageId === id) { setSelectedPageId(null); setLocalTitle(''); setLocalContent('') }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const selectedNotebook = notebooks.find((n) => n.id === selectedNotebookId)
  const selectedSection = sections.find((s) => s.id === selectedSectionId)
  const isDark = theme.palette.mode === 'dark'

  const columnHeader = (label: string, onAdd?: () => void) => (
    <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
      <Typography
        variant="caption"
        sx={{ flex: 1, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}
        noWrap
      >
        {label}
      </Typography>
      {onAdd ? (
        <Tooltip title="Adicionar">
          <IconButton size="small" onClick={onAdd} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
            <AddRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  )

  const inlineCreate = (
    value: string,
    onChange: (v: string) => void,
    onConfirm: () => void,
    onCancel: () => void,
    placeholder: string
  ) => (
    <Box sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.25 }}>
      <InputBase
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void onConfirm()
          if (e.key === 'Escape') onCancel()
        }}
        sx={{ flex: 1, fontSize: 13, px: 1, py: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.06) }}
      />
      <IconButton size="small" onClick={() => void onConfirm()} color="primary">
        <CheckRoundedIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <IconButton size="small" onClick={onCancel}>
        <CloseRoundedIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )

  const emptyHint = (text: string) => (
    <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
      <Typography variant="caption" color="text.disabled">{text}</Typography>
    </Box>
  )

  // Inline rename input shared by notebook/section/page items
  const inlineRename = (
    value: string,
    onChange: (v: string) => void,
    onConfirm: () => void,
    onCancel: () => void
  ) => (
    <Box
      sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.25, minWidth: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <InputBase
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void onConfirm()
          if (e.key === 'Escape') onCancel()
        }}
        sx={{ flex: 1, fontSize: 13, px: 0.5, minWidth: 0 }}
      />
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); void onConfirm() }} color="primary">
        <CheckRoundedIcon sx={{ fontSize: 13 }} />
      </IconButton>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCancel() }}>
        <CloseRoundedIcon sx={{ fontSize: 13 }} />
      </IconButton>
    </Box>
  )

  const actionBtns = (
    onRename: () => void,
    onDelete: () => void
  ) => (
    <Box
      className="item-actions"
      sx={{ display: 'flex', flexShrink: 0, opacity: 0, 'li:hover &': { opacity: 1 } }}
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton size="small" onClick={onRename} sx={{ color: 'text.secondary', p: 0.25 }}>
        <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main', p: 0.25 }}>
        <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flex: 1, height: 0, overflow: 'hidden' }}>

      {/* ── Column 1: Notebooks ── */}
      <Box sx={{
        width: { xs: 176, sm: 200, md: 220 }, flexShrink: 0,
        borderRight: 1, borderColor: 'divider',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        bgcolor: 'background.paper',
      }}>
        {columnHeader('Cadernos', () => { setCreatingNb(true); setNewNbTitle('') })}
        <Divider />
        {creatingNb && inlineCreate(newNbTitle, setNewNbTitle, handleCreateNotebook, () => setCreatingNb(false), 'Nome do caderno…')}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {notebooks.length === 0 && !creatingNb && emptyHint('Nenhum caderno')}
          <List disablePadding dense component="ul">
            {notebooks.map((nb) => {
              const active = nb.id === selectedNotebookId
              const isRenaming = renamingNbId === nb.id
              return (
                <ListItemButton
                  key={nb.id}
                  component="li"
                  selected={active}
                  onClick={() => !isRenaming && handleSelectNotebook(nb.id)}
                  sx={{
                    px: 1.5, py: 0.75,
                    '&.Mui-selected': { bgcolor: alpha(nb.color, isDark ? 0.2 : 0.12) },
                    '&.Mui-selected:hover': { bgcolor: alpha(nb.color, isDark ? 0.28 : 0.18) },
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: nb.color, flexShrink: 0, mr: 1.25 }} />
                  {isRenaming ? (
                    inlineRename(
                      renamingNbTitle,
                      setRenamingNbTitle,
                      handleRenameNotebook,
                      () => setRenamingNbId(null)
                    )
                  ) : (
                    <>
                      <ListItemText
                        primary={nb.title}
                        slotProps={{ primary: { sx: { fontSize: 13, fontWeight: active ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } }}
                        sx={{ my: 0 }}
                      />
                      {actionBtns(
                        () => { setRenamingNbId(nb.id); setRenamingNbTitle(nb.title) },
                        () => void handleDeleteNotebook(nb.id)
                      )}
                    </>
                  )}
                </ListItemButton>
              )
            })}
          </List>
        </Box>
      </Box>

      {/* ── Column 2: Sections + Pages ── */}
      <Box sx={{
        width: { xs: 176, sm: 200, md: 240 }, flexShrink: 0,
        borderRight: 1, borderColor: 'divider',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.012),
      }}>
        {!selectedNotebookId ? (
          emptyHint('Selecione um caderno')
        ) : midView === 'sections' ? (
          <>
            {columnHeader(
              `Seções · ${selectedNotebook?.title ?? ''}`,
              () => { setCreatingSect(true); setNewSectTitle('') }
            )}
            <Divider />
            {creatingSect && inlineCreate(newSectTitle, setNewSectTitle, handleCreateSection, () => setCreatingSect(false), 'Nome da seção…')}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {sections.length === 0 && !creatingSect && emptyHint('Nenhuma seção')}
              <List disablePadding dense component="ul">
                {sections.map((s) => {
                  const isRenaming = renamingSectId === s.id
                  return (
                    <ListItemButton
                      key={s.id}
                      component="li"
                      onClick={() => !isRenaming && handleSelectSection(s.id)}
                      sx={{ px: 1.5, py: 0.75 }}
                    >
                      {isRenaming ? (
                        inlineRename(
                          renamingSectTitle,
                          setRenamingSectTitle,
                          handleRenameSection,
                          () => setRenamingSectId(null)
                        )
                      ) : (
                        <>
                          <ListItemText
                            primary={s.title}
                            slotProps={{ primary: { sx: { fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } }}
                            sx={{ my: 0 }}
                          />
                          {actionBtns(
                            () => { setRenamingSectId(s.id); setRenamingSectTitle(s.title) },
                            () => void handleDeleteSection(s.id)
                          )}
                        </>
                      )}
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ px: 1, py: 0.75, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <IconButton size="small" onClick={() => setMidView('sections')} sx={{ mr: 0.5 }}>
                <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography
                variant="caption"
                sx={{ flex: 1, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}
                noWrap
              >
                {selectedSection?.title ?? 'Páginas'}
              </Typography>
              <Tooltip title="Adicionar página">
                <IconButton size="small" onClick={() => { setCreatingPage(true); setNewPageTitle('') }} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                  <AddRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider />
            {creatingPage && inlineCreate(newPageTitle, setNewPageTitle, handleCreatePage, () => setCreatingPage(false), 'Título da página…')}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {pages.length === 0 && !creatingPage && emptyHint('Nenhuma página')}
              <List disablePadding dense component="ul">
                {pages.map((pg) => {
                  const active = pg.id === selectedPageId
                  const isRenaming = renamingPageId === pg.id
                  return (
                    <ListItemButton
                      key={pg.id}
                      component="li"
                      selected={active}
                      onClick={() => !isRenaming && handleSelectPage(pg)}
                      sx={{
                        px: 1.5, py: 0.75,
                        '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1) },
                      }}
                    >
                      {isRenaming ? (
                        inlineRename(
                          renamingPageTitle,
                          setRenamingPageTitle,
                          handleRenamePage,
                          () => setRenamingPageId(null)
                        )
                      ) : (
                        <>
                          <ListItemText
                            primary={pg.title}
                            slotProps={{ primary: { sx: { fontSize: 13, fontWeight: active ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } }}
                            sx={{ my: 0 }}
                          />
                          {actionBtns(
                            () => { setRenamingPageId(pg.id); setRenamingPageTitle(pg.title) },
                            () => void handleDeletePage(pg.id)
                          )}
                        </>
                      )}
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>
          </>
        )}
      </Box>

      {/* ── Column 3: Editor ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!selectedPageId ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, color: 'text.disabled' }}>
            <EditNoteRoundedIcon sx={{ fontSize: 64, opacity: 0.25 }} />
            <Typography variant="body2">Selecione uma página para começar a escrever</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ px: { xs: 2.5, sm: 5, md: 8 }, pt: 3, pb: 0.5, flexShrink: 0 }}>
              <InputBase
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value)
                  scheduleSave({ title: e.target.value })
                }}
                placeholder="Título"
                sx={{
                  width: '100%',
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'text.primary',
                  '& input': { p: 0 },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                {saveState === 'saving' ? <CircularProgress size={10} /> : null}
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                  {saveState === 'saved' ? 'Salvo' : saveState === 'saving' ? 'Salvando…' : 'Não salvo'}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mt: 1 }} />
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <NoteEditor
                key={selectedPageId}
                content={localContent}
                onChange={(c) => {
                  setLocalContent(c)
                  scheduleSave({ content: c })
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

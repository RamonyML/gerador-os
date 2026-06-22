import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { Link as RouterLink } from 'react-router-dom'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import {
  subscribeNotebooks,
  subscribePages,
  subscribeSections,
} from '../lib/notesFirestore'
import type { Notebook, NotePage, NoteSection } from '../types/notes'

function parseContent(raw: string) {
  if (!raw || raw.trim() === '') return ''
  try {
    return JSON.parse(raw) as object
  } catch {
    return raw
  }
}

function ReadOnlyNote({ content }: { content: string }) {
  const theme = useTheme()
  const { isDark } = useColorMode()
  const accent = theme.palette.primary.main

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
    ],
    content: parseContent(content),
    editable: false,
  })

  useEffect(() => {
    if (editor) editor.commands.setContent(parseContent(content))
  }, [editor, content])

  if (!editor) return null

  return (
    <Box
      sx={{
        '& .ProseMirror': {
          outline: 'none',
          fontSize: '0.875rem',
          lineHeight: 1.65,
          color: 'text.primary',
          '& h1': { fontSize: '1.2rem', fontWeight: 700, mt: 1.5, mb: 0.5, lineHeight: 1.3 },
          '& h2': { fontSize: '1.05rem', fontWeight: 700, mt: 1.25, mb: 0.4 },
          '& h3': { fontSize: '0.95rem', fontWeight: 600, mt: 1, mb: 0.4 },
          '& p': { my: 0.4 },
          '& ul, & ol': { paddingLeft: 2.5 },
          '& li': { my: 0.2 },
          '& blockquote': {
            borderLeft: `3px solid ${alpha(accent, 0.5)}`,
            pl: 1.5,
            ml: 0,
            my: 0.75,
            color: 'text.secondary',
            fontStyle: 'italic',
          },
          '& code': {
            bgcolor: alpha(accent, isDark ? 0.15 : 0.08),
            color: isDark ? '#93c5fd' : '#1d4ed8',
            px: 0.6,
            py: 0.1,
            borderRadius: 0.5,
            fontSize: '0.8125rem',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          },
          '& pre': {
            bgcolor: isDark ? '#1e293b' : '#f8fafc',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            p: 1.5,
            my: 1,
            overflow: 'auto',
            '& code': {
              bgcolor: 'transparent',
              color: isDark ? '#cbd5e1' : '#334155',
              px: 0,
              py: 0,
            },
          },
          '& mark': {
            bgcolor: alpha(theme.palette.warning.main, isDark ? 0.3 : 0.25),
            color: 'inherit',
            borderRadius: 0.25,
          },
          '& ul[data-type="taskList"]': {
            listStyle: 'none',
            paddingLeft: 0,
            '& li': {
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.75,
              '& > label': { flexShrink: 0 },
              '& > div': { flex: 1 },
              '&[data-checked="true"] > div p': {
                textDecoration: 'line-through',
                color: 'text.disabled',
              },
            },
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  )
}

type Props = {
  sx?: object
  fixedHeight?: boolean
}

export function NotesWidget({ sx, fixedHeight = false }: Props) {
  const { user } = useAuth()
  const theme = useTheme()
  const { isDark } = useColorMode()
  const uid = user?.uid ?? null

  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [nbReady, setNbReady] = useState(false)
  const [selectedNbId, setSelectedNbId] = useState<string | null>(null)

  const [sections, setSections] = useState<NoteSection[]>([])
  const [sectReady, setSectReady] = useState(false)
  const [selectedSectId, setSelectedSectId] = useState<string | null>(null)

  const [pages, setPages] = useState<NotePage[]>([])
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    return subscribeNotebooks(uid, (nbs) => {
      setNotebooks(nbs)
      setNbReady(true)
      setSelectedNbId((prev) => prev ?? (nbs[0]?.id ?? null))
    })
  }, [uid])

  useEffect(() => {
    if (!uid || !selectedNbId) return
    setSections([])
    setSectReady(false)
    setSelectedSectId(null)
    return subscribeSections(uid, selectedNbId, (sects) => {
      setSections(sects)
      setSectReady(true)
      setSelectedSectId((prev) => prev ?? (sects[0]?.id ?? null))
    })
  }, [uid, selectedNbId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!uid || !selectedNbId || !selectedSectId) return
    setPages([])
    setExpandedPageId(null)
    return subscribePages(uid, selectedNbId, selectedSectId, (pgs) => {
      setPages(pgs)
    })
  }, [uid, selectedNbId, selectedSectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedNb = notebooks.find((n) => n.id === selectedNbId)
  const primary = theme.palette.primary.main

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          pt: { xs: 2, sm: 2.5 },
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditNoteRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Minhas anotações
          </Typography>
          {selectedNb && (
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: selectedNb.color,
                flexShrink: 0,
              }}
            />
          )}
        </Box>
        <Button
          component={RouterLink}
          to="/anotacoes"
          size="small"
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{ fontSize: 12, color: 'text.secondary', flexShrink: 0 }}
        >
          Abrir
        </Button>
      </Box>

      {/* Notebook tabs */}
      {nbReady && notebooks.length > 0 && (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            pb: 1,
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {notebooks.map((nb) => {
            const active = selectedNbId === nb.id
            return (
              <Chip
                key={nb.id}
                label={nb.title}
                size="small"
                onClick={() => {
                  setSelectedNbId(nb.id)
                  setExpandedPageId(null)
                }}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  bgcolor: active ? nb.color : alpha(nb.color, isDark ? 0.14 : 0.1),
                  color: active ? '#fff' : (isDark ? alpha(nb.color, 0.9) : nb.color),
                  border: `1px solid ${alpha(nb.color, active ? 0 : 0.3)}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: active ? nb.color : alpha(nb.color, isDark ? 0.24 : 0.18),
                  },
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )
          })}
        </Box>
      )}

      {/* Section tabs (only when more than one) */}
      {sectReady && sections.length > 1 && (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            pb: 1,
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {sections.map((sect) => (
            <Chip
              key={sect.id}
              label={sect.title}
              size="small"
              variant={selectedSectId === sect.id ? 'filled' : 'outlined'}
              onClick={() => {
                setSelectedSectId(sect.id)
                setExpandedPageId(null)
              }}
              sx={{
                height: 18,
                fontSize: 10,
                cursor: 'pointer',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          ))}
        </Box>
      )}

      <Divider sx={{ flexShrink: 0 }} />

      <Box sx={fixedHeight
        ? { flex: 1, minHeight: 0, overflowY: 'auto' }
        : { maxHeight: 420, overflowY: 'auto' }
      }>
        {!nbReady ? (
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: 1.5 }} />
              ))}
            </Stack>
          </Box>
        ) : notebooks.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <EditNoteRoundedIcon
              sx={{ fontSize: 32, color: 'text.disabled', opacity: 0.5, mb: 0.75 }}
            />
            <Typography variant="body2" color="text.secondary">
              Nenhum caderno ainda
            </Typography>
            <Button
              component={RouterLink}
              to="/anotacoes"
              size="small"
              sx={{ mt: 1, color: 'primary.main' }}
            >
              Criar caderno
            </Button>
          </Box>
        ) : sectReady && pages.length === 0 ? (
          <Box sx={{ py: 3.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma página nesta seção
            </Typography>
          </Box>
        ) : (
          pages.map((page, idx) => {
            const isExpanded = expandedPageId === page.id
            return (
              <Box key={page.id}>
                {idx > 0 && <Divider />}
                {/* Page title row */}
                <Box
                  onClick={() => setExpandedPageId(isExpanded ? null : page.id)}
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    bgcolor: isExpanded
                      ? (isDark ? alpha('#fff', 0.04) : alpha(primary, 0.04))
                      : 'transparent',
                    transition: 'background 0.15s',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha(primary, 0.05),
                    },
                  }}
                >
                  {page.pinned && (
                    <PushPinOutlinedIcon
                      sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isExpanded ? 700 : 500,
                      flex: 1,
                      minWidth: 0,
                      color: isExpanded ? 'primary.main' : 'text.primary',
                      transition: 'color 0.15s',
                    }}
                    noWrap
                  >
                    {page.title}
                  </Typography>
                  <ExpandMoreRoundedIcon
                    sx={{
                      fontSize: 16,
                      color: isExpanded ? 'primary.main' : 'text.disabled',
                      flexShrink: 0,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s, color 0.15s',
                    }}
                  />
                </Box>

                {/* Expanded content */}
                <Collapse in={isExpanded} timeout={220} unmountOnExit>
                  <Box
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      pb: 2,
                      pt: 1,
                      maxHeight: 320,
                      overflowY: 'auto',
                      bgcolor: isDark ? alpha('#fff', 0.025) : alpha(primary, 0.025),
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    {page.content ? (
                      <ReadOnlyNote content={page.content} />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.disabled"
                        sx={{ py: 1, fontStyle: 'italic' }}
                      >
                        Página em branco
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>
            )
          })
        )}
      </Box>
    </Paper>
  )
}

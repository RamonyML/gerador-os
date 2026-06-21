import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { Box, IconButton, Tooltip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import ChecklistIcon from '@mui/icons-material/Checklist'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import HighlightIcon from '@mui/icons-material/Highlight'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'

type Props = {
  content: string
  onChange: (content: string) => void
}

function parseContent(raw: string) {
  if (!raw || raw.trim() === '') return ''
  try {
    return JSON.parse(raw) as object
  } catch {
    return raw
  }
}

export function NoteEditor({ content, onChange }: Props) {
  const theme = useTheme()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Comece a escrever…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
    ],
    content: parseContent(content),
    onUpdate: ({ editor: e }) => {
      onChange(JSON.stringify(e.getJSON()))
    },
  })

  if (!editor) return null

  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main

  const Btn = ({
    label,
    active,
    onClick,
    children,
  }: {
    label: string
    active?: boolean
    onClick: () => void
    children: React.ReactNode
  }) => (
    <Tooltip title={label} placement="top" arrow>
      <IconButton
        size="small"
        tabIndex={-1}
        onClick={(e) => { e.preventDefault(); onClick() }}
        sx={{
          borderRadius: 1,
          width: 28,
          height: 28,
          color: active ? 'primary.main' : 'text.secondary',
          bgcolor: active ? alpha(accent, 0.12) : 'transparent',
          '&:hover': { bgcolor: alpha(accent, 0.1) },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  )

  const Sep = () => (
    <Box sx={{ width: '1px', height: 18, bgcolor: 'divider', mx: 0.25, flexShrink: 0 }} />
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          px: 1.5,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
          flexShrink: 0,
          '&::-webkit-scrollbar': { height: 4 },
        }}
      >
        <Btn
          label="Negrito (Ctrl+B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Itálico (Ctrl+I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Sublinhado (Ctrl+U)"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlinedIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Tachado"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughSIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Destacar"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <HighlightIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Código inline"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon sx={{ fontSize: 16 }} />
        </Btn>

        <Sep />

        <Btn
          label="Lista com marcadores"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Lista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Lista de tarefas"
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ChecklistIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Citação"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuoteIcon sx={{ fontSize: 16 }} />
        </Btn>

        <Sep />

        <Btn
          label="Alinhar à esquerda"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <FormatAlignLeftIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Centralizar"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <FormatAlignCenterIcon sx={{ fontSize: 16 }} />
        </Btn>
        <Btn
          label="Alinhar à direita"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <FormatAlignRightIcon sx={{ fontSize: 16 }} />
        </Btn>
      </Box>

      {/* Content area — altura fixa baseada no viewport para evitar scroll da página */}
      <Box
        sx={{
          height: 'calc(100vh - 190px)',
          overflow: 'auto',
          px: { xs: 2.5, sm: 5, md: 8 },
          py: 3,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 320,
            fontSize: '0.9375rem',
            lineHeight: 1.75,
            color: 'text.primary',
            '& h1': { fontSize: '1.625rem', fontWeight: 700, mt: 2, mb: 0.75, lineHeight: 1.3 },
            '& h2': { fontSize: '1.3rem', fontWeight: 700, mt: 1.5, mb: 0.5, lineHeight: 1.35 },
            '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 1.25, mb: 0.5 },
            '& p': { my: 0.5 },
            '& ul, & ol': { paddingLeft: 3 },
            '& li': { my: 0.25 },
            '& blockquote': {
              borderLeft: `3px solid ${alpha(accent, 0.5)}`,
              pl: 2,
              ml: 0,
              my: 1,
              color: 'text.secondary',
              fontStyle: 'italic',
            },
            '& code': {
              bgcolor: alpha(accent, isDark ? 0.15 : 0.08),
              color: isDark ? '#93c5fd' : '#1d4ed8',
              px: 0.75,
              py: 0.125,
              borderRadius: 0.5,
              fontSize: '0.8125rem',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            },
            '& pre': {
              bgcolor: isDark ? '#1e293b' : '#f8fafc',
              border: `1px solid`,
              borderColor: 'divider',
              borderRadius: 1.5,
              p: 2,
              my: 1.5,
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
                gap: 1,
                '& > label': {
                  flexShrink: 0,
                  cursor: 'pointer',
                  '& input[type="checkbox"]': { cursor: 'pointer' },
                },
                '& > div': { flex: 1 },
                '&[data-checked="true"] > div p': {
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                },
              },
            },
            '& p.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              color: theme.palette.text.disabled,
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
}

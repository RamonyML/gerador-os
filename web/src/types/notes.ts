export type Notebook = {
  id: string
  title: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export type NoteSection = {
  id: string
  notebookId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export type NotePage = {
  id: string
  notebookId: string
  sectionId: string
  title: string
  content: string
  pinned: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export const NOTEBOOK_COLORS = [
  '#1976d2', '#388e3c', '#d32f2f', '#f57c00',
  '#7b1fa2', '#00838f', '#558b2f', '#4527a0',
  '#c62828', '#00695c', '#1565c0', '#6a1b9a',
]

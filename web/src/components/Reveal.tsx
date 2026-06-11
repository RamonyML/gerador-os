import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

type Props = {
  children: ReactNode
  /** Atraso da animação em ms (útil para efeito escalonado em grids). */
  delay?: number
  /** Deslocamento vertical inicial (px). */
  y?: number
  sx?: SxProps<Theme>
}

/**
 * Revela o conteúdo com fade-in + leve subida ao montar a página.
 * Respeita `prefers-reduced-motion`.
 */
export function Reveal({ children, delay = 0, y = 14, sx }: Props) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <Box
      sx={[
        {
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
          transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
          '@media (prefers-reduced-motion: reduce)': {
            opacity: 1,
            transform: 'none',
            transition: 'none',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  )
}

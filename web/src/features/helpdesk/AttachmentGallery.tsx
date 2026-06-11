import { useState } from 'react'
import { Backdrop, Box, Fade, IconButton, Modal, Tooltip, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { alpha } from '@mui/material/styles'
import type { TicketAttachment } from '../../types/ticket'

/** Exibe as imagens anexadas em miniatura; clique abre um preview ampliado. */
export function AttachmentGallery({
  attachments,
  size = 96,
}: {
  attachments: TicketAttachment[]
  size?: number
}) {
  const [preview, setPreview] = useState<TicketAttachment | null>(null)

  if (!attachments.length) return null

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
        {attachments.map((a) => (
          <Box
            key={a.path}
            component="img"
            src={a.url}
            alt={a.name}
            loading="lazy"
            onClick={() => setPreview(a)}
            sx={{
              width: size,
              height: size,
              objectFit: 'cover',
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
              cursor: 'zoom-in',
              display: 'block',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'scale(1.03)', boxShadow: 3 },
            }}
          />
        ))}
      </Box>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { sx: { bgcolor: alpha('#000', 0.85) } } }}
      >
        <Fade in={!!preview}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              outline: 'none',
            }}
            onClick={() => setPreview(null)}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                color: '#fff',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography
                variant="body2"
                sx={{ flex: 1, minWidth: 0, opacity: 0.9 }}
                noWrap
                title={preview?.name}
              >
                {preview?.name}
              </Typography>
              <Tooltip title="Fechar">
                <IconButton onClick={() => setPreview(null)} sx={{ color: '#fff' }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 4 },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {preview ? (
                <Box
                  component="img"
                  src={preview.url}
                  alt={preview.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 1,
                    boxShadow: 24,
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

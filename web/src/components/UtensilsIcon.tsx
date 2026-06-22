import { SvgIcon, type SvgIconProps } from '@mui/material'

export function UtensilsIcon({ sx, ...props }: SvgIconProps) {
  return (
    <SvgIcon
      {...props}
      viewBox="0 0 24 24"
      sx={{ fill: 'none', stroke: 'currentColor', ...sx }}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 2v20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

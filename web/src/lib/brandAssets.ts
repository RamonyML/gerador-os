import type { ColorMode } from '../contexts/ColorModeContext'

/** Logos em `web/public/brand/` — variante conforme contraste do tema. */
export function brandLogoSrc(mode: ColorMode): string {
  if (mode === 'gelo' || mode === 'cinza') return '/brand/logo_gelo-dark.png'
  return mode === 'dark'
    ? '/brand/mzlogo-fundoescuro.png'
    : '/brand/mzlogo-padrao-fundoclaro.png'
}

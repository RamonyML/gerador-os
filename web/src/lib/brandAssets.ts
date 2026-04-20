import type { ColorMode } from '../contexts/ColorModeContext'

/** Logos em `web/public/brand/` — variante conforme contraste do tema. */
export function brandLogoSrc(mode: ColorMode): string {
  return mode === 'dark'
    ? '/brand/mzlogo-fundoescuro.png'
    : '/brand/mzlogo-padrao-fundoclaro.png'
}

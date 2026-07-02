import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { useTheme, type Theme } from '@mui/material/styles'

const push = keyframes`
  0% { transform: translate(0, -1em) rotate(-45deg); }
  5% { transform: translate(0, -1em) rotate(-50deg); }
  20% { transform: translate(1em, -2em) rotate(47deg); }
  25% { transform: translate(1em, -2em) rotate(45deg); }
  30% { transform: translate(1em, -2em) rotate(40deg); }
  45% { transform: translate(2em, -3em) rotate(137deg); }
  50% { transform: translate(2em, -3em) rotate(135deg); }
  55% { transform: translate(2em, -3em) rotate(130deg); }
  70% { transform: translate(3em, -4em) rotate(217deg); }
  75% { transform: translate(3em, -4em) rotate(220deg); }
  100% { transform: translate(0, -1em) rotate(-225deg); }
`

const Stage = styled.div<{ $fontSize: number }>`
  position: relative;
  font-size: ${(p) => p.$fontSize}px;
  width: 5.4em;
  height: 5.4em;
`

const Hill = styled.div<{ $line: string; $bg: string }>`
  position: absolute;
  width: 7.1em;
  height: 7.1em;
  top: 1.7em;
  left: 1.7em;
  border-left: 0.25em solid ${(p) => p.$line};
  transform: rotate(45deg);

  &::after {
    content: '';
    position: absolute;
    width: 7.1em;
    height: 7.1em;
    left: 0;
    background-color: ${(p) => p.$bg};
  }
`

const Box_ = styled.div<{ $line: string }>`
  position: absolute;
  left: 0;
  bottom: -0.1em;
  width: 1em;
  height: 1em;
  border: 0.25em solid ${(p) => p.$line};
  border-radius: 15%;
  transform: translate(0, -1em) rotate(-45deg);
  animation: ${push} 2.5s cubic-bezier(0.79, 0, 0.47, 0.97) infinite;
`

type BgToken = 'background.default' | 'background.paper'

function resolveBg(theme: Theme, token: BgToken) {
  return token === 'background.paper' ? theme.palette.background.paper : theme.palette.background.default
}

export function AppLoader({
  size = 16,
  bg = 'background.default',
  label = 'Carregando…',
}: {
  /** Font-size base (px) da animação — controla a escala inteira. */
  size?: number
  /** Cor de fundo a "imitar" por trás da animação, para casar com o contêiner ao redor. */
  bg?: BgToken
  label?: string
}) {
  const theme = useTheme()
  const line = theme.palette.primary.main
  const bgColor = resolveBg(theme, bg)

  return (
    <Stage $fontSize={size} role="status" aria-label={label}>
      <Box_ $line={line} />
      <Hill $line={line} $bg={bgColor} />
    </Stage>
  )
}

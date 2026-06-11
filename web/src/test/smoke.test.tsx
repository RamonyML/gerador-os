import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function Hello({ name }: { name: string }) {
  return <h1>Olá, {name}!</h1>
}

describe('ambiente de testes (jsdom + Testing Library)', () => {
  it('renderiza um componente React', () => {
    render(<Hello name="MZ NET" />)
    expect(
      screen.getByRole('heading', { name: 'Olá, MZ NET!' }),
    ).toBeInTheDocument()
  })
})

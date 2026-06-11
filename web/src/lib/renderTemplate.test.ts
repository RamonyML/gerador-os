import { describe, it, expect } from 'vitest'
import { renderTemplate } from './renderTemplate'

describe('renderTemplate', () => {
  it('substitui chaves simples', () => {
    expect(renderTemplate('Olá {{nome}}', { nome: 'Ana' })).toBe('Olá Ana')
  })

  it('resolve caminhos aninhados', () => {
    const out = renderTemplate('Operador: {{operador.nome}}', {
      operador: { nome: 'Carlos' },
    })
    expect(out).toBe('Operador: Carlos')
  })

  it('tolera espaços dentro das chaves', () => {
    expect(renderTemplate('{{  cliente  }}', { cliente: 'MZ' })).toBe('MZ')
  })

  it('troca valores ausentes por string vazia', () => {
    expect(renderTemplate('[{{ausente}}]', {})).toBe('[]')
  })
})

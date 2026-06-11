import { describe, it, expect } from 'vitest'
import { digitsPhoneBr, formatPhoneBrMask } from './phoneBrFormat'

describe('digitsPhoneBr', () => {
  it('mantém apenas dígitos e limita a 11', () => {
    expect(digitsPhoneBr('(11) 99999-8888')).toBe('11999998888')
    expect(digitsPhoneBr('1234567890123')).toBe('12345678901')
  })
})

describe('formatPhoneBrMask', () => {
  it('formata celular com 11 dígitos', () => {
    expect(formatPhoneBrMask('11999998888')).toBe('(11) 99999-8888')
  })

  it('formata fixo com 10 dígitos', () => {
    expect(formatPhoneBrMask('1133334444')).toBe('(11) 3333-4444')
  })

  it('retorna vazio para entrada vazia', () => {
    expect(formatPhoneBrMask('')).toBe('')
  })
})

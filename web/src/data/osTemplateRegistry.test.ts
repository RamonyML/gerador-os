import { describe, it, expect } from 'vitest'
import { OS_TEMPLATES, getOsTemplatesForProfile } from './osTemplateRegistry'
import type { UserProfile } from '../types/profile'

describe('osTemplateRegistry', () => {
  it('expõe catálogo não vazio', () => {
    expect(OS_TEMPLATES.length).toBeGreaterThan(0)
  })

  it('garante id e slug únicos', () => {
    const ids = OS_TEMPLATES.map((t) => t.id)
    const slugs = OS_TEMPLATES.map((t) => t.slug)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('filtra por setor (não-dev vê só o próprio setor)', () => {
    const operador: UserProfile = {
      email: 'op@test.com',
      displayName: 'Op',
      sector: 'suporte',
      hierarchy: 'operador',
      active: true,
      isDev: false,
      isAdmin: false,
    }
    const list = getOsTemplatesForProfile(operador)
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((t) => t.sector === 'suporte')).toBe(true)
  })

  it('dev vê todos os modelos', () => {
    const dev: UserProfile = {
      email: 'dev@test.com',
      displayName: 'Dev',
      sector: 'suporte',
      hierarchy: 'operador',
      active: true,
      isDev: true,
      isAdmin: false,
    }
    expect(getOsTemplatesForProfile(dev).length).toBe(OS_TEMPLATES.length)
  })
})

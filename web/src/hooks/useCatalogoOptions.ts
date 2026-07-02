import { useCatalogo } from './useCatalogo'
import type { OsTemplateField, FieldOption } from '../types/osTemplate'

/**
 * Retorna as opções para um campo select.
 * Se `field.catalogCategoria` estiver definido, carrega do Firestore;
 * caso contrário, usa `field.options ?? []`.
 */
export function useCatalogoOptions(field: OsTemplateField): FieldOption[] {
  const cat = field.catalogCategoria ?? 'equipamentos'
  const { items } = useCatalogo(cat)

  if (!field.catalogCategoria) return field.options ?? []

  return items
    .filter((i) => i.ativo && (!field.catalogGrupo || i.grupo === field.catalogGrupo))
    .map((i) => ({ value: i.value, label: i.label }))
}

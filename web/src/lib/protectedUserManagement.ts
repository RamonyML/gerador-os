/** Conta técnica que não pode ser alterada por gestores/supervisores (só por dev na UI + nas Functions). */
export const PROTECTED_ACCOUNT_EMAIL_LOWER = 'ramonyml@gmail.com'

export function isProtectedManagementAccount(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === PROTECTED_ACCOUNT_EMAIL_LOWER
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatMoney(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  return money.format(Number(value))
}

/** Convierte el valor de un input numérico a number|null con máx. 2 decimales (regla del API) */
export function toMoneyValue(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

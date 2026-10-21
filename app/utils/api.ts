import type { ICatalogQuery, IApiError } from '~/types/api.type'

export const AUTH_TOKEN_COOKIE = 'ss_token'
export const AUTH_USER_COOKIE = 'ss_user'

/** Convierte el error de Nest ({ message: string | string[] }) a un texto legible */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado') {
  const data = (error as { data?: IApiError })?.data
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(', ') : data.message
  }
  return (error as Error)?.message || fallback
}

/** Serializa { filters, page, limit } al formato filters[campo][op]=valor del API */
export function toCatalogQuery(query: ICatalogQuery = {}) {
  const params: Record<string, string | number> = {}
  for (const [field, ops] of Object.entries(query.filters ?? {})) {
    for (const [op, value] of Object.entries(ops)) {
      if (value === undefined || value === '') continue
      params[`filters[${field}][${op}]`] = String(value)
    }
  }
  if (query.page) params.page = query.page
  if (query.page && query.limit) params.limit = query.limit
  return params
}

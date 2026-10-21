export interface IPaginated<T> {
  data: T[]
  count: number
}

export interface IApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

export interface IAuditUser {
  fullName: string
}

export interface IAuditable {
  createdAt: string
  updatedAt: string
  createdBy?: IAuditUser | null
  updatedBy?: IAuditUser | null
}

/** filters[campo][op]=valor del API (ops: eq | like | gte | lte) */
export type FilterOp = 'eq' | 'like' | 'gte' | 'lte'
export type IFilters = Record<string, Partial<Record<FilterOp, string | number | boolean>>>

export interface ICatalogQuery {
  filters?: IFilters
  page?: number
  limit?: number
}

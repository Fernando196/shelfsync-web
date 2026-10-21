export interface IProductLookup {
  id: string
  barcode: string | null
  sku: string | null
  description: string | null
  needAssembly: boolean
  createdAt?: string
  updatedAt?: string
}

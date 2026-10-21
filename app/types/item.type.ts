import type { ITEM_CONDITION, ITEM_STATUS } from '~/const/items.const'
import type { IAuditable, IAuditUser } from './api.type'
import type { ICategoryRef } from './category.type'
import type { IProductLookup } from './product.type'

export type ItemStatus = (typeof ITEM_STATUS)[keyof typeof ITEM_STATUS]
export type ItemCondition = (typeof ITEM_CONDITION)[keyof typeof ITEM_CONDITION]

export interface IPhoto {
  id: string
  filename: string
  originalName?: string
  url: string
  thumbnailUrl: string | null
  mediumUrl: string | null
  createdAt: string
}

export interface IItem extends IAuditable {
  id: string
  code: number
  name: string | null
  qty: number
  location: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  status: ItemStatus
  price: number | null
  cost: number | null
  condition: ItemCondition
  categoryId: string | null
  category: ICategoryRef | null
  productLookupId: string | null
  productLookup: IProductLookup | null
  files?: IPhoto[]
  cover: IPhoto | null
  coverPhotoId: string | null
}

export interface IItemPayload {
  id?: string
  name?: string | null
  qty?: number
  location?: string | null
  notes?: string | null
  categoryId?: string | null
  price?: number | null
  cost?: number | null
  condition?: ItemCondition
  productLookupId?: string
  productLookup?: Omit<IProductLookup, 'id'>
}

export interface IItemQuery {
  q?: string
  status?: ItemStatus[]
  limit?: number
  offset?: number
}

export interface IStatusCounts {
  total: number
  counts: Record<ItemStatus, number>
}

export interface IStatusHistory {
  id: string
  fromStatus: ItemStatus | null
  toStatus: ItemStatus
  comment: string | null
  changedAt: string
  changedBy: IAuditUser | null
}

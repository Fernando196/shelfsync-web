import type { IPaginated } from '~/types/api.type'
import type {
  IItem,
  IItemPayload,
  IItemQuery,
  IStatusCounts,
  IStatusHistory,
  ItemStatus,
} from '~/types/item.type'

export const ItemService = () => {
  const { $api } = useNuxtApp()

  return {
    async getItems(query: IItemQuery = {}): Promise<IPaginated<IItem>> {
      return await $api<IPaginated<IItem>>('/items', {
        method: 'GET',
        query: {
          q: query.q || undefined,
          status: query.status?.length ? query.status.join(',') : undefined,
          limit: query.limit,
          offset: query.offset,
        },
      })
    },
    async getStatusCounts(q?: string): Promise<IStatusCounts> {
      return await $api<IStatusCounts>('/items/status-counts', {
        method: 'GET',
        query: { q: q || undefined },
      })
    },
    async getItem(id: string): Promise<IItem> {
      return await $api<IItem>(`/items/${id}`, { method: 'GET' })
    },
    async getHistory(id: string): Promise<IPaginated<IStatusHistory>> {
      return await $api<IPaginated<IStatusHistory>>(`/items/${id}/history`, { method: 'GET' })
    },
    async postItem(item: IItemPayload): Promise<IItem> {
      return await $api<IItem>('/items', { method: 'POST', body: item })
    },
    async patchItem(id: string, item: IItemPayload): Promise<IItem> {
      return await $api<IItem>(`/items/${id}`, { method: 'PATCH', body: item })
    },
    async deleteItem(id: string): Promise<void> {
      await $api(`/items/${id}`, { method: 'DELETE' })
    },
    async patchStatus(id: string, status: ItemStatus, comment?: string): Promise<IItem> {
      return await $api<IItem>(`/items/${id}/status`, {
        method: 'PATCH',
        body: { status, comment: comment || undefined },
      })
    },
    async uploadPhotos(id: string, photos: Blob[]): Promise<IItem> {
      const form = new FormData()
      photos.forEach((photo, i) => form.append('photos', photo, `photo-${Date.now()}-${i}.jpg`))
      return await $api<IItem>(`/items/${id}/photos`, { method: 'POST', body: form })
    },
    async deletePhoto(id: string, photoId: string): Promise<IItem> {
      return await $api<IItem>(`/items/${id}/photos/${photoId}`, { method: 'DELETE' })
    },
    async setCover(id: string, photoId: string | null): Promise<IItem> {
      return await $api<IItem>(`/items/${id}/cover`, { method: 'PATCH', body: { photoId } })
    },
  }
}

import { ITEMS_PAGE_SIZE } from '~/const/items.const'
import { ItemService } from '~/services/items'
import type { IItem, IItemPayload, IStatusCounts, ItemStatus } from '~/types/item.type'

export const useItemsStore = defineStore('items', () => {
  const service = ItemService()

  const items = ref<IItem[]>([])
  const count = ref(0)
  const statusCounts = ref<IStatusCounts | null>(null)
  const pending = ref(false)

  // Filtros de la vista de inventario
  const search = ref('')
  const statusFilter = ref<ItemStatus[]>([])
  const page = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / ITEMS_PAGE_SIZE)))

  async function fetchItems() {
    pending.value = true
    try {
      const [list, counts] = await Promise.all([
        service.getItems({
          q: search.value,
          status: statusFilter.value,
          limit: ITEMS_PAGE_SIZE,
          offset: (page.value - 1) * ITEMS_PAGE_SIZE,
        }),
        service.getStatusCounts(search.value),
      ])
      items.value = list.data
      count.value = list.count
      statusCounts.value = counts
    } finally {
      pending.value = false
    }
  }

  /** Reemplaza el item en la lista actual tras una mutación (el API regresa el item completo) */
  function replaceItem(updated: IItem) {
    const index = items.value.findIndex((i) => i.id === updated.id)
    if (index !== -1) items.value[index] = updated
  }

  async function createItem(payload: IItemPayload) {
    return await service.postItem({ id: crypto.randomUUID(), ...payload })
  }

  async function updateItem(id: string, payload: IItemPayload) {
    const updated = await service.patchItem(id, payload)
    replaceItem(updated)
    return updated
  }

  async function changeStatus(id: string, status: ItemStatus, comment?: string) {
    const updated = await service.patchStatus(id, status, comment)
    replaceItem(updated)
    return updated
  }

  async function deleteItem(id: string) {
    await service.deleteItem(id)
    items.value = items.value.filter((i) => i.id !== id)
    count.value = Math.max(0, count.value - 1)
  }

  return {
    // State
    items,
    count,
    statusCounts,
    pending,
    search,
    statusFilter,
    page,
    totalPages,

    // Actions
    fetchItems,
    replaceItem,
    createItem,
    updateItem,
    changeStatus,
    deleteItem,
  }
})

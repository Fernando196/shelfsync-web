<script setup lang="ts">
  import DataTable from '~/components/ui/DataTable.vue'
  import PageHeader from '~/components/ui/PageHeader.vue'
  import Pagination from '~/components/ui/Pagination.vue'
  import Search from '~/components/common/Search.vue'
  import Empty from '~/components/common/Empty.vue'
  import PhotoThumb from '~/components/common/PhotoThumb.vue'
  import ConfirmModal from '~/components/common/Modal/ConfirmModal.vue'
  import ItemCard from '~/components/inventory/ItemCard.vue'
  import ItemStatusBadge from '~/components/inventory/ItemStatusBadge.vue'
  import ItemStatusFilterTabs from '~/components/inventory/ItemStatusFilterTabs.vue'
  import ItemFormModal from '~/components/inventory/ItemFormModal.vue'
  import ItemStatusModal from '~/components/inventory/ItemStatusModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import {
    ITEMS_PAGE_SIZE,
    ITEM_STATUS_LIST,
    formatItemCode,
    getNextStatuses,
  } from '~/const/items.const'
  import { useItemsStore } from '~/store/items.store'
  import type { IItem, ItemStatus } from '~/types/item.type'
  import type { TableColumn } from '~/types/table.type'

  useHead({ title: 'Inventario · ShelfSync' })

  const itemsStore = useItemsStore()
  const { search, statusFilter, page } = storeToRefs(itemsStore)
  const permissions = usePermissions('/inventory')
  const { openModal } = useModal()
  const toast = useToast()
  const dayjs = useDayjs()
  const view = useCookie<'table' | 'grid'>('ss_inventory_view', { default: () => 'table' })

  // Filtro desde la URL (?status=ready,damaged), usado por los accesos del dashboard
  const route = useRoute()
  if (typeof route.query.status === 'string') {
    statusFilter.value = route.query.status
      .split(',')
      .filter((s): s is ItemStatus => ITEM_STATUS_LIST.includes(s as ItemStatus))
    page.value = 1
  }

  const { error } = await useAsyncData('inventory-items', async () => {
    await itemsStore.fetchItems()
    return true
  })
  if (error.value) toast.error(error.value)

  async function reload() {
    try {
      await itemsStore.fetchItems()
    } catch (e) {
      toast.error(e)
    }
  }

  watch([search, statusFilter], () => {
    if (page.value !== 1) page.value = 1
    else reload()
  })
  watch(page, reload)

  const columns: TableColumn<IItem>[] = [
    { key: 'cover', label: '', width: '64px' },
    { key: 'code', label: 'Código', width: '120px' },
    { key: 'name', label: 'Artículo' },
    { key: 'category', label: 'Categoría', width: '140px' },
    { key: 'location', label: 'Ubicación', width: '170px' },
    { key: 'status', label: 'Estatus', width: '120px' },
    { key: 'price', label: 'Precio', width: '110px', align: 'right' },
    { key: 'updatedAt', label: 'Actualizado', width: '120px' },
  ]

  const itemTitle = (item: IItem) => item.name || item.productLookup?.description || 'Sin nombre'

  async function handleCreate() {
    const created = await openModal<IItem>(ItemFormModal)
    if (created) reload()
  }

  async function handleEdit(item: IItem) {
    await openModal<IItem>(ItemFormModal, { item })
  }

  async function handleStatus(item: IItem) {
    const updated = await openModal<IItem>(ItemStatusModal, { item })
    if (updated) itemsStore.fetchItems().catch(() => {})
  }

  async function handleDelete(item: IItem) {
    const ok = await openModal(ConfirmModal, {
      title: `Eliminar ${formatItemCode(item.code)}`,
      message: `¿Seguro que deseas eliminar "${itemTitle(item)}"? Esta acción no se puede deshacer desde la web.`,
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!ok) return
    try {
      await itemsStore.deleteItem(item.id)
      toast.success('Artículo eliminado')
      reload()
    } catch (e) {
      toast.error(e)
    }
  }
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-4">
    <PageHeader title="Inventario" :subtitle="`${itemsStore.statusCounts?.total ?? itemsStore.count} artículos en bodega`">
      <template #right>
        <button class="btn" title="Actualizar" :disabled="itemsStore.pending" @click="reload">
          <Icon :name="CAT_ICONS.REFRESH" class="size-4" :class="{ 'animate-spin': itemsStore.pending }" />
        </button>
        <button v-if="permissions.canCreate" class="btn btn-primary" @click="handleCreate">
          <Icon :name="CAT_ICONS.ADD" class="size-4" />
          Nuevo artículo
        </button>
      </template>
    </PageHeader>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Search
        id="inventory"
        v-model="search"
        placeholder="Buscar por nombre, ubicación, SKU, código de barras o BOD-…"
        class="sm:max-w-md"
      />
      <div class="border-border ml-auto flex rounded-xl border bg-white p-0.5">
        <button
          class="view-btn"
          :class="view === 'table' ? 'view-btn-active' : ''"
          title="Vista de tabla"
          @click="view = 'table'"
        >
          <Icon name="lucide:list" class="size-4" />
        </button>
        <button
          class="view-btn"
          :class="view === 'grid' ? 'view-btn-active' : ''"
          title="Vista de galería"
          @click="view = 'grid'"
        >
          <Icon name="lucide:layout-grid" class="size-4" />
        </button>
      </div>
    </div>

    <ItemStatusFilterTabs v-model="statusFilter" :counts="itemsStore.statusCounts" />

    <!-- Tabla -->
    <DataTable
      v-if="view === 'table'"
      class="rounded-t-2xl"
      :columns="columns"
      :rows="itemsStore.items"
      row-key="id"
      :loading="itemsStore.pending"
      empty-message="No hay artículos con estos filtros"
      @row-click="(row) => navigateTo(`/inventory/${row.id}`)"
    >
      <template #cell-cover="{ row }">
        <PhotoThumb :photo="row.cover" :title="itemTitle(row)" class="size-11 rounded-lg" />
      </template>
      <template #cell-code="{ row }">
        <span class="font-mono text-xs text-slate-500">{{ formatItemCode(row.code) }}</span>
      </template>
      <template #cell-name="{ row }">
        <div class="max-w-xs cursor-pointer">
          <p class="truncate font-medium">{{ itemTitle(row) }}</p>
          <p class="text-subtle truncate text-xs">SKU {{ row.productLookup?.sku || '—' }}</p>
        </div>
      </template>
      <template #cell-category="{ row }">{{ row.category?.name ?? '—' }}</template>
      <template #cell-location="{ row }">
        <span class="text-muted block max-w-[170px] truncate">{{ row.location || '—' }}</span>
      </template>
      <template #cell-status="{ row }">
        <ItemStatusBadge :status="row.status" />
      </template>
      <template #cell-price="{ row }">
        <span class="font-medium tabular-nums">{{ formatMoney(row.price) }}</span>
      </template>
      <template #cell-updatedAt="{ row }">
        <span class="text-subtle text-xs" :title="dayjs(row.updatedAt).format('DD/MM/YYYY HH:mm')">
          {{ dayjs(row.updatedAt).fromNow() }}
        </span>
      </template>
      <template #actions="{ row }">
        <button
          v-if="permissions.canEdit && getNextStatuses(row.status).length"
          class="btn-icon"
          title="Cambiar estatus"
          @click="handleStatus(row)"
        >
          <Icon :name="CAT_ICONS.STATUS" class="size-4" />
        </button>
        <button v-if="permissions.canEdit" class="btn-icon" title="Editar" @click="handleEdit(row)">
          <Icon :name="CAT_ICONS.EDIT" class="size-4" />
        </button>
        <button
          v-if="permissions.canDelete"
          class="btn-icon hover:bg-error-bg! hover:text-error!"
          title="Eliminar"
          @click="handleDelete(row)"
        >
          <Icon :name="CAT_ICONS.DELETE" class="size-4" />
        </button>
      </template>
    </DataTable>

    <!-- Galería -->
    <template v-else>
      <div
        v-if="itemsStore.items.length"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        :class="{ 'opacity-60': itemsStore.pending }"
      >
        <ItemCard v-for="item in itemsStore.items" :key="item.id" :item="item" />
      </div>
      <div v-else-if="itemsStore.pending" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div v-for="n in 10" :key="n" class="card aspect-[3/4] animate-pulse bg-slate-100" />
      </div>
      <Empty v-else :icon="CAT_ICONS.INVENTORY" message="No hay artículos con estos filtros" class="card" />
    </template>

    <Pagination
      v-model="page"
      :total="itemsStore.count"
      :page-size="ITEMS_PAGE_SIZE"
      :total-pages="itemsStore.totalPages"
    />
  </div>
</template>

<style scoped>
  @reference '~/assets/css/main.css';

  .view-btn {
    @apply text-subtle flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors;
  }
  .view-btn-active {
    @apply bg-primary text-white;
  }
</style>

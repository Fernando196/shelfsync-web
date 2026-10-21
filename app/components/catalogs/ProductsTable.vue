<script setup lang="ts">
  import DataTable from '../ui/DataTable.vue'
  import TableToolbar from '../ui/TableToolbar.vue'
  import Search from '../common/Search.vue'
  import DropdownLabel from '../common/Dropdown/DropdownLabel.vue'
  import ConfirmModal from '../common/Modal/ConfirmModal.vue'
  import ProductFormModal from './ProductFormModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { CatalogService } from '~/services/catalogs'
  import type { IProductLookup } from '~/types/product.type'
  import type { TableColumn } from '~/types/table.type'

  const PAGE_SIZE = 25

  const service = CatalogService()
  const permissions = usePermissions('/catalogs')
  const { openModal } = useModal()
  const toast = useToast()

  const search = ref('')
  const searchField = ref<'sku' | 'description' | 'barcode'>('sku')
  const page = ref(1)
  const rows = ref<IProductLookup[]>([])
  const loading = ref(false)
  // El API de catálogos no regresa total: hay más páginas si llegó una página completa
  const hasNext = computed(() => rows.value.length === PAGE_SIZE)

  const fieldOptions = [
    { id: 'sku', label: 'SKU' },
    { id: 'description', label: 'Descripción' },
    { id: 'barcode', label: 'Código de barras' },
  ]

  const columns: TableColumn<IProductLookup>[] = [
    { key: 'sku', label: 'SKU', width: '160px' },
    { key: 'barcode', label: 'Código de barras', width: '180px' },
    { key: 'description', label: 'Descripción' },
    { key: 'needAssembly', label: 'Armado', width: '120px' },
  ]

  async function load() {
    loading.value = true
    try {
      rows.value = await service.getProducts({
        filters: search.value ? { [searchField.value]: { like: search.value } } : undefined,
        page: page.value,
        limit: PAGE_SIZE,
      })
    } catch (e) {
      toast.error(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
  watch([search, searchField], () => (page.value === 1 ? load() : (page.value = 1)))
  watch(page, load)

  /** Se expone para que la página recargue tras crear desde el botón principal */
  defineExpose({ reload: load })

  async function handleEdit(product: IProductLookup) {
    const saved = await openModal<IProductLookup>(ProductFormModal, { product })
    if (saved) rows.value = rows.value.map((p) => (p.id === saved.id ? { ...p, ...saved } : p))
  }

  async function handleDelete(product: IProductLookup) {
    const ok = await openModal(ConfirmModal, {
      title: 'Eliminar producto',
      message: `¿Eliminar "${product.description || product.sku || product.barcode}"? Si tiene artículos asociados el API lo rechazará.`,
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!ok) return
    try {
      await service.deleteProduct(product.id)
      rows.value = rows.value.filter((p) => p.id !== product.id)
      toast.success('Producto eliminado')
    } catch (e) {
      toast.error(e)
    }
  }
</script>

<template>
  <div>
    <TableToolbar>
      <template #left>
        <div class="flex w-full flex-col gap-2 sm:max-w-lg sm:flex-row sm:items-end">
          <DropdownLabel id="product-search-field" v-model="searchField" :options="fieldOptions" class="sm:w-44 [&>button]:mt-0" />
          <Search id="products" v-model="search" placeholder="Buscar producto" />
        </div>
      </template>
    </TableToolbar>
    <DataTable
      :columns="columns"
      :rows="rows"
      row-key="id"
      :loading="loading"
      :show-actions="permissions.canEdit || permissions.canDelete"
      empty-message="No hay productos"
    >
      <template #cell-sku="{ row }">
        <span class="font-mono text-[13px]">{{ row.sku || '—' }}</span>
      </template>
      <template #cell-barcode="{ row }">
        <span class="font-mono text-[13px] text-slate-500">{{ row.barcode || '—' }}</span>
      </template>
      <template #cell-description="{ row }">
        <span class="line-clamp-2">{{ row.description || '—' }}</span>
      </template>
      <template #cell-needAssembly="{ row }">
        <span class="badge" :class="row.needAssembly ? 'badge-indigo' : 'badge-neutral'">
          {{ row.needAssembly ? 'Requiere' : 'No' }}
        </span>
      </template>
      <template #actions="{ row }">
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
    <div class="flex items-center justify-end gap-1 py-3">
      <button class="btn btn-sm" :disabled="page <= 1 || loading" @click="page--">
        <Icon :name="CAT_ICONS.CHEVRON_LEFT" class="size-4" />
      </button>
      <span class="text-muted px-2 text-sm">Página {{ page }}</span>
      <button class="btn btn-sm" :disabled="!hasNext || loading" @click="page++">
        <Icon :name="CAT_ICONS.CHEVRON_RIGHT" class="size-4" />
      </button>
    </div>
  </div>
</template>

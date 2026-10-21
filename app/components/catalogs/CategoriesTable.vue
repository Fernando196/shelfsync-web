<script setup lang="ts">
  import DataTable from '../ui/DataTable.vue'
  import TableToolbar from '../ui/TableToolbar.vue'
  import Search from '../common/Search.vue'
  import ConfirmModal from '../common/Modal/ConfirmModal.vue'
  import CategoryFormModal from './CategoryFormModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { useCatalogStore } from '~/store/catalog.store'
  import type { ICategory } from '~/types/category.type'
  import type { TableColumn } from '~/types/table.type'

  const catalogStore = useCatalogStore()
  const permissions = usePermissions('/catalogs')
  const { openModal } = useModal()
  const toast = useToast()

  const search = ref('')
  const loading = ref(false)

  const rows = computed(() => {
    const term = search.value.toLowerCase()
    return catalogStore.categories.filter((c) => c.name.toLowerCase().includes(term))
  })

  const columns: TableColumn<ICategory>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'active', label: 'Estado', width: '140px' },
  ]

  onMounted(async () => {
    loading.value = true
    try {
      await catalogStore.fetchCategories({ force: true })
    } catch (e) {
      toast.error(e)
    } finally {
      loading.value = false
    }
  })

  async function toggleActive(category: ICategory) {
    try {
      await catalogStore.updateCategory(category.id, { active: !category.active })
    } catch (e) {
      toast.error(e)
    }
  }

  async function handleEdit(category: ICategory) {
    await openModal(CategoryFormModal, { category })
  }

  async function handleDelete(category: ICategory) {
    const ok = await openModal(ConfirmModal, {
      title: `Eliminar "${category.name}"`,
      message: 'Si hay artículos con esta categoría, considera solo desactivarla.',
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!ok) return
    try {
      await catalogStore.deleteCategory(category.id)
      toast.success('Categoría eliminada')
    } catch (e) {
      toast.error(e)
    }
  }
</script>

<template>
  <div>
    <TableToolbar>
      <template #left>
        <Search id="categories" v-model="search" placeholder="Buscar categoría" :debounce="0" class="sm:max-w-xs" />
      </template>
      <template #actions>
        <span class="text-subtle text-sm">{{ rows.length }} categorías</span>
      </template>
    </TableToolbar>
    <DataTable
      :columns="columns"
      :rows="rows"
      row-key="id"
      :loading="loading"
      :show-actions="permissions.canEdit || permissions.canDelete"
      empty-message="No hay categorías"
    >
      <template #cell-name="{ row }">
        <span class="font-medium">{{ row.name }}</span>
      </template>
      <template #cell-active="{ row }">
        <button
          class="badge cursor-pointer"
          :class="row.active ? 'badge-emerald' : 'badge-neutral'"
          :disabled="!permissions.canEdit"
          :title="permissions.canEdit ? 'Clic para cambiar' : undefined"
          @click="permissions.canEdit && toggleActive(row)"
        >
          {{ row.active ? 'Activa' : 'Inactiva' }}
        </button>
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
  </div>
</template>

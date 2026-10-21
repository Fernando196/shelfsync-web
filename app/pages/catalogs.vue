<script setup lang="ts">
  import CategoriesTable from '~/components/catalogs/CategoriesTable.vue'
  import CategoryFormModal from '~/components/catalogs/CategoryFormModal.vue'
  import ProductsTable from '~/components/catalogs/ProductsTable.vue'
  import ProductFormModal from '~/components/catalogs/ProductFormModal.vue'
  import PageHeader from '~/components/ui/PageHeader.vue'
  import { CAT_ICONS } from '~/const/icons.const'

  useHead({ title: 'Catálogos · ShelfSync' })

  const tabs = [
    { id: 'categories', label: 'Categorías', createLabel: 'Nueva categoría', icon: CAT_ICONS.CATEGORY, modal: CategoryFormModal },
    { id: 'products', label: 'Productos', createLabel: 'Nuevo producto', icon: CAT_ICONS.PRODUCT, modal: ProductFormModal },
  ] as const

  const route = useRoute()
  const router = useRouter()
  const selectedTab = computed({
    get: () => (tabs.some((t) => t.id === route.query.tab) ? route.query.tab : 'categories') as string,
    set: (tab) => router.replace({ query: { tab } }),
  })
  const activeTab = computed(() => tabs.find((t) => t.id === selectedTab.value)!)

  const permissions = usePermissions('/catalogs')
  const { openModal } = useModal()
  const productsTable = ref<InstanceType<typeof ProductsTable> | null>(null)

  async function handleCreate() {
    const result = await openModal(activeTab.value.modal)
    if (result && selectedTab.value === 'products') productsTable.value?.reload()
  }
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <PageHeader title="Catálogos" subtitle="Datos maestros del inventario">
      <template #right>
        <button v-if="permissions.canCreate" class="btn btn-primary" @click="handleCreate">
          <Icon :name="CAT_ICONS.ADD" class="size-4" />
          {{ activeTab.createLabel }}
        </button>
      </template>
    </PageHeader>

    <div class="border-border flex gap-1 border-b">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="text-subtle hover:text-text -mb-px flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-4 pb-2.5 text-sm font-medium transition-colors"
        :class="selectedTab === tab.id ? 'border-b-accent! text-text' : ''"
        @click="selectedTab = tab.id"
      >
        <Icon :name="tab.icon" class="size-4" />
        {{ tab.label }}
      </button>
    </div>

    <CategoriesTable v-if="selectedTab === 'categories'" />
    <ProductsTable v-else ref="productsTable" />
  </div>
</template>

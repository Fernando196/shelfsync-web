<script setup lang="ts">
  import PageHeader from '~/components/ui/PageHeader.vue'
  import ConfirmModal from '~/components/common/Modal/ConfirmModal.vue'
  import ItemFormModal from '~/components/inventory/ItemFormModal.vue'
  import ItemHistory from '~/components/inventory/ItemHistory.vue'
  import ItemPhotoGallery from '~/components/inventory/ItemPhotoGallery.vue'
  import ItemStatusBadge from '~/components/inventory/ItemStatusBadge.vue'
  import ItemStatusModal from '~/components/inventory/ItemStatusModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { ITEM_CONDITION_CATALOG, formatItemCode, getNextStatuses } from '~/const/items.const'
  import { ItemService } from '~/services/items'
  import { useItemsStore } from '~/store/items.store'
  import type { IItem } from '~/types/item.type'

  const route = useRoute()
  const id = route.params.id as string
  const service = ItemService()
  const itemsStore = useItemsStore()
  const permissions = usePermissions('/inventory')
  const { openModal } = useModal()
  const toast = useToast()
  const dayjs = useDayjs()

  const { data: item, error } = await useAsyncData(`item-${id}`, () => service.getItem(id))
  if (error.value || !item.value) {
    throw createError({ statusCode: 404, statusMessage: 'Artículo no encontrado', fatal: true })
  }

  const {
    data: history,
    pending: historyPending,
    refresh: refreshHistory,
  } = await useAsyncData(`item-${id}-history`, () => service.getHistory(id).then((r) => r.data), {
    server: false,
    default: () => [],
  })

  const title = computed(
    () => item.value?.name || item.value?.productLookup?.description || 'Sin nombre'
  )
  const margin = computed(() => {
    const { price, cost } = item.value ?? {}
    if (price == null || cost == null) return null
    return price - cost
  })
  const mapsUrl = computed(() =>
    item.value?.latitude != null && item.value?.longitude != null
      ? `https://www.google.com/maps?q=${item.value.latitude},${item.value.longitude}`
      : null
  )

  useHead({ title: () => `${formatItemCode(item.value?.code)} · ShelfSync` })

  function onUpdated(updated: IItem) {
    item.value = updated
    itemsStore.replaceItem(updated)
  }

  async function handleEdit() {
    const updated = await openModal<IItem>(ItemFormModal, { item: item.value })
    if (updated) onUpdated(updated)
  }

  async function handleStatus() {
    const updated = await openModal<IItem>(ItemStatusModal, { item: item.value })
    if (!updated) return
    onUpdated(updated)
    refreshHistory()
  }

  async function handleDelete() {
    const ok = await openModal(ConfirmModal, {
      title: `Eliminar ${formatItemCode(item.value!.code)}`,
      message: `¿Seguro que deseas eliminar "${title.value}"?`,
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!ok) return
    try {
      await itemsStore.deleteItem(id)
      toast.success('Artículo eliminado')
      await navigateTo('/inventory')
    } catch (e) {
      toast.error(e)
    }
  }
</script>

<template>
  <div v-if="item" class="mx-auto flex max-w-6xl flex-col gap-5">
    <PageHeader :title="title" :subtitle="formatItemCode(item.code)">
      <template #before-title>
        <NuxtLink to="/inventory" class="text-subtle hover:text-text mb-1 flex w-max items-center gap-1 text-[13px]">
          <Icon :name="CAT_ICONS.ARROW_LEFT" class="size-4" /> Inventario
        </NuxtLink>
      </template>
      <template #right>
        <button
          v-if="permissions.canEdit && getNextStatuses(item.status).length"
          class="btn btn-dark"
          @click="handleStatus"
        >
          <Icon :name="CAT_ICONS.STATUS" class="size-4" /> Cambiar estatus
        </button>
        <button v-if="permissions.canEdit" class="btn" @click="handleEdit">
          <Icon :name="CAT_ICONS.EDIT" class="size-4" /> Editar
        </button>
        <button v-if="permissions.canDelete" class="btn text-error-text!" @click="handleDelete">
          <Icon :name="CAT_ICONS.DELETE" class="size-4" />
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
      <ItemPhotoGallery :item="item" :title="title" :can-edit="permissions.canEdit" @updated="onUpdated" />

      <div class="flex flex-col gap-5">
        <!-- Resumen -->
        <section class="card p-5">
          <div class="flex items-center justify-between gap-3">
            <ItemStatusBadge :status="item.status" />
            <span class="text-subtle text-xs">{{ ITEM_CONDITION_CATALOG[item.condition] }}</span>
          </div>
          <div class="mt-4 grid grid-cols-3 gap-3">
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-subtle text-[11px] font-medium uppercase">Precio</p>
              <p class="mt-0.5 text-lg font-semibold tabular-nums">{{ formatMoney(item.price) }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-subtle text-[11px] font-medium uppercase">Costo</p>
              <p class="mt-0.5 text-lg font-semibold tabular-nums">{{ formatMoney(item.cost) }}</p>
            </div>
            <div class="rounded-xl p-3" :class="margin != null && margin < 0 ? 'bg-error-bg' : 'bg-accent-light'">
              <p class="text-subtle text-[11px] font-medium uppercase">Utilidad</p>
              <p
                class="mt-0.5 text-lg font-semibold tabular-nums"
                :class="margin != null && margin < 0 ? 'text-error-text' : 'text-accent-dark'"
              >
                {{ formatMoney(margin) }}
              </p>
            </div>
          </div>
        </section>

        <!-- Detalles -->
        <section class="card p-5">
          <h2 class="mb-3 text-sm font-semibold">Detalles</h2>
          <dl class="detail-list">
            <dt>Producto</dt>
            <dd>{{ item.productLookup?.description || '—' }}</dd>
            <dt>SKU</dt>
            <dd class="font-mono text-[13px]">{{ item.productLookup?.sku || '—' }}</dd>
            <dt>Código de barras</dt>
            <dd class="font-mono text-[13px]">{{ item.productLookup?.barcode || '—' }}</dd>
            <dt>Categoría</dt>
            <dd>{{ item.category?.name || '—' }}</dd>
            <dt>Cantidad</dt>
            <dd>{{ item.qty }}</dd>
            <dt>Ubicación</dt>
            <dd class="flex items-center gap-2">
              {{ item.location || '—' }}
              <a v-if="mapsUrl" :href="mapsUrl" target="_blank" rel="noopener" class="text-accent-dark inline-flex items-center gap-0.5 text-xs hover:underline">
                <Icon :name="CAT_ICONS.LOCATION" class="size-3.5" /> Mapa
              </a>
            </dd>
            <template v-if="item.notes">
              <dt>Notas</dt>
              <dd class="whitespace-pre-line">{{ item.notes }}</dd>
            </template>
            <dt>Creado</dt>
            <dd>{{ dayjs(item.createdAt).format('DD/MM/YYYY HH:mm') }} · {{ item.createdBy?.fullName ?? '—' }}</dd>
            <dt>Actualizado</dt>
            <dd>{{ dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') }} · {{ item.updatedBy?.fullName ?? '—' }}</dd>
          </dl>
        </section>

        <!-- Historial -->
        <section class="card p-5">
          <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Icon :name="CAT_ICONS.HISTORY" class="text-subtle size-4" /> Historial de estatus
          </h2>
          <ItemHistory :history="history" :loading="historyPending" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @reference '~/assets/css/main.css';

  .detail-list {
    @apply grid grid-cols-[minmax(110px,auto)_1fr] gap-x-4 gap-y-2.5 text-sm;
  }
  .detail-list dt {
    @apply text-subtle;
  }
  .detail-list dd {
    @apply min-w-0 break-words;
  }
</style>

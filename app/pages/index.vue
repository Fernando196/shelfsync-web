<script setup lang="ts">
  import KpiCard from '~/components/dashboard/KpiCard.vue'
  import StatusDonutChart from '~/components/dashboard/StatusDonutChart.vue'
  import StatusPipeline from '~/components/dashboard/StatusPipeline.vue'
  import PhotoThumb from '~/components/common/PhotoThumb.vue'
  import ItemCard from '~/components/inventory/ItemCard.vue'
  import ItemStatusBadge from '~/components/inventory/ItemStatusBadge.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { formatItemCode } from '~/const/items.const'
  import { ItemService } from '~/services/items'
  import { useAuthStore } from '~/store/auth.store'
  import type { IItem } from '~/types/item.type'

  useHead({ title: 'Dashboard · ShelfSync' })

  const auth = useAuthStore()
  const service = ItemService()
  const dayjs = useDayjs()

  const { data, pending, refresh, error } = await useAsyncData('dashboard', async () => {
    const [counts, recent, ready] = await Promise.all([
      service.getStatusCounts(),
      service.getItems({ limit: 6 }),
      service.getItems({ status: ['ready'], limit: 10 }),
    ])
    return { counts, recent: recent.data, ready: ready.data }
  })

  const counts = computed(() => data.value?.counts ?? null)
  const c = (key: keyof NonNullable<typeof counts.value>['counts']) => counts.value?.counts?.[key] ?? 0
  const inProcess = computed(() => c('pending_assembly') + c('assembling') + c('paused'))
  const readyValue = computed(() =>
    (data.value?.ready ?? []).reduce((sum, item) => sum + (item.price ?? 0), 0)
  )

  const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })
  const firstName = computed(() => auth.user?.fullName?.split(' ')[0] ?? '')
  const today = dayjs().format('dddd D [de] MMMM, YYYY')

  const itemTitle = (item: IItem) => item.name || item.productLookup?.description || 'Sin nombre'
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-5">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-subtle text-xs font-medium">{{ greeting }}{{ firstName ? `, ${firstName}` : '' }}</p>
        <h1 class="mt-0.5 text-xl font-semibold tracking-tight">Dashboard</h1>
        <p class="text-subtle text-sm first-letter:uppercase">{{ today }}</p>
      </div>
      <button class="btn" :disabled="pending" @click="refresh()">
        <Icon :name="CAT_ICONS.REFRESH" class="size-4" :class="{ 'animate-spin': pending }" />
        Actualizar
      </button>
    </div>

    <div
      v-if="error"
      class="bg-error-bg text-error-text flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
      role="alert"
    >
      <Icon :name="CAT_ICONS.ALERT" class="size-5 shrink-0" />
      <p class="flex-1">No se pudo cargar el resumen: {{ getErrorMessage(error) }}</p>
      <button class="btn btn-sm" @click="refresh()">Reintentar</button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        title="Total en bodega"
        :value="counts?.total ?? '—'"
        subtitle="artículos registrados"
        :icon="CAT_ICONS.INVENTORY"
        to="/inventory"
      />
      <KpiCard
        title="Listos para venta"
        :value="c('ready')"
        subtitle="armados y disponibles"
        :icon="CAT_ICONS.CHECK"
        accent="accent"
        to="/inventory?status=ready"
      />
      <KpiCard
        title="En proceso"
        :value="inProcess"
        :subtitle="`${c('assembling')} armando · ${c('paused')} en pausa`"
        :icon="CAT_ICONS.TOOL"
        accent="indigo"
        to="/inventory?status=pending_assembly,assembling,paused"
      />
      <KpiCard
        title="Dañados"
        :value="c('damaged')"
        :subtitle="`${c('sold')} vendidos en total`"
        :icon="CAT_ICONS.ALERT"
        accent="rose"
        to="/inventory?status=damaged"
      />
    </div>

    <!-- Gráficas -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
      <ClientOnly>
        <StatusDonutChart :counts="counts" />
        <template #fallback>
          <div class="card h-[340px] animate-pulse bg-slate-50" />
        </template>
      </ClientOnly>
      <StatusPipeline :counts="counts" />
    </div>

    <!-- Listos para venta -->
    <section>
      <div class="mb-3 flex items-end justify-between">
        <div>
          <h2 class="text-sm font-semibold">Listos para venta</h2>
          <p class="text-faint text-xs">
            Últimos {{ data?.ready.length ?? 0 }} · valor {{ formatMoney(readyValue) }}
          </p>
        </div>
        <NuxtLink to="/inventory?status=ready" class="text-accent-dark text-xs font-medium hover:underline">
          Ver todos →
        </NuxtLink>
      </div>
      <div v-if="data?.ready.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ItemCard v-for="item in data.ready" :key="item.id" :item="item" />
      </div>
      <p v-else class="card text-faint py-8 text-center text-sm">No hay artículos listos por ahora</p>
    </section>

    <!-- Actividad reciente -->
    <section class="card">
      <div class="border-border flex items-center justify-between border-b px-5 py-4">
        <div>
          <p class="text-sm font-semibold">Últimos registros</p>
          <p class="text-faint text-xs">Los artículos más recientes en bodega</p>
        </div>
        <NuxtLink to="/inventory" class="text-accent-dark text-xs font-medium hover:underline">
          Ver inventario →
        </NuxtLink>
      </div>
      <div class="divide-y divide-slate-100">
        <NuxtLink
          v-for="item in data?.recent ?? []"
          :key="item.id"
          :to="`/inventory/${item.id}`"
          class="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-slate-50"
        >
          <PhotoThumb :photo="item.cover" :title="itemTitle(item)" :zoomable="false" class="size-11 shrink-0 rounded-lg" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ itemTitle(item) }}</p>
            <p class="text-faint text-xs">
              <span class="font-mono">{{ formatItemCode(item.code) }}</span> ·
              {{ dayjs(item.createdAt).fromNow() }} · {{ item.createdBy?.fullName ?? '—' }}
            </p>
          </div>
          <ItemStatusBadge :status="item.status" />
          <p class="hidden w-24 shrink-0 text-right text-sm font-semibold tabular-nums sm:block">
            {{ formatMoney(item.price) }}
          </p>
        </NuxtLink>
        <p v-if="!data?.recent.length" class="text-faint px-5 py-8 text-center text-sm">
          No hay artículos registrados
        </p>
      </div>
    </section>
  </div>
</template>

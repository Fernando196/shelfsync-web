<script setup lang="ts">
  import { ITEM_STATUS_CATALOG } from '~/const/items.const'
  import type { IStatusCounts, ItemStatus } from '~/types/item.type'

  const props = defineProps<{ counts: IStatusCounts | null }>()

  // Flujo de bodega: recibido → por armar → armando → listo → vendido
  const FLOW: ItemStatus[] = ['received', 'pending_assembly', 'assembling', 'ready', 'sold']

  const max = computed(() => Math.max(1, ...FLOW.map((s) => props.counts?.counts?.[s] ?? 0)))
  const steps = computed(() =>
    FLOW.map((status) => {
      const count = props.counts?.counts?.[status] ?? 0
      return { status, count, pct: (count / max.value) * 100, ...ITEM_STATUS_CATALOG[status] }
    })
  )
</script>

<template>
  <div class="card p-5">
    <p class="text-sm font-semibold">Flujo de bodega</p>
    <p class="text-faint mb-5 text-xs">Artículos en cada etapa</p>
    <div class="flex flex-col gap-3.5">
      <NuxtLink
        v-for="step in steps"
        :key="step.status"
        :to="{ path: '/inventory', query: { status: step.status } }"
        class="group grid grid-cols-[110px_1fr_48px] items-center gap-3"
      >
        <span class="text-muted flex items-center gap-2 text-[13px] group-hover:text-text">
          <Icon :name="step.icon" class="size-4" :style="{ color: step.color }" />
          {{ step.label }}
        </span>
        <span class="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <span
            class="block h-full rounded-full transition-all duration-500"
            :style="{ width: step.pct + '%', backgroundColor: step.color }"
          />
        </span>
        <span class="text-right text-sm font-semibold tabular-nums">{{ step.count }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

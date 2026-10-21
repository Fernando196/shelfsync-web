<script setup lang="ts">
  import { Doughnut } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
  import { ITEM_STATUS_CATALOG, ITEM_STATUS_LIST } from '~/const/items.const'
  import type { IStatusCounts } from '~/types/item.type'

  ChartJS.register(ArcElement, Tooltip)

  const props = defineProps<{ counts: IStatusCounts | null }>()

  const legendItems = computed(() =>
    ITEM_STATUS_LIST.map((status) => ({
      status,
      label: ITEM_STATUS_CATALOG[status].label,
      color: ITEM_STATUS_CATALOG[status].color,
      count: props.counts?.counts?.[status] ?? 0,
    }))
  )
  const total = computed(() => props.counts?.total ?? 0)

  const chartData = computed(() => ({
    labels: legendItems.value.map((i) => i.label),
    datasets: [
      {
        data: legendItems.value.map((i) => i.count),
        backgroundColor: legendItems.value.map((i) => i.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      },
    ],
  }))

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) => `  ${ctx.label}: ${ctx.parsed}`,
        },
      },
    },
  }
</script>

<template>
  <div class="card flex flex-col p-5">
    <div class="mb-4">
      <p class="text-sm font-semibold">Distribución por estatus</p>
      <p class="text-faint text-xs">{{ total }} artículos en total</p>
    </div>

    <div class="relative" style="height: 180px">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl font-bold tabular-nums">{{ total }}</span>
        <span class="text-faint text-[11px]">artículos</span>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
      <NuxtLink
        v-for="item in legendItems"
        :key="item.status"
        :to="{ path: '/inventory', query: { status: item.status } }"
        class="flex items-center gap-2 rounded-md px-1 hover:bg-slate-50"
      >
        <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" />
        <span class="text-muted min-w-0 truncate text-xs">{{ item.label }}</span>
        <span class="ml-auto text-xs font-semibold tabular-nums">{{ item.count }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ITEM_STATUS_CATALOG, ITEM_STATUS_LIST } from '~/const/items.const'
  import type { IStatusCounts, ItemStatus } from '~/types/item.type'

  defineProps<{ counts: IStatusCounts | null }>()
  const selected = defineModel<ItemStatus[]>({ required: true })

  function toggle(status: ItemStatus) {
    selected.value = selected.value.includes(status)
      ? selected.value.filter((s) => s !== status)
      : [...selected.value, status]
  }
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-1">
    <button
      class="chip"
      :class="!selected.length ? 'chip-active' : ''"
      @click="selected = []"
    >
      Todos
      <span class="chip-count">{{ counts?.total ?? '–' }}</span>
    </button>
    <button
      v-for="status in ITEM_STATUS_LIST"
      :key="status"
      class="chip"
      :class="selected.includes(status) ? 'chip-active' : ''"
      @click="toggle(status)"
    >
      <span class="size-2 rounded-full" :style="{ backgroundColor: ITEM_STATUS_CATALOG[status].color }" />
      {{ ITEM_STATUS_CATALOG[status].label }}
      <span class="chip-count">{{ counts?.counts?.[status] ?? '–' }}</span>
    </button>
  </div>
</template>

<style scoped>
  @reference '~/assets/css/main.css';

  .chip {
    @apply border-border text-muted inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-slate-300;
  }
  .chip-active {
    @apply bg-primary border-primary text-white hover:border-primary;
  }
  .chip-count {
    @apply rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600 tabular-nums;
  }
  .chip-active .chip-count {
    @apply bg-white/20 text-white;
  }
</style>

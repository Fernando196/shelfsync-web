<script setup lang="ts">
  import { ITEM_STATUS_CATALOG } from '~/const/items.const'
  import type { IStatusHistory } from '~/types/item.type'

  defineProps<{ history: IStatusHistory[]; loading?: boolean }>()
  const dayjs = useDayjs()
</script>

<template>
  <div v-if="loading" class="flex flex-col gap-3">
    <div v-for="n in 3" :key="n" class="h-10 animate-pulse rounded-lg bg-slate-100" />
  </div>
  <p v-else-if="!history.length" class="text-faint py-4 text-center text-sm">Sin movimientos registrados</p>
  <ol v-else class="relative ml-2 border-l border-slate-200">
    <li v-for="entry in history" :key="entry.id" class="mb-5 ml-5 last:mb-0">
      <span
        class="absolute -left-[7px] mt-1.5 size-3 rounded-full ring-4 ring-white"
        :style="{ backgroundColor: ITEM_STATUS_CATALOG[entry.toStatus]?.color ?? '#94a3b8' }"
      />
      <p class="text-sm">
        <template v-if="entry.fromStatus">
          <span class="text-subtle">{{ ITEM_STATUS_CATALOG[entry.fromStatus]?.label }}</span>
          <span class="text-faint mx-1">→</span>
        </template>
        <span class="font-medium">{{ ITEM_STATUS_CATALOG[entry.toStatus]?.label ?? entry.toStatus }}</span>
      </p>
      <p v-if="entry.comment" class="text-muted mt-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[13px]">
        “{{ entry.comment }}”
      </p>
      <p class="text-faint mt-1 text-xs" :title="dayjs(entry.changedAt).format('DD/MM/YYYY HH:mm')">
        {{ dayjs(entry.changedAt).fromNow() }} · {{ entry.changedBy?.fullName ?? 'Sistema' }}
      </p>
    </li>
  </ol>
</template>

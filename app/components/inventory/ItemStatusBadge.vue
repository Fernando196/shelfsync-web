<script setup lang="ts">
  import { ITEM_STATUS_CATALOG } from '~/const/items.const'
  import type { ItemStatus } from '~/types/item.type'

  defineProps<{ status: ItemStatus }>()
</script>

<template>
  <span class="badge" :class="ITEM_STATUS_CATALOG[status]?.badge ?? 'badge-neutral'">
    {{ ITEM_STATUS_CATALOG[status]?.label ?? status }}
  </span>
</template>

<script setup lang="ts">
  import PhotoThumb from '~/components/common/PhotoThumb.vue'
  import ItemStatusBadge from './ItemStatusBadge.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { formatItemCode } from '~/const/items.const'
  import type { IItem } from '~/types/item.type'

  const props = defineProps<{ item: IItem }>()

  const title = computed(
    () => props.item.name || props.item.productLookup?.description || 'Sin nombre'
  )
</script>

<template>
  <article class="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
    <PhotoThumb :photo="item.cover" :title="title" size="medium" class="aspect-[4/3] w-full" />
    <NuxtLink :to="`/inventory/${item.id}`" class="flex flex-1 flex-col gap-1.5 p-3">
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono text-[11.5px] text-slate-500">{{ formatItemCode(item.code) }}</span>
        <ItemStatusBadge :status="item.status" />
      </div>
      <p class="line-clamp-2 text-sm leading-snug font-medium">{{ title }}</p>
      <div class="text-subtle mt-auto flex items-center justify-between gap-2 pt-1 text-xs">
        <span class="flex min-w-0 items-center gap-1 truncate">
          <Icon :name="CAT_ICONS.LOCATION" class="size-3.5 shrink-0" />
          {{ item.location || 'Sin ubicación' }}
        </span>
        <span v-if="item.price != null" class="text-text shrink-0 font-semibold">
          {{ formatMoney(item.price) }}
        </span>
      </div>
    </NuxtLink>
  </article>
</template>

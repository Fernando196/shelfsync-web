<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'

  interface Props {
    total: number
    pageSize: number
    totalPages: number
  }
  const props = defineProps<Props>()
  const page = defineModel<number>({ required: true })

  const from = computed(() => (props.total ? (page.value - 1) * props.pageSize + 1 : 0))
  const to = computed(() => Math.min(page.value * props.pageSize, props.total))
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-1 py-3 text-sm">
    <span class="text-subtle">{{ from }}–{{ to }} de {{ total }}</span>
    <div class="flex items-center gap-1">
      <button class="btn btn-sm" :disabled="page <= 1" aria-label="Anterior" @click="page--">
        <Icon :name="CAT_ICONS.CHEVRON_LEFT" class="size-4" />
      </button>
      <span class="text-muted px-2">{{ page }} / {{ totalPages }}</span>
      <button class="btn btn-sm" :disabled="page >= totalPages" aria-label="Siguiente" @click="page++">
        <Icon :name="CAT_ICONS.CHEVRON_RIGHT" class="size-4" />
      </button>
    </div>
  </div>
</template>

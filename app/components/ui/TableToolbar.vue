<script setup lang="ts">
  interface Props {
    title?: string
    subtitle?: string
  }
  defineProps<Props>()
</script>

<template>
  <div
    class="border-border flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-b-0 bg-white px-4 py-3"
  >
    <div v-if="title" class="flex flex-col">
      <h2 class="text-base font-semibold">{{ title }}</h2>
      <p v-if="subtitle" class="text-subtle text-sm">{{ subtitle }}</p>
    </div>
    <slot name="left" />
    <div class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

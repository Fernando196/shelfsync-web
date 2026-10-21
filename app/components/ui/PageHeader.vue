<script lang="ts" setup>
  interface Props {
    title: string
    subtitle?: string
  }

  defineProps<Props>()
</script>
<template>
  <div class="page-header">
    <div class="page-header-content">
      <div class="page-header-content-titles">
        <slot name="before-title" />
        <h1 class="page-title">{{ title }}</h1>
        <span v-if="subtitle" class="page-subtitle">{{ subtitle }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="right" />
      </div>
    </div>
    <slot name="bottom" />
  </div>
</template>
<style lang="css" scoped>
  @reference '~/assets/css/main.css';

  .page-header {
    @apply flex flex-col gap-4;
  }
  .page-header-content {
    @apply flex flex-wrap items-center justify-between gap-3;
  }
  .page-header-content-titles {
    @apply flex min-w-0 flex-col;
  }
  .page-title {
    @apply text-xl font-semibold;
    letter-spacing: -0.02em;
  }
  .page-subtitle {
    @apply text-muted m-0 text-[13.5px];
  }
</style>

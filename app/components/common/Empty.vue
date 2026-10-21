<script setup lang="ts">
  interface Props {
    message: string
    icon?: string
    iconClass?: string
  }

  defineProps<Props>()
</script>
<template>
  <div class="text-faint flex h-full w-full flex-col items-center justify-center gap-2 py-10">
    <Icon v-if="icon" :name="icon" :class="iconClass || 'size-10'" />
    <p class="text-sm">{{ message }}</p>
    <slot />
  </div>
</template>

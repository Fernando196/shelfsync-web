<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'

  interface Props {
    title: string
    subtitle?: string
    width?: string
  }

  defineProps<Props>()
  defineEmits(['close'])
</script>
<template>
  <div
    class="relative flex max-h-[90dvh] w-full flex-col rounded-2xl bg-white shadow-lg"
    :class="width ?? 'max-w-lg'"
  >
    <header class="flex shrink-0 items-start justify-between gap-4 p-5">
      <div>
        <h2 class="text-base font-semibold">{{ title }}</h2>
        <p v-if="subtitle" class="text-subtle text-[13px]">{{ subtitle }}</p>
      </div>
      <button class="btn-icon -mt-1 -mr-1" aria-label="Cerrar" @click="$emit('close')">
        <Icon :name="CAT_ICONS.CLOSE" class="size-4" />
      </button>
    </header>
    <main class="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
      <slot />
    </main>
    <footer
      v-if="$slots.footer"
      class="border-border flex w-full shrink-0 justify-end gap-2 rounded-b-2xl border-t bg-slate-50 px-5 py-3.5"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

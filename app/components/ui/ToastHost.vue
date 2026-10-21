<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'
  import type { ToastType } from '~/composables/useToast'

  const { toasts, remove } = useToast()

  const STYLES: Record<ToastType, { icon: string; class: string }> = {
    success: { icon: CAT_ICONS.CHECK, class: 'text-accent' },
    error: { icon: CAT_ICONS.ALERT, class: 'text-error' },
    info: { icon: 'lucide:info', class: 'text-primary' },
  }
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="border-border pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg"
          role="status"
        >
          <Icon :name="STYLES[toast.type].icon" class="mt-0.5 size-5 shrink-0" :class="STYLES[toast.type].class" />
          <p class="flex-1 text-sm">{{ toast.message }}</p>
          <button class="text-faint hover:text-text cursor-pointer" @click="remove(toast.id)">
            <Icon :name="CAT_ICONS.CLOSE" class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.2s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
</style>

<script setup lang="ts">
  interface Props {
    title: string
    value: string | number
    subtitle?: string
    icon: string
    accent?: 'primary' | 'accent' | 'amber' | 'indigo' | 'rose'
    to?: string
  }

  withDefaults(defineProps<Props>(), { subtitle: undefined, accent: 'primary', to: undefined })

  const accentMap = {
    primary: { bar: 'bg-primary', bg: 'bg-primary-light', icon: 'text-primary' },
    accent: { bar: 'bg-accent', bg: 'bg-accent-light', icon: 'text-accent' },
    amber: { bar: 'bg-amber-500', bg: 'bg-status-amber-bg', icon: 'text-status-amber' },
    indigo: { bar: 'bg-indigo-500', bg: 'bg-status-indigo-bg', icon: 'text-status-indigo' },
    rose: { bar: 'bg-rose-500', bg: 'bg-status-rose-bg', icon: 'text-status-rose' },
  }
</script>

<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : 'div'"
    :to="to"
    class="card group relative block overflow-hidden transition-shadow duration-200 hover:shadow-md"
  >
    <div :class="accentMap[accent].bar" class="absolute inset-y-0 left-0 w-1" />
    <div class="flex items-start justify-between gap-3 py-4 pr-4 pl-5">
      <div class="min-w-0 flex-1">
        <p class="text-subtle truncate text-[11px] font-medium tracking-wider uppercase">{{ title }}</p>
        <p class="mt-1.5 text-2xl leading-tight font-bold tabular-nums">{{ value }}</p>
        <p v-if="subtitle" class="text-faint mt-1 text-xs">{{ subtitle }}</p>
      </div>
      <div
        :class="[accentMap[accent].bg, accentMap[accent].icon]"
        class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
      >
        <Icon :name="icon" class="size-5" />
      </div>
    </div>
  </component>
</template>

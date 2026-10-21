<script setup lang="ts">
  import { useMenuStore } from '~/store/menu.store'

  const menuStore = useMenuStore()
  const closeMenu = inject<() => void>('closeMenu')

  const isActive = (path: string) => menuStore.activeMenuItem?.path === path
</script>
<template>
  <aside
    class="border-border bg-menu-bg flex h-full w-full flex-col gap-1 border-r px-3 pt-5 md:px-2"
  >
    <NuxtLink
      v-for="item in menuStore.menuItems"
      :key="'menu-item-' + item.id"
      :to="item.path"
      class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors md:flex-col md:gap-1.5 md:px-1 md:py-3 md:text-xs"
      :class="
        isActive(item.path)
          ? 'bg-primary text-white shadow-sm'
          : 'text-subtle hover:text-text hover:bg-slate-100'
      "
      @click="closeMenu?.()"
    >
      <Icon :name="item.icon" class="size-5 shrink-0 xl:size-6" />
      <span class="truncate">{{ item.label }}</span>
    </NuxtLink>
  </aside>
</template>

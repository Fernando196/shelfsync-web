<script setup lang="ts">
  import AppHeader from '~/components/layout/AppHeader.vue'
  import AsideMenu from '~/components/layout/AsideMenu.vue'
  import { CAT_ICONS } from '~/const/icons.const'

  const isOpenMenu = ref(false)

  function onResize() {
    if (window.innerWidth >= 768) isOpenMenu.value = false
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))

  provide('closeMenu', () => {
    isOpenMenu.value = false
  })
</script>
<template>
  <div class="relative grid h-dvh grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
    <Transition name="fade">
      <div
        v-if="isOpenMenu"
        class="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
        @click="isOpenMenu = false"
      />
    </Transition>
    <AppHeader class="col-span-2" @toggle-menu="isOpenMenu = !isOpenMenu" />
    <div
      class="fixed top-0 left-0 z-30 h-dvh w-60 transition-transform duration-300 ease-in-out md:relative md:z-0 md:h-full md:w-24 xl:w-28"
      :class="isOpenMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <AsideMenu />
    </div>
    <main
      class="bg-content-bg col-span-2 overflow-x-hidden overflow-y-auto px-4 pt-6 pb-12 md:col-span-1 md:px-8"
    >
      <slot />
    </main>
    <button
      class="fixed right-4 bottom-4 z-10 rounded-full border border-slate-200 bg-white p-3 shadow-lg md:hidden"
      aria-label="Abrir menú"
      @click="isOpenMenu = !isOpenMenu"
    >
      <Icon :name="CAT_ICONS.MENU" class="text-primary size-5" />
    </button>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>

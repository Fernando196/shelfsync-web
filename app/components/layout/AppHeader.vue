<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'
  import { useAuthStore } from '~/store/auth.store'
  import { useMenuStore } from '~/store/menu.store'

  defineEmits(['toggle-menu'])

  const auth = useAuthStore()
  const menuStore = useMenuStore()
  const openUserMenu = ref(false)
  const userMenuRef = ref<HTMLElement | null>(null)

  function handleOutsideClick(e: MouseEvent) {
    if (openUserMenu.value && !userMenuRef.value?.contains(e.target as Node)) {
      openUserMenu.value = false
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
  onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <header
    class="border-border flex h-14 items-center justify-between gap-3 border-b bg-white px-3 md:px-6"
  >
    <div class="flex min-w-0 items-center gap-3">
      <button class="btn-icon md:hidden" aria-label="Menú" @click="$emit('toggle-menu')">
        <Icon :name="CAT_ICONS.MENU" class="size-5" />
      </button>
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="/icon.png" alt="" class="bg-primary size-8 rounded-lg" />
        <span class="text-primary text-base font-semibold tracking-tight">ShelfSync</span>
      </NuxtLink>
      <template v-if="menuStore.activeMenuItem">
        <span class="hidden text-slate-300 md:inline">/</span>
        <span class="text-muted hidden truncate text-sm md:inline">
          {{ menuStore.activeMenuItem.label }}
        </span>
      </template>
    </div>

    <div ref="userMenuRef" class="relative">
      <button
        class="flex cursor-pointer items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-slate-100"
        @click="openUserMenu = !openUserMenu"
      >
        <span
          class="bg-primary flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
        >
          {{ auth.initials }}
        </span>
        <span class="hidden text-left leading-tight sm:block">
          <span class="block text-[13px] font-medium">{{ auth.user?.fullName }}</span>
          <span class="text-subtle block text-[11.5px]">@{{ auth.user?.userName }}</span>
        </span>
        <Icon :name="CAT_ICONS.ARROW_DOWN" class="text-subtle size-4" />
      </button>

      <Transition name="pop">
        <div
          v-if="openUserMenu"
          class="border-border absolute right-0 z-40 mt-2 w-56 rounded-xl border bg-white p-1.5 shadow-lg"
        >
          <div class="border-border mb-1 border-b px-3 py-2">
            <p class="truncate text-sm font-medium">{{ auth.user?.fullName }}</p>
            <p class="text-subtle truncate text-xs">{{ auth.user?.email || auth.user?.userName }}</p>
          </div>
          <button
            class="text-error-text hover:bg-error-bg flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
            @click="auth.logout()"
          >
            <Icon :name="CAT_ICONS.LOGOUT" class="size-4" />
            Cerrar sesión
          </button>
        </div>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
  .pop-enter-active,
  .pop-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }
  .pop-enter-from,
  .pop-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>

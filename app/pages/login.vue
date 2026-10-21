<script setup lang="ts">
  import InputWrapper from '~/components/common/InputWrapper.vue'
  import { useAuthStore } from '~/store/auth.store'

  definePageMeta({ layout: 'blank' })
  useHead({ title: 'Iniciar sesión · ShelfSync' })

  const auth = useAuthStore()
  const route = useRoute()

  const form = reactive({ userName: '', password: '' })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function onSubmit() {
    if (!form.userName.trim() || !form.password) {
      error.value = 'Ingresa usuario y contraseña'
      return
    }
    loading.value = true
    error.value = null
    try {
      await auth.login({ userName: form.userName.trim(), password: form.password })
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      await navigateTo(redirect.startsWith('/') ? redirect : '/')
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode
      error.value = status === 401 ? 'Usuario o contraseña incorrectos' : getErrorMessage(e)
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-2">
    <!-- Panel de marca -->
    <div class="bg-primary relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div class="flex items-center gap-3 text-white">
        <img src="/icon.png" alt="" class="size-10 rounded-xl" />
        <span class="text-xl font-semibold tracking-tight">ShelfSync</span>
      </div>
      <div class="relative z-10 max-w-md text-white">
        <h2 class="text-3xl leading-tight font-semibold tracking-tight">
          Tu inventario de bodega, claro y al día.
        </h2>
        <p class="mt-3 text-slate-300">
          Consulta cada caja, sus fotos y su estatus desde cualquier lugar. Sincronizado con la app
          móvil.
        </p>
      </div>
      <p class="text-xs text-slate-400">© {{ new Date().getFullYear() }} ShelfSync</p>
      <Icon
        name="lucide:boxes"
        class="pointer-events-none absolute -right-16 -bottom-16 size-[420px] text-white/5"
      />
    </div>

    <!-- Formulario -->
    <div class="flex items-center justify-center px-6 py-12">
      <form class="w-full max-w-sm" novalidate @submit.prevent="onSubmit">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <img src="/icon.png" alt="" class="bg-primary size-10 rounded-xl" />
          <span class="text-primary text-xl font-semibold">ShelfSync</span>
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p class="text-subtle mt-1 text-sm">Usa el mismo usuario de la app móvil.</p>

        <div class="mt-8 flex flex-col gap-4">
          <InputWrapper
            id="login-user"
            v-model="form.userName"
            label="Usuario"
            placeholder="tu.usuario"
            autocomplete="username"
          />
          <InputWrapper
            id="login-password"
            v-model="form.password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <p
          v-if="error"
          class="bg-error-bg text-error-text mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
          role="alert"
        >
          <Icon name="lucide:circle-alert" class="size-4 shrink-0" />
          {{ error }}
        </p>

        <button type="submit" class="btn btn-primary mt-6 w-full py-2.5" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="size-4 animate-spin" />
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

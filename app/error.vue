<script setup lang="ts">
  import type { NuxtError } from '#app'

  const props = defineProps<{ error: NuxtError }>()

  const title = computed(() =>
    props.error.statusCode === 404 ? 'No encontramos esta página' : 'Algo salió mal'
  )
</script>

<template>
  <div class="bg-content-bg flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
    <img src="/icon.png" alt="" class="bg-primary size-14 rounded-2xl" />
    <p class="text-faint font-mono text-sm">{{ error.statusCode }}</p>
    <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
    <p class="text-subtle max-w-md text-sm">{{ error.statusMessage || error.message }}</p>
    <button class="btn btn-primary mt-2" @click="clearError({ redirect: '/' })">Volver al inicio</button>
  </div>
</template>

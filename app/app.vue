<script setup lang="ts">
  import ModalHost from './components/ui/ModalHost.vue'
  import ToastHost from './components/ui/ToastHost.vue'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ModalHost />
  <ToastHost />
</template>

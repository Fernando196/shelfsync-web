<script setup lang="ts">
  import CustomModal from './CustomModal.vue'

  interface Props {
    title: string
    message?: string
    cancelText?: string
    confirmText?: string
    danger?: boolean
  }

  defineProps<Props>()
  const { close } = useModal()
</script>
<template>
  <CustomModal :title="title" width="max-w-md" @close="close(false)">
    <p v-if="message" class="text-muted text-sm">{{ message }}</p>
    <template #footer>
      <button class="btn" @click="close(false)">{{ cancelText ?? 'Cancelar' }}</button>
      <button class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" @click="close(true)">
        {{ confirmText ?? 'Confirmar' }}
      </button>
    </template>
  </CustomModal>
</template>

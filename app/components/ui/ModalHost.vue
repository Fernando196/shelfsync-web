<template>
  <Teleport to="body">
    <TransitionGroup name="modal-backdrop">
      <div
        v-for="(modal, index) in modalStack"
        :key="modal.id"
        class="fixed inset-0 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        :style="{ zIndex: 50 + index * 10 }"
      >
        <component :is="modal.component" v-bind="modal.props" class="modal-panel" @close="close" />
      </div>
    </TransitionGroup>
  </Teleport>
</template>
<script setup lang="ts">
  const { modalStack, close } = useModal()

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && modalStack.value.length) close()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
<style scoped lang="css">
  .modal-backdrop-enter-active {
    transition: opacity 0.2s ease;
  }
  .modal-backdrop-leave-active {
    transition: opacity 0.15s ease;
  }
  .modal-backdrop-enter-from,
  .modal-backdrop-leave-to {
    opacity: 0;
  }

  @keyframes modal-slide-up {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .modal-panel {
    animation: modal-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>

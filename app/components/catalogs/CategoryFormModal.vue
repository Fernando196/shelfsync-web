<script setup lang="ts">
  import CustomModal from '../common/Modal/CustomModal.vue'
  import InputWrapper from '../common/InputWrapper.vue'
  import { useCatalogStore } from '~/store/catalog.store'
  import type { ICategory } from '~/types/category.type'

  const props = defineProps<{ category?: ICategory }>()

  const { close } = useModal()
  const toast = useToast()
  const catalogStore = useCatalogStore()

  const form = reactive({ name: props.category?.name ?? '', active: props.category?.active ?? true })
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function onSave() {
    if (!form.name.trim()) {
      error.value = 'El nombre es obligatorio'
      return
    }
    saving.value = true
    try {
      const payload = { name: form.name.trim(), active: form.active }
      const saved = props.category
        ? await catalogStore.updateCategory(props.category.id, payload)
        : await catalogStore.addCategory(payload)
      toast.success(props.category ? 'Categoría actualizada' : 'Categoría creada')
      close(saved)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <CustomModal :title="category ? 'Editar categoría' : 'Nueva categoría'" width="max-w-md" @close="close()">
    <form class="flex flex-col gap-4" @submit.prevent="onSave">
      <InputWrapper id="category-name" v-model="form.name" label="Nombre" required :error="error" />
      <label class="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
        <span class="text-sm">
          Activa
          <span class="text-subtle block text-xs">Las inactivas no aparecen al registrar artículos</span>
        </span>
        <input v-model="form.active" type="checkbox" class="accent-accent size-5" />
      </label>
    </form>
    <template #footer>
      <button class="btn" :disabled="saving" @click="close()">Cancelar</button>
      <button class="btn btn-primary" :disabled="saving" @click="onSave">Guardar</button>
    </template>
  </CustomModal>
</template>

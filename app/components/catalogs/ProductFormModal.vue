<script setup lang="ts">
  import CustomModal from '../common/Modal/CustomModal.vue'
  import InputWrapper from '../common/InputWrapper.vue'
  import { useCatalogStore } from '~/store/catalog.store'
  import type { IProductLookup } from '~/types/product.type'

  const props = defineProps<{ product?: IProductLookup }>()

  const { close } = useModal()
  const toast = useToast()
  const catalogStore = useCatalogStore()

  const form = reactive({
    sku: props.product?.sku ?? '',
    barcode: props.product?.barcode ?? '',
    description: props.product?.description ?? '',
    needAssembly: props.product?.needAssembly ?? false,
  })
  const error = ref<string | null>(null)
  const saving = ref(false)

  async function onSave() {
    error.value = null
    if (!form.sku.trim() && !form.barcode.trim() && !form.description.trim()) {
      error.value = 'Captura al menos SKU, código de barras o descripción'
      return
    }
    saving.value = true
    try {
      const payload = {
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        description: form.description.trim() || null,
        needAssembly: form.needAssembly,
      }
      const saved = props.product
        ? await catalogStore.updateProduct(props.product.id, payload)
        : await catalogStore.addProduct(payload)
      toast.success(props.product ? 'Producto actualizado' : 'Producto creado')
      close(saved)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <CustomModal :title="product ? 'Editar producto' : 'Nuevo producto'" subtitle="Catálogo de productos de manifiesto" @close="close()">
    <form class="flex flex-col gap-4" @submit.prevent="onSave">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputWrapper id="product-sku" v-model="form.sku" label="SKU" />
        <InputWrapper id="product-barcode" v-model="form.barcode" label="Código de barras" />
      </div>
      <InputWrapper id="product-description" v-model="form.description" label="Descripción" is-text-area :rows="2" />
      <label class="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
        <span class="text-sm">Requiere armado</span>
        <input v-model="form.needAssembly" type="checkbox" class="accent-accent size-5" />
      </label>
      <p v-if="error" class="bg-error-bg text-error-text rounded-xl px-3 py-2 text-sm">{{ error }}</p>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <button class="btn" :disabled="saving" @click="close()">Cancelar</button>
      <button class="btn btn-primary" :disabled="saving" @click="onSave">Guardar</button>
    </template>
  </CustomModal>
</template>

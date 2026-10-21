<script setup lang="ts">
  import CustomModal from '../common/Modal/CustomModal.vue'
  import InputWrapper from '../common/InputWrapper.vue'
  import ItemStatusBadge from './ItemStatusBadge.vue'
  import { ITEM_STATUS, ITEM_STATUS_CATALOG, formatItemCode, getNextStatuses } from '~/const/items.const'
  import { useItemsStore } from '~/store/items.store'
  import type { IItem, ItemStatus } from '~/types/item.type'

  const props = defineProps<{ item: IItem }>()

  const { close } = useModal()
  const toast = useToast()
  const itemsStore = useItemsStore()

  const options = computed(() => getNextStatuses(props.item.status))
  const target = ref<ItemStatus | null>(options.value[0] ?? null)
  const comment = ref('')
  const salePrice = ref<number | string | null>(props.item.price)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const needsComment = computed(() => target.value === ITEM_STATUS.DAMAGED)
  const needsPrice = computed(() => target.value === ITEM_STATUS.SOLD)

  async function onSave() {
    if (!target.value) return
    error.value = null
    if (needsComment.value && !comment.value.trim()) {
      error.value = 'Indica el motivo del daño'
      return
    }
    const price = toMoneyValue(salePrice.value)
    if (needsPrice.value && (price === null || price < 0)) {
      error.value = 'Captura el precio de venta'
      return
    }
    saving.value = true
    try {
      // Vendido: el precio de venta se guarda en item.price antes del cambio de estatus
      if (needsPrice.value && price !== props.item.price) {
        await itemsStore.updateItem(props.item.id, { price })
      }
      const updated = await itemsStore.changeStatus(props.item.id, target.value, comment.value.trim())
      toast.success(`Marcado como ${ITEM_STATUS_CATALOG[target.value].label.toLowerCase()}`)
      close(updated)
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <CustomModal
    :title="`Cambiar estatus · ${formatItemCode(item.code)}`"
    width="max-w-md"
    @close="close()"
  >
    <div class="mb-4 flex items-center gap-2 text-sm">
      <span class="text-subtle">Estatus actual:</span>
      <ItemStatusBadge :status="item.status" />
    </div>

    <p v-if="!options.length" class="text-subtle text-sm">Este estatus no tiene transiciones disponibles.</p>
    <div v-else class="flex flex-col gap-2">
      <label
        v-for="status in options"
        :key="status"
        class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors"
        :class="target === status ? 'border-accent bg-accent-light' : 'border-border hover:bg-slate-50'"
      >
        <input v-model="target" type="radio" :value="status" class="accent-accent" />
        <span
          class="flex size-8 items-center justify-center rounded-lg"
          :style="{ backgroundColor: ITEM_STATUS_CATALOG[status].color + '1a', color: ITEM_STATUS_CATALOG[status].color }"
        >
          <Icon :name="ITEM_STATUS_CATALOG[status].icon" class="size-4" />
        </span>
        <span class="text-sm font-medium">{{ ITEM_STATUS_CATALOG[status].label }}</span>
      </label>
    </div>

    <div v-if="needsPrice || needsComment || target" class="mt-4 flex flex-col gap-3">
      <InputWrapper
        v-if="needsPrice"
        id="status-price"
        v-model="salePrice"
        label="Precio de venta"
        type="number"
        min="0"
        step="0.01"
        required
      />
      <InputWrapper
        v-if="target"
        id="status-comment"
        v-model="comment"
        :label="needsComment ? 'Motivo del daño' : 'Comentario (opcional)'"
        :required="needsComment"
        is-text-area
        :rows="2"
      />
    </div>

    <p v-if="error" class="bg-error-bg text-error-text mt-3 rounded-xl px-3 py-2 text-sm">{{ error }}</p>

    <template #footer>
      <button class="btn" :disabled="saving" @click="close()">Cancelar</button>
      <button class="btn btn-primary" :disabled="saving || !target" @click="onSave">
        <Icon v-if="saving" name="lucide:loader-circle" class="size-4 animate-spin" />
        Guardar
      </button>
    </template>
  </CustomModal>
</template>

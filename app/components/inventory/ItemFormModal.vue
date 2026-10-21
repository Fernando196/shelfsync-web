<script setup lang="ts">
  import CustomModal from '../common/Modal/CustomModal.vue'
  import InputWrapper from '../common/InputWrapper.vue'
  import DropdownLabel from '../common/Dropdown/DropdownLabel.vue'
  import ProductPicker, { type INewProduct } from './ProductPicker.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { ITEM_CONDITION_CATALOG, formatItemCode } from '~/const/items.const'
  import { ItemService } from '~/services/items'
  import { useCatalogStore } from '~/store/catalog.store'
  import { useItemsStore } from '~/store/items.store'
  import type { IItem, IItemPayload, ItemCondition } from '~/types/item.type'
  import type { IProductLookup } from '~/types/product.type'

  interface Props {
    item?: IItem
  }
  const props = defineProps<Props>()
  const isEdit = computed(() => !!props.item)

  const { close } = useModal()
  const toast = useToast()
  const itemsStore = useItemsStore()
  const catalogStore = useCatalogStore()
  onMounted(() => catalogStore.fetchCategories().catch(() => []))

  const categoryOptions = computed(() =>
    catalogStore.categories
      .filter((c) => c.active || c.id === props.item?.categoryId)
      .map((c) => ({ id: c.id, label: c.name }))
  )
  const conditionOptions = Object.entries(ITEM_CONDITION_CATALOG).map(([id, label]) => ({ id, label }))

  const form = reactive({
    name: props.item?.name ?? '',
    qty: (props.item?.qty ?? 1) as number | string,
    categoryId: (props.item?.categoryId ?? null) as string | null,
    location: props.item?.location ?? '',
    condition: (props.item?.condition ?? 'new') as ItemCondition,
    cost: (props.item?.cost ?? null) as number | string | null,
    price: (props.item?.price ?? null) as number | string | null,
    notes: props.item?.notes ?? '',
  })
  const product = ref<IProductLookup | null>(null)
  const newProduct = ref<INewProduct | null>(null)
  const photos = ref<{ file: File; preview: string }[]>([])
  const errors = reactive<Record<string, string | null>>({})
  const saving = ref(false)

  function onPickPhotos(e: Event) {
    const input = e.target as HTMLInputElement
    for (const file of Array.from(input.files ?? [])) {
      if (!file.type.startsWith('image/')) continue
      photos.value.push({ file, preview: URL.createObjectURL(file) })
    }
    input.value = ''
  }

  function removePhoto(index: number) {
    const [removed] = photos.value.splice(index, 1)
    if (removed) URL.revokeObjectURL(removed.preview)
  }

  onBeforeUnmount(() => photos.value.forEach((p) => URL.revokeObjectURL(p.preview)))

  function validate() {
    Object.keys(errors).forEach((k) => (errors[k] = null))
    if (!isEdit.value) {
      const np = newProduct.value
      if (!product.value && !np) errors.product = 'Selecciona o crea un producto'
      if (np && !np.sku.trim() && !np.barcode.trim() && !np.description.trim()) {
        errors.product = 'Captura al menos SKU, código de barras o descripción'
      }
    }
    if (!Number.isInteger(Number(form.qty)) || Number(form.qty) < 0) errors.qty = 'Cantidad inválida'
    if ((toMoneyValue(form.cost) ?? 0) < 0) errors.cost = 'Debe ser ≥ 0'
    if ((toMoneyValue(form.price) ?? 0) < 0) errors.price = 'Debe ser ≥ 0'
    return !Object.values(errors).some(Boolean)
  }

  function buildPayload(): IItemPayload {
    const text = (v: string) => (v.trim() ? v.trim() : isEdit.value ? null : undefined)
    const payload: IItemPayload = {
      name: text(form.name),
      qty: Number(form.qty),
      categoryId: form.categoryId ?? (isEdit.value ? null : undefined),
      location: text(form.location),
      condition: form.condition,
      cost: toMoneyValue(form.cost),
      price: toMoneyValue(form.price),
      notes: text(form.notes),
    }
    if (!isEdit.value) {
      if (product.value) payload.productLookupId = product.value.id
      else if (newProduct.value) {
        const np = newProduct.value
        payload.productLookup = {
          sku: np.sku.trim() || null,
          barcode: np.barcode.trim() || null,
          description: np.description.trim() || null,
          needAssembly: np.needAssembly,
        }
      }
    }
    return payload
  }

  async function onSave() {
    if (!validate()) return
    saving.value = true
    try {
      let saved = isEdit.value
        ? await itemsStore.updateItem(props.item!.id, buildPayload())
        : await itemsStore.createItem(buildPayload())

      if (photos.value.length) {
        try {
          const blobs = await Promise.all(photos.value.map((p) => compressImage(p.file)))
          saved = await ItemService().uploadPhotos(saved.id, blobs)
        } catch (e) {
          toast.error(e, 'El artículo se guardó, pero falló la subida de fotos')
        }
      }
      toast.success(isEdit.value ? 'Cambios guardados' : `Artículo ${formatItemCode(saved.code)} creado`)
      close(saved)
    } catch (e) {
      toast.error(e)
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <CustomModal
    :title="isEdit ? 'Editar artículo' : 'Nuevo artículo'"
    :subtitle="isEdit ? formatItemCode(item?.code) : 'Registra una caja o pieza en bodega'"
    width="max-w-2xl"
    @close="close()"
  >
    <form class="flex flex-col gap-4" @submit.prevent="onSave">
      <ProductPicker
        v-if="!isEdit"
        v-model:selected="product"
        v-model:new-product="newProduct"
        :error="errors.product"
      />
      <div v-else class="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
        <Icon :name="CAT_ICONS.PRODUCT" class="text-subtle size-5" />
        <div class="min-w-0 text-sm">
          <p class="truncate font-medium">{{ item?.productLookup?.description || 'Sin descripción' }}</p>
          <p class="text-subtle text-xs">SKU {{ item?.productLookup?.sku || '—' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputWrapper
          id="item-name"
          v-model="form.name"
          label="Nombre del artículo"
          placeholder="Ej. Sofá 3 plazas gris"
          class="sm:col-span-2"
        />
        <DropdownLabel
          id="item-category"
          v-model="form.categoryId"
          label="Categoría"
          :options="categoryOptions"
          placeholder="Sin categoría"
          clearable
        />
        <DropdownLabel
          id="item-condition"
          v-model="form.condition"
          label="Condición"
          :options="conditionOptions"
        />
        <InputWrapper id="item-qty" v-model="form.qty" label="Cantidad" type="number" min="0" step="1" :error="errors.qty" />
        <InputWrapper
          id="item-location"
          v-model="form.location"
          label="Ubicación"
          placeholder="Ej. Pasillo B - Estante 4"
        />
        <InputWrapper
          id="item-cost"
          v-model="form.cost"
          label="Costo"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          :error="errors.cost"
        />
        <InputWrapper
          id="item-price"
          v-model="form.price"
          label="Precio de venta"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          :error="errors.price"
        />
        <InputWrapper
          id="item-notes"
          v-model="form.notes"
          label="Notas"
          is-text-area
          class="sm:col-span-2"
        />
      </div>

      <!-- Fotos -->
      <div v-if="!isEdit" class="flex flex-col gap-2">
        <span class="input-label-muted">Fotos</span>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(photo, i) in photos"
            :key="photo.preview"
            class="group relative size-20 overflow-hidden rounded-xl border border-slate-200"
          >
            <img :src="photo.preview" alt="" class="size-full object-cover" />
            <button
              type="button"
              class="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-slate-900/70 text-white"
              aria-label="Quitar foto"
              @click="removePhoto(i)"
            >
              <Icon :name="CAT_ICONS.CLOSE" class="size-3.5" />
            </button>
          </div>
          <label
            class="text-subtle hover:border-accent hover:text-accent flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-xs transition-colors"
          >
            <Icon :name="CAT_ICONS.UPLOAD" class="size-5" />
            Agregar
            <input type="file" accept="image/*" multiple class="hidden" @change="onPickPhotos" />
          </label>
        </div>
      </div>
      <button type="submit" class="hidden" />
    </form>

    <template #footer>
      <button class="btn" :disabled="saving" @click="close()">Cancelar</button>
      <button class="btn btn-primary" :disabled="saving" @click="onSave">
        <Icon v-if="saving" name="lucide:loader-circle" class="size-4 animate-spin" />
        {{ isEdit ? 'Guardar cambios' : 'Crear artículo' }}
      </button>
    </template>
  </CustomModal>
</template>

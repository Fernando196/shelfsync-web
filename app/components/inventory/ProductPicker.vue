<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'
  import { CatalogService } from '~/services/catalogs'
  import type { IProductLookup } from '~/types/product.type'
  import InputWrapper from '../common/InputWrapper.vue'

  export interface INewProduct {
    sku: string
    barcode: string
    description: string
    needAssembly: boolean
  }

  defineProps<{ error?: string | null }>()

  /** Producto existente seleccionado */
  const selected = defineModel<IProductLookup | null>('selected', { default: null })
  /** Producto nuevo a crear junto con el item (null = usar existente) */
  const newProduct = defineModel<INewProduct | null>('newProduct', { default: null })

  const service = CatalogService()
  const query = ref('')
  const results = ref<IProductLookup[]>([])
  const searching = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let requestId = 0

  // El API combina filtros con AND, así que se busca por SKU y por descripción en paralelo
  async function search(term: string) {
    const id = ++requestId
    if (term.length < 2) {
      results.value = []
      return
    }
    searching.value = true
    try {
      const [bySku, byDescription, byBarcode] = await Promise.all([
        service.getProducts({ filters: { sku: { like: term } }, page: 1, limit: 8 }),
        service.getProducts({ filters: { description: { like: term } }, page: 1, limit: 8 }),
        service.getProducts({ filters: { barcode: { like: term } }, page: 1, limit: 4 }),
      ])
      if (id !== requestId) return
      const map = new Map<string, IProductLookup>()
      for (const p of [...bySku, ...byBarcode, ...byDescription]) map.set(p.id, p)
      results.value = [...map.values()].slice(0, 10)
    } finally {
      if (id === requestId) searching.value = false
    }
  }

  watch(query, (term) => {
    clearTimeout(timer)
    timer = setTimeout(() => search(term.trim()), 300)
  })

  function pick(product: IProductLookup) {
    selected.value = product
    newProduct.value = null
    query.value = ''
    results.value = []
  }

  function startNew() {
    selected.value = null
    newProduct.value = {
      sku: query.value.trim(),
      barcode: '',
      description: '',
      needAssembly: false,
    }
    query.value = ''
    results.value = []
  }

  function clear() {
    selected.value = null
    newProduct.value = null
  }
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span class="input-label-muted">Producto <span class="text-error">*</span></span>

    <!-- Seleccionado -->
    <div
      v-if="selected"
      class="border-accent/40 bg-accent-light flex items-center gap-3 rounded-xl border px-3 py-2.5"
    >
      <Icon :name="CAT_ICONS.PRODUCT" class="text-accent-dark size-5 shrink-0" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{{ selected.description || 'Sin descripción' }}</p>
        <p class="text-muted text-xs">
          SKU {{ selected.sku || '—' }} · Código {{ selected.barcode || '—' }}
          <span v-if="selected.needAssembly"> · Requiere armado</span>
        </p>
      </div>
      <button type="button" class="btn btn-sm" @click="clear">Cambiar</button>
    </div>

    <!-- Nuevo producto -->
    <div v-else-if="newProduct" class="border-border flex flex-col gap-3 rounded-xl border bg-slate-50 p-3">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">Nuevo producto</p>
        <button type="button" class="text-subtle hover:text-text cursor-pointer text-xs" @click="clear">
          Buscar existente
        </button>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputWrapper id="np-sku" v-model="newProduct.sku" label="SKU" />
        <InputWrapper id="np-barcode" v-model="newProduct.barcode" label="Código de barras" />
      </div>
      <InputWrapper id="np-description" v-model="newProduct.description" label="Descripción" />
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input v-model="newProduct.needAssembly" type="checkbox" class="accent-accent size-4" />
        Requiere armado
      </label>
    </div>

    <!-- Búsqueda -->
    <div v-else class="relative">
      <Icon :name="CAT_ICONS.SEARCH" class="text-faint absolute top-[11px] left-3 size-4" />
      <input
        v-model="query"
        type="search"
        placeholder="Busca por SKU, código de barras o descripción"
        class="input-content mt-0! pl-9"
        :class="{ 'border-error!': error }"
        autocomplete="off"
      />
      <Icon
        v-if="searching"
        name="lucide:loader-circle"
        class="text-faint absolute top-[11px] right-3 size-4 animate-spin"
      />
      <div
        v-if="query.trim().length >= 2"
        class="border-border absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-1 shadow-lg"
      >
        <button
          v-for="product in results"
          :key="product.id"
          type="button"
          class="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left hover:bg-slate-50"
          @click="pick(product)"
        >
          <span class="truncate text-sm">{{ product.description || 'Sin descripción' }}</span>
          <span class="text-subtle text-xs">SKU {{ product.sku || '—' }} · {{ product.barcode || '—' }}</span>
        </button>
        <p v-if="!searching && !results.length" class="text-faint px-3 py-2 text-sm">Sin coincidencias</p>
        <button
          type="button"
          class="text-accent-dark hover:bg-accent-light flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          @click="startNew"
        >
          <Icon :name="CAT_ICONS.ADD" class="size-4" />
          Crear producto nuevo
        </button>
      </div>
    </div>
    <span v-if="error" class="input-error">{{ error }}</span>
  </div>
</template>

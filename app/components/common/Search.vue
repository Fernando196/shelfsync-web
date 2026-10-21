<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'

  interface Props {
    id: number | string
    placeholder: string
    /** ms de espera antes de emitir (búsquedas al API) */
    debounce?: number
  }

  const props = withDefaults(defineProps<Props>(), { debounce: 350 })
  const search = defineModel<string>({ default: '' })
  const local = ref(search.value)
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(local, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => (search.value = value.trim()), props.debounce)
  })
  watch(search, (value) => {
    if (value !== local.value.trim()) local.value = value
  })
</script>
<template>
  <div class="relative w-full">
    <Icon
      :name="CAT_ICONS.SEARCH"
      class="text-faint absolute top-1/2 left-3 size-4 -translate-y-1/2"
    />
    <input
      :id="'search-' + id"
      v-model="local"
      type="search"
      :placeholder="placeholder"
      class="border-border focus:border-accent focus:ring-accent/15 w-full rounded-xl border bg-white py-2 pr-3 pl-9 text-sm transition-shadow outline-none placeholder:text-slate-400 focus:ring-4"
    />
  </div>
</template>

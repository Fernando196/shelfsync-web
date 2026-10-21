<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'

  interface Option {
    id: number | string
    label: string
  }

  interface Props {
    id: number | string
    label?: string
    options: Option[]
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }

  const props = defineProps<Props>()
  const modelValue = defineModel<number | string | null | undefined>({ default: null })

  const open = ref(false)
  const triggerRef = ref<HTMLElement | null>(null)
  const menuStyle = ref({ top: '0px', left: '0px', width: '0px' })

  const selectedLabel = computed(
    () => props.options.find((o) => o.id === modelValue.value)?.label ?? null
  )

  function openDropdown() {
    if (open.value) {
      open.value = false
      return
    }
    if (props.disabled || !triggerRef.value) return
    const rect = triggerRef.value.getBoundingClientRect()
    menuStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
    open.value = true
  }

  function select(option: Option | null) {
    modelValue.value = option ? option.id : null
    open.value = false
  }

  function handleOutsideClick(e: MouseEvent) {
    if (open.value && !triggerRef.value?.contains(e.target as Node)) {
      open.value = false
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
  onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<template>
  <div class="flex w-full flex-col">
    <span v-if="label" :id="`dropdown-label-${id}`" class="input-label-muted">{{ label }}</span>
    <button
      ref="triggerRef"
      :aria-labelledby="'dropdown-label-' + id"
      type="button"
      class="border-border focus:border-accent mt-1.5 flex h-[38px] w-full items-center justify-between rounded-xl border px-3 transition-colors outline-none"
      :class="disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'cursor-pointer bg-white'"
      @click="openDropdown"
    >
      <span class="truncate" :class="selectedLabel ? 'text-text' : 'text-faint'">
        {{ selectedLabel ?? placeholder ?? 'Seleccionar...' }}
      </span>
      <Icon
        :name="CAT_ICONS.ARROW_DOWN"
        class="text-faint size-4 shrink-0 transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        :style="menuStyle"
        class="border-border fixed z-[999] max-h-60 overflow-y-auto rounded-xl border bg-white p-1 shadow-lg"
      >
        <ul>
          <li
            v-if="clearable && modelValue != null"
            class="text-subtle cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
            @mousedown.prevent="select(null)"
          >
            Sin selección
          </li>
          <li
            v-for="option in options"
            :key="option.id"
            class="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
            :class="modelValue === option.id ? 'bg-accent-light text-accent-dark font-medium' : ''"
            @mousedown.prevent="select(option)"
          >
            {{ option.label }}
          </li>
          <li v-if="!options.length" class="text-faint px-3 py-2 text-sm">Sin opciones</li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

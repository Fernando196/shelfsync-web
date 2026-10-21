<script setup lang="ts">
  import type { InputTypeHTMLAttribute } from 'vue'

  interface Props {
    id: number | string
    label: string
    type?: InputTypeHTMLAttribute
    disabled?: boolean
    isTextArea?: boolean
    rows?: number
    placeholder?: string
    error?: string | null
    required?: boolean
    step?: string
    min?: string | number
    autocomplete?: string
  }
  withDefaults(defineProps<Props>(), {
    type: 'text',
    rows: 3,
    placeholder: undefined,
    error: null,
    step: undefined,
    min: undefined,
    autocomplete: 'off',
  })

  const value = defineModel<number | string | null | undefined>()
</script>
<template>
  <div class="flex w-full flex-col">
    <label :for="'input-wrapper-' + id" class="input-label-muted">
      {{ label }}<span v-if="required" class="text-error"> *</span>
    </label>
    <input
      v-if="!isTextArea"
      :id="'input-wrapper-' + id"
      v-model="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :type="type"
      :step="step"
      :min="min"
      class="input-content"
      :class="{ 'border-error!': error }"
      :autocomplete="autocomplete"
    />
    <textarea
      v-else
      :id="'input-wrapper-' + id"
      v-model="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      class="input-content resize-none"
      :class="{ 'border-error!': error }"
      autocomplete="off"
    />
    <span v-if="error" class="input-error">{{ error }}</span>
  </div>
</template>

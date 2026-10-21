<script setup lang="ts" generic="T extends object">
  import type { TableColumn } from '~/types/table.type'

  interface Props {
    columns: TableColumn<T>[]
    rows: T[]
    rowKey?: keyof T
    emptyMessage?: string
    loading?: boolean
    showActions?: boolean
  }

  withDefaults(defineProps<Props>(), {
    rowKey: undefined,
    emptyMessage: 'Sin registros',
    loading: false,
    showActions: true,
  })
  defineEmits<{ 'row-click': [row: T] }>()

  const alignClass = (align?: TableColumn<T>['align']) =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

  const cell = (row: T, key: TableColumn<T>['key']) => (row as Record<string, unknown>)[key as string]
</script>

<template>
  <div class="border-border w-full overflow-x-auto rounded-b-2xl border bg-white">
    <table class="w-full text-left text-sm">
      <thead class="border-border border-b bg-slate-50">
        <tr>
          <th
            v-for="col in columns"
            :key="String(col.key)"
            :style="col.width ? `width: ${col.width}` : ''"
            :class="['text-muted px-4 py-3 text-xs font-semibold tracking-wide uppercase', alignClass(col.align)]"
          >
            {{ col.label }}
          </th>
          <th v-if="showActions" class="text-muted w-24 px-4 py-3 text-right text-xs font-semibold uppercase">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading && !rows.length">
          <tr v-for="n in 6" :key="'sk-' + n" class="border-b border-slate-100">
            <td v-for="col in columns" :key="String(col.key)" class="px-4 py-3.5">
              <div class="h-4 animate-pulse rounded bg-slate-100" />
            </td>
            <td v-if="showActions" />
          </tr>
        </template>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length + 1" class="text-faint px-4 py-12 text-center">
            {{ emptyMessage }}
          </td>
        </tr>
        <tr
          v-for="(row, index) in rows"
          :key="rowKey ? String(row[rowKey]) : index"
          class="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
          :class="{ 'opacity-60': loading }"
          @click="$emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="String(col.key)"
            :class="['px-4 py-3 text-slate-700', alignClass(col.align)]"
          >
            <slot :name="`cell-${String(col.key)}`" :row="row" :value="cell(row, col.key)">
              {{ cell(row, col.key) ?? '—' }}
            </slot>
          </td>
          <td v-if="showActions" class="px-4 py-3" @click.stop>
            <div class="flex items-center justify-end gap-1">
              <slot name="actions" :row="row" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

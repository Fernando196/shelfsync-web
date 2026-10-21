<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'
  import type { IPhoto } from '~/types/item.type'

  interface Props {
    photos: IPhoto[]
    startIndex?: number
    title?: string
  }

  const props = withDefaults(defineProps<Props>(), { startIndex: 0, title: '' })
  const { close } = useModal()
  const { photoUrl } = usePhotos()

  const MIN_ZOOM = 1
  const MAX_ZOOM = 5

  const index = ref(Math.min(props.startIndex, Math.max(0, props.photos.length - 1)))
  const zoom = ref(1)
  const offset = ref({ x: 0, y: 0 })
  const loading = ref(true)
  const dragging = ref(false)
  let dragStart = { x: 0, y: 0, ox: 0, oy: 0 }

  const current = computed(() => props.photos[index.value])
  const hasMany = computed(() => props.photos.length > 1)

  function resetView() {
    zoom.value = 1
    offset.value = { x: 0, y: 0 }
  }

  function go(step: number) {
    if (!hasMany.value) return
    index.value = (index.value + step + props.photos.length) % props.photos.length
  }

  watch(index, () => {
    resetView()
    loading.value = true
  })

  function setZoom(value: number) {
    zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))))
    if (zoom.value === 1) offset.value = { x: 0, y: 0 }
  }

  function onWheel(e: WheelEvent) {
    setZoom(zoom.value * (e.deltaY < 0 ? 1.15 : 1 / 1.15))
  }

  function onDoubleClick() {
    setZoom(zoom.value > 1 ? 1 : 2.5)
  }

  function onPointerDown(e: PointerEvent) {
    if (zoom.value === 1) return
    dragging.value = true
    dragStart = { x: e.clientX, y: e.clientY, ox: offset.value.x, oy: offset.value.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging.value) return
    offset.value = {
      x: dragStart.ox + (e.clientX - dragStart.x) / zoom.value,
      y: dragStart.oy + (e.clientY - dragStart.y) / zoom.value,
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === '+' || e.key === '=') setZoom(zoom.value * 1.25)
    else if (e.key === '-') setZoom(zoom.value / 1.25)
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  })
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-slate-950/95 text-white select-none">
    <!-- Barra superior -->
    <header class="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">{{ title }}</p>
        <p class="text-xs text-slate-400">{{ index + 1 }} / {{ photos.length }}</p>
      </div>
      <div class="flex items-center gap-1">
        <button class="viewer-btn" title="Alejar (-)" :disabled="zoom <= MIN_ZOOM" @click="setZoom(zoom / 1.25)">
          <Icon :name="CAT_ICONS.ZOOM_OUT" class="size-5" />
        </button>
        <span class="w-12 text-center text-xs text-slate-300 tabular-nums">{{ Math.round(zoom * 100) }}%</span>
        <button class="viewer-btn" title="Acercar (+)" :disabled="zoom >= MAX_ZOOM" @click="setZoom(zoom * 1.25)">
          <Icon :name="CAT_ICONS.ZOOM_IN" class="size-5" />
        </button>
        <a
          v-if="current"
          class="viewer-btn"
          title="Abrir original"
          :href="photoUrl(current, 'original') ?? undefined"
          target="_blank"
          rel="noopener"
          download
        >
          <Icon :name="CAT_ICONS.DOWNLOAD" class="size-5" />
        </a>
        <button class="viewer-btn" title="Cerrar (Esc)" @click="close()">
          <Icon :name="CAT_ICONS.CLOSE" class="size-5" />
        </button>
      </div>
    </header>

    <!-- Imagen -->
    <div
      class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
      :class="zoom > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'"
      @wheel.prevent="onWheel"
      @dblclick="onDoubleClick"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="dragging = false"
      @pointercancel="dragging = false"
    >
      <Icon
        v-if="loading"
        name="lucide:loader-circle"
        class="absolute size-8 animate-spin text-slate-400"
      />
      <img
        v-if="current"
        :key="current.id"
        :src="photoUrl(current, 'original') ?? undefined"
        :alt="title"
        draggable="false"
        class="max-h-full max-w-full object-contain"
        :class="dragging ? '' : 'transition-transform duration-150'"
        :style="{ transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)` }"
        @load="loading = false"
        @error="loading = false"
      />

      <template v-if="hasMany">
        <button class="viewer-nav left-3" aria-label="Anterior" @click.stop="go(-1)" @dblclick.stop>
          <Icon :name="CAT_ICONS.CHEVRON_LEFT" class="size-6" />
        </button>
        <button class="viewer-nav right-3" aria-label="Siguiente" @click.stop="go(1)" @dblclick.stop>
          <Icon :name="CAT_ICONS.CHEVRON_RIGHT" class="size-6" />
        </button>
      </template>
    </div>

    <!-- Miniaturas -->
    <footer v-if="hasMany" class="shrink-0 overflow-x-auto px-4 py-3">
      <div class="mx-auto flex w-max gap-2">
        <button
          v-for="(photo, i) in photos"
          :key="photo.id"
          class="size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-opacity"
          :class="i === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-90'"
          @click="index = i"
        >
          <img :src="photoUrl(photo, 'thumb') ?? undefined" alt="" class="size-full object-cover" />
        </button>
      </div>
    </footer>
    <p class="hidden pb-2 text-center text-[11px] text-slate-500 md:block">
      Rueda del mouse o doble clic para zoom · arrastra para mover · ← → para navegar · Esc para cerrar
    </p>
  </div>
</template>

<style scoped>
  @reference '~/assets/css/main.css';

  .viewer-btn {
    @apply flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30;
  }
  .viewer-nav {
    @apply absolute top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60;
  }
</style>

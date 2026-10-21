<script setup lang="ts">
  import { CAT_ICONS } from '~/const/icons.const'
  import type { IPhoto } from '~/types/item.type'
  import type { PhotoSize } from '~/composables/usePhotos'

  interface Props {
    photo: IPhoto | null | undefined
    /** Fotos que se abren en el visor al hacer clic (por defecto solo `photo`) */
    gallery?: IPhoto[]
    title?: string
    size?: PhotoSize
    zoomable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    gallery: undefined,
    title: '',
    size: 'thumb',
    zoomable: true,
  })

  const { photoUrl } = usePhotos()
  const { openViewer } = useImageViewer()
  const failed = ref(false)

  const src = computed(() => photoUrl(props.photo, props.size))

  function open() {
    if (!props.zoomable || !props.photo) return
    const photos = props.gallery?.length ? props.gallery : [props.photo]
    const start = Math.max(0, photos.findIndex((p) => p.id === props.photo?.id))
    openViewer(photos, start, props.title)
  }
</script>

<template>
  <component
    :is="zoomable ? 'button' : 'div'"
    :type="zoomable ? 'button' : undefined"
    class="group relative flex items-center justify-center overflow-hidden bg-slate-100"
    :class="photo && zoomable ? 'cursor-zoom-in' : 'cursor-default'"
    :title="photo && zoomable ? 'Ver en grande' : undefined"
    @click="zoomable && ($event.stopPropagation(), open())"
  >
    <img
      v-if="src && !failed"
      :src="src"
      :alt="title"
      loading="lazy"
      class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      @error="failed = true"
    />
    <Icon v-else :name="CAT_ICONS.IMAGE" class="size-1/3 min-h-4 min-w-4 text-slate-300" />
    <span
      v-if="src && !failed && zoomable"
      class="absolute inset-0 flex items-center justify-center bg-slate-900/0 text-white opacity-0 transition-all group-hover:bg-slate-900/30 group-hover:opacity-100"
    >
      <Icon :name="CAT_ICONS.EXPAND" class="size-5" />
    </span>
  </component>
</template>

<script setup lang="ts">
  import ConfirmModal from '../common/Modal/ConfirmModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { ItemService } from '~/services/items'
  import type { IItem, IPhoto } from '~/types/item.type'

  interface Props {
    item: IItem
    title: string
    canEdit?: boolean
  }
  const props = defineProps<Props>()
  const emit = defineEmits<{ updated: [item: IItem] }>()

  const service = ItemService()
  const toast = useToast()
  const { openModal } = useModal()
  const { photoUrl } = usePhotos()
  const { openViewer } = useImageViewer()

  // Portada primero, el resto de la más nueva a la más vieja
  const photos = computed<IPhoto[]>(() => {
    const files = [...(props.item.files ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const coverId = props.item.cover?.id
    return coverId ? [...files.filter((f) => f.id === coverId), ...files.filter((f) => f.id !== coverId)] : files
  })
  const selectedIndex = ref(0)
  const selected = computed(() => photos.value[selectedIndex.value] ?? photos.value[0])
  const uploading = ref(false)
  const busyPhotoId = ref<string | null>(null)

  watch(
    () => photos.value.length,
    () => (selectedIndex.value = Math.min(selectedIndex.value, Math.max(0, photos.value.length - 1)))
  )

  async function onUpload(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files ?? []).filter((f) => f.type.startsWith('image/'))
    input.value = ''
    if (!files.length) return
    uploading.value = true
    try {
      const blobs = await Promise.all(files.map((f) => compressImage(f)))
      emit('updated', await service.uploadPhotos(props.item.id, blobs))
      toast.success(files.length > 1 ? `${files.length} fotos agregadas` : 'Foto agregada')
    } catch (err) {
      toast.error(err)
    } finally {
      uploading.value = false
    }
  }

  async function setCover(photo: IPhoto) {
    busyPhotoId.value = photo.id
    try {
      emit('updated', await service.setCover(props.item.id, photo.id))
      selectedIndex.value = 0
      toast.success('Portada actualizada')
    } catch (err) {
      toast.error(err)
    } finally {
      busyPhotoId.value = null
    }
  }

  async function removePhoto(photo: IPhoto) {
    const ok = await openModal(ConfirmModal, {
      title: 'Eliminar foto',
      message: 'La foto se eliminará permanentemente.',
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!ok) return
    busyPhotoId.value = photo.id
    try {
      emit('updated', await service.deletePhoto(props.item.id, photo.id))
      toast.success('Foto eliminada')
    } catch (err) {
      toast.error(err)
    } finally {
      busyPhotoId.value = null
    }
  }
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Foto principal -->
    <div class="group relative aspect-[4/3] bg-slate-100">
      <button
        v-if="selected"
        type="button"
        class="size-full cursor-zoom-in"
        title="Ver en grande"
        @click="openViewer(photos, selectedIndex, title)"
      >
        <img :src="photoUrl(selected, 'medium') ?? undefined" :alt="title" class="size-full object-contain" />
      </button>
      <div v-else class="text-faint flex size-full flex-col items-center justify-center gap-2">
        <Icon :name="CAT_ICONS.IMAGE" class="size-12" />
        <p class="text-sm">Sin fotos</p>
      </div>

      <div v-if="selected" class="absolute top-3 right-3 flex gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        <button class="gallery-btn" title="Ver en grande" @click="openViewer(photos, selectedIndex, title)">
          <Icon :name="CAT_ICONS.EXPAND" class="size-4" />
        </button>
        <template v-if="canEdit">
          <button
            v-if="selected.id !== item.cover?.id"
            class="gallery-btn"
            title="Usar como portada"
            :disabled="!!busyPhotoId"
            @click="setCover(selected)"
          >
            <Icon :name="CAT_ICONS.STAR" class="size-4" />
          </button>
          <button class="gallery-btn hover:bg-error!" title="Eliminar foto" :disabled="!!busyPhotoId" @click="removePhoto(selected)">
            <Icon :name="CAT_ICONS.DELETE" class="size-4" />
          </button>
        </template>
      </div>
      <span
        v-if="selected && selected.id === item.cover?.id"
        class="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 text-[11px] font-medium text-white"
      >
        <Icon name="lucide:star" class="size-3 fill-current" /> Portada
      </span>
      <span
        v-if="photos.length > 1"
        class="absolute right-3 bottom-3 rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] text-white tabular-nums"
      >
        {{ selectedIndex + 1 }} / {{ photos.length }}
      </span>
    </div>

    <!-- Miniaturas -->
    <div class="flex gap-2 overflow-x-auto p-3">
      <button
        v-for="(photo, i) in photos"
        :key="photo.id"
        class="relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all"
        :class="i === selectedIndex ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'"
        @click="selectedIndex = i"
        @dblclick="openViewer(photos, i, title)"
      >
        <img :src="photoUrl(photo, 'thumb') ?? undefined" alt="" class="size-full object-cover" loading="lazy" />
        <Icon
          v-if="busyPhotoId === photo.id"
          name="lucide:loader-circle"
          class="absolute inset-0 m-auto size-5 animate-spin text-white"
        />
      </button>
      <label
        v-if="canEdit"
        class="text-subtle hover:border-accent hover:text-accent flex size-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-slate-200 text-[11px] transition-colors"
        :class="{ 'pointer-events-none opacity-60': uploading }"
      >
        <Icon :name="uploading ? 'lucide:loader-circle' : CAT_ICONS.UPLOAD" class="size-5" :class="{ 'animate-spin': uploading }" />
        {{ uploading ? 'Subiendo' : 'Agregar' }}
        <input type="file" accept="image/*" multiple class="hidden" :disabled="uploading" @change="onUpload" />
      </label>
    </div>
  </div>
</template>

<style scoped>
  @reference '~/assets/css/main.css';

  .gallery-btn {
    @apply flex size-8 cursor-pointer items-center justify-center rounded-lg bg-slate-900/70 text-white backdrop-blur transition-colors hover:bg-slate-900 disabled:opacity-50;
  }
</style>

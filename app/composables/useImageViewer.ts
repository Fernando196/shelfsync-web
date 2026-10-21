import ImageViewerModal from '~/components/common/ImageViewer/ImageViewerModal.vue'
import type { IPhoto } from '~/types/item.type'

/** Abre cualquier lista de fotos en el visor de pantalla completa */
export function useImageViewer() {
  const { openModal } = useModal()

  function openViewer(photos: IPhoto[], startIndex = 0, title = '') {
    if (!photos.length) return
    return openModal(ImageViewerModal, { photos, startIndex, title })
  }

  return { openViewer }
}

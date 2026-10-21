import { useMenuStore } from '~/store/menu.store'

/** Permisos (ver/crear/editar/eliminar) del usuario sobre una sección del menú */
export function usePermissions(path?: string) {
  const menuStore = useMenuStore()
  const route = useRoute()
  return computed(() => menuStore.permissionsFor(path ?? route.path))
}

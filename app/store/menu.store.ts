import { FALLBACK_MENU } from '~/const/menu.const'
import { MenuService } from '~/services/menu'
import type { IMenuItem, IMenuPermissions } from '~/types/menu.type'

const NO_ACCESS: IMenuPermissions = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
}

export const useMenuStore = defineStore('menu', () => {
  const items = ref<IMenuItem[]>([])
  const loaded = ref(false)
  /** 'api' = menú real de /menu/me · 'fallback' = el API aún no expone el menú */
  const source = ref<'api' | 'fallback'>('fallback')

  const menuItems = computed(() => items.value.filter((item) => item.canView))
  const flatItems = computed(() =>
    items.value.flatMap((item) => [item, ...(item.children ?? [])]).filter((i) => i.canView)
  )

  /** Item del menú que corresponde a una ruta (match más largo: /inventory/123 → /inventory) */
  function findByPath(path: string) {
    return flatItems.value
      .filter((item) =>
        item.path === '/' ? path === '/' : path === item.path || path.startsWith(item.path + '/')
      )
      .sort((a, b) => b.path.length - a.path.length)[0]
  }

  const activeMenuItem = computed(() => findByPath(useRoute().path))

  function permissionsFor(path: string): IMenuPermissions {
    return findByPath(path) ?? NO_ACCESS
  }

  async function fetchMenu({ force = false } = {}) {
    if (loaded.value && !force) return items.value
    try {
      items.value = await MenuService().getMyMenu()
      source.value = 'api'
    } catch (error) {
      const status = (error as { statusCode?: number })?.statusCode
      if (status === 401) throw error
      // 404 mientras shelfsync-api no tenga las tablas menu/menu_user
      items.value = FALLBACK_MENU
      source.value = 'fallback'
    }
    loaded.value = true
    return items.value
  }

  function reset() {
    items.value = []
    loaded.value = false
  }

  return {
    items,
    source,
    loaded,
    menuItems,
    activeMenuItem,
    findByPath,
    permissionsFor,
    fetchMenu,
    reset,
  }
})

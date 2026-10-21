/**
 * Iconos de la app (Iconify + Lucide vía @nuxt/icon).
 * Uso: <Icon :name="CAT_ICONS.ADD" /> o directo <Icon name="lucide:plus" />
 * Catálogo completo: https://icones.js.org/collection/lucide
 */
export const CAT_ICONS = {
  ADD: 'lucide:plus',
  DASHBOARD: 'lucide:layout-dashboard',
  INVENTORY: 'lucide:package',
  USERS: 'lucide:users',
  CATALOGS: 'lucide:library',
  CATEGORY: 'lucide:tags',
  PRODUCT: 'lucide:barcode',
  CLOSE: 'lucide:x',
  SEARCH: 'lucide:search',
  DELETE: 'lucide:trash-2',
  EDIT: 'lucide:pencil',
  MONEY: 'lucide:circle-dollar-sign',
  TIME: 'lucide:clock',
  ARROW_DOWN: 'lucide:chevron-down',
  ARROW_LEFT: 'lucide:arrow-left',
  CHEVRON_LEFT: 'lucide:chevron-left',
  CHEVRON_RIGHT: 'lucide:chevron-right',
  STATUS: 'lucide:activity',
  MENU: 'lucide:menu',
  ALERT: 'lucide:triangle-alert',
  IMAGE: 'lucide:image',
  UPLOAD: 'lucide:upload',
  STAR: 'lucide:star',
  ZOOM_IN: 'lucide:zoom-in',
  ZOOM_OUT: 'lucide:zoom-out',
  DOWNLOAD: 'lucide:download',
  LOGOUT: 'lucide:log-out',
  KEY: 'lucide:key-round',
  LOCATION: 'lucide:map-pin',
  HISTORY: 'lucide:history',
  CHECK: 'lucide:check',
  TOOL: 'lucide:hammer',
  PAUSE: 'lucide:circle-pause',
  BOX: 'lucide:box',
  EXPAND: 'lucide:maximize-2',
  REFRESH: 'lucide:refresh-cw',
  SHIELD: 'lucide:shield-check',
} as const

/**
 * El API guarda en menu.icon una clave corta ("inventory"). Aquí se traduce a Iconify.
 * Si el API ya manda un nombre Iconify completo ("lucide:boxes") se usa tal cual.
 */
export const MENU_ICONS: Record<string, string> = {
  dashboard: CAT_ICONS.DASHBOARD,
  inventory: CAT_ICONS.INVENTORY,
  catalogs: CAT_ICONS.CATALOGS,
  users: CAT_ICONS.USERS,
}

export function resolveMenuIcon(icon: string | null | undefined) {
  if (!icon) return CAT_ICONS.DASHBOARD
  if (icon.includes(':')) return icon
  return MENU_ICONS[icon] ?? CAT_ICONS.DASHBOARD
}

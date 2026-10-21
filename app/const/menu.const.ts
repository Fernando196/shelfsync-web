import { CAT_ICONS } from './icons.const'
import type { IMenuItem } from '~/types/menu.type'

const ALL = { canView: true, canCreate: true, canEdit: true, canDelete: true }

/** Menú local de respaldo mientras el API no expone /menu/me */
export const FALLBACK_MENU: IMenuItem[] = [
  { id: 1, label: 'Dashboard', path: '/', icon: CAT_ICONS.DASHBOARD, parentId: null, order: 1, ...ALL },
  { id: 2, label: 'Inventario', path: '/inventory', icon: CAT_ICONS.INVENTORY, parentId: null, order: 2, ...ALL },
  { id: 3, label: 'Catálogos', path: '/catalogs', icon: CAT_ICONS.CATALOGS, parentId: null, order: 3, ...ALL },
  { id: 4, label: 'Usuarios', path: '/users', icon: CAT_ICONS.USERS, parentId: null, order: 4, ...ALL },
]

/** Rutas que no dependen del menú del usuario */
export const PUBLIC_ROUTES = ['/login']

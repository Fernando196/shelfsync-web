import type { Icons } from './icons.type'

export interface IMenuPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface IMenuItem extends IMenuPermissions {
  id: number | string
  label: string
  path: string
  icon: Icons
  parentId: number | string | null
  order: number
  children?: IMenuItem[]
}

/** Item del catálogo de menú (GET /menu) */
export interface IMenuCatalogItem {
  id: number | string
  label: string
  path: string
  icon: Icons
  parentId: number | string | null
  order: number
  active: boolean
}

/** Acceso de un usuario a un menú (GET/PUT /users/:id/menu) */
export interface IUserMenuAccess extends IMenuPermissions {
  menuId: number | string
}

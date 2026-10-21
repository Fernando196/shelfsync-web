import { resolveMenuIcon } from '~/const/icons.const'
import type { IMenuCatalogItem, IMenuItem, IUserMenuAccess } from '~/types/menu.type'

type RawMenu = Record<string, unknown>

const pick = <T>(raw: RawMenu, ...keys: string[]): T | undefined => {
  for (const key of keys) if (raw[key] !== undefined) return raw[key] as T
  return undefined
}

const toIcon = (value: unknown) => resolveMenuIcon(value as string | null)

// Tolera camelCase o snake_case mientras se cierra el contrato con shelfsync-api
function normalizeMenuItem(raw: RawMenu): IMenuItem {
  return {
    id: pick(raw, 'id') as number | string,
    label: pick<string>(raw, 'label', 'name') ?? '',
    path: pick<string>(raw, 'path') ?? '/',
    icon: toIcon(pick(raw, 'icon')),
    parentId: pick(raw, 'parentId', 'parent_id') ?? null,
    order: Number(pick(raw, 'order') ?? 0),
    canView: pick<boolean>(raw, 'canView', 'can_view') ?? true,
    canCreate: pick<boolean>(raw, 'canCreate', 'can_create') ?? false,
    canEdit: pick<boolean>(raw, 'canEdit', 'can_edit') ?? false,
    canDelete: pick<boolean>(raw, 'canDelete', 'can_delete') ?? false,
    children: ((pick<RawMenu[]>(raw, 'children') ?? []) as RawMenu[]).map(normalizeMenuItem),
  }
}

function normalizeAccess(raw: RawMenu): IUserMenuAccess {
  return {
    menuId: pick(raw, 'menuId', 'menu_id') as number | string,
    canView: pick<boolean>(raw, 'canView', 'can_view') ?? false,
    canCreate: pick<boolean>(raw, 'canCreate', 'can_create') ?? false,
    canEdit: pick<boolean>(raw, 'canEdit', 'can_edit') ?? false,
    canDelete: pick<boolean>(raw, 'canDelete', 'can_delete') ?? false,
  }
}

const unwrap = (res: unknown): RawMenu[] =>
  Array.isArray(res) ? res : ((res as { data?: RawMenu[] })?.data ?? [])

export const MenuService = () => {
  const { $api } = useNuxtApp()

  return {
    async getMyMenu(): Promise<IMenuItem[]> {
      const res = await $api('/menu/me', { method: 'GET' })
      return unwrap(res)
        .map(normalizeMenuItem)
        .sort((a, b) => a.order - b.order)
    },
    async getMenuCatalog(): Promise<IMenuCatalogItem[]> {
      const res = await $api('/menu', { method: 'GET' })
      return unwrap(res)
        .map((raw) => {
          const item = normalizeMenuItem(raw)
          return { ...item, active: pick<boolean>(raw, 'active') ?? true }
        })
        .sort((a, b) => a.order - b.order)
    },
    async getUserMenu(userId: string): Promise<IUserMenuAccess[]> {
      const res = await $api(`/users/${userId}/menu`, { method: 'GET' })
      return unwrap(res).map(normalizeAccess)
    },
    async putUserMenu(userId: string, items: IUserMenuAccess[]): Promise<IUserMenuAccess[]> {
      const res = await $api(`/users/${userId}/menu`, { method: 'PUT', body: { items } })
      return unwrap(res).map(normalizeAccess)
    },
  }
}

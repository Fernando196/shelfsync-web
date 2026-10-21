import { CAT_ICONS } from './icons.const'
import type { ItemCondition, ItemStatus } from '~/types/item.type'
import type { Icons } from '~/types/icons.type'

export const ITEM_STATUS = {
  RECEIVED: 'received',
  PENDING_ASSEMBLY: 'pending_assembly',
  ASSEMBLING: 'assembling',
  READY: 'ready',
  SOLD: 'sold',
  DAMAGED: 'damaged',
  PAUSED: 'paused',
} as const

export const ITEM_STATUS_LIST: ItemStatus[] = Object.values(ITEM_STATUS)

export const ITEM_STATUS_CATALOG: Record<
  ItemStatus,
  { label: string; badge: string; color: string; icon: Icons }
> = {
  [ITEM_STATUS.RECEIVED]: { label: 'Recibido', badge: 'badge-neutral', color: '#64748b', icon: CAT_ICONS.BOX },
  [ITEM_STATUS.PENDING_ASSEMBLY]: {
    label: 'Por armar',
    badge: 'badge-amber',
    color: '#f59e0b',
    icon: CAT_ICONS.TIME,
  },
  [ITEM_STATUS.ASSEMBLING]: { label: 'Armando', badge: 'badge-indigo', color: '#6366f1', icon: CAT_ICONS.TOOL },
  [ITEM_STATUS.READY]: { label: 'Listo', badge: 'badge-emerald', color: '#059669', icon: CAT_ICONS.CHECK },
  [ITEM_STATUS.SOLD]: { label: 'Vendido', badge: 'badge-neutral', color: '#334155', icon: CAT_ICONS.MONEY },
  [ITEM_STATUS.DAMAGED]: { label: 'Dañado', badge: 'badge-rose', color: '#e11d48', icon: CAT_ICONS.ALERT },
  [ITEM_STATUS.PAUSED]: { label: 'En pausa', badge: 'badge-amber', color: '#d97706', icon: CAT_ICONS.PAUSE },
}

/** Copia de ALLOWED_FROM del API: destino → estatus de origen permitidos */
const ALLOWED_FROM: Record<ItemStatus, ItemStatus[]> = {
  received: ['pending_assembly'],
  pending_assembly: ['received', 'assembling', 'paused'],
  assembling: ['pending_assembly', 'paused'],
  ready: ['assembling'],
  paused: ['assembling'],
  sold: ['ready', 'received', 'damaged'],
  damaged: ['received', 'pending_assembly', 'assembling', 'ready', 'sold', 'paused'],
}

export function getNextStatuses(from: ItemStatus): ItemStatus[] {
  return ITEM_STATUS_LIST.filter((to) => ALLOWED_FROM[to].includes(from))
}

export const ITEM_CONDITION = {
  NEW: 'new',
  USED_LIKE_NEW: 'used_like_new',
  USED_GOOD: 'used_good',
  USED_FAIR: 'used_fair',
} as const

export const ITEM_CONDITION_CATALOG: Record<ItemCondition, string> = {
  new: 'Nuevo',
  used_like_new: 'Usado - como nuevo',
  used_good: 'Usado - buen estado',
  used_fair: 'Usado - aceptable',
}

export const ITEMS_PAGE_SIZE = 20

export function formatItemCode(code: number | null | undefined) {
  if (code == null) return '—'
  return 'BOD-' + String(code).padStart(6, '0')
}

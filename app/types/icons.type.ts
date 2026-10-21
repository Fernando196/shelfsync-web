import type { CAT_ICONS } from '~/const/icons.const'

/** Nombre Iconify (ej. "lucide:package"); CAT_ICONS lista los usados en la app */
export type Icons = (typeof CAT_ICONS)[keyof typeof CAT_ICONS] | (string & {})

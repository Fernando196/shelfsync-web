import { PUBLIC_ROUTES } from '~/const/menu.const'
import { useAuthStore } from '~/store/auth.store'
import { useMenuStore } from '~/store/menu.store'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const isPublic = PUBLIC_ROUTES.includes(to.path)

  if (!auth.isAuthenticated) {
    return isPublic ? undefined : navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (isPublic) return navigateTo('/')

  // Menú del usuario: define qué secciones puede ver
  const menuStore = useMenuStore()
  try {
    if (!menuStore.loaded) {
      // Una vez por sesión: valida el token y trae usuario + menú en paralelo
      await Promise.all([menuStore.fetchMenu(), auth.fetchMe().catch(() => auth.user)])
    }
  } catch {
    return // 401: el plugin de api ya cerró la sesión
  }

  if (!menuStore.findByPath(to.path)) {
    const first = menuStore.menuItems[0]
    if (first && first.path !== to.path) return navigateTo(first.path)
    if (!first) {
      return abortNavigation(
        createError({ statusCode: 403, statusMessage: 'Tu usuario no tiene secciones asignadas' })
      )
    }
  }
})

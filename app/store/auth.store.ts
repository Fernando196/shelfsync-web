import { AuthService } from '~/services/auth'
import type { ILoginPayload, IUser } from '~/types/user.type'
import { useMenuStore } from './menu.store'

const SESSION_MAX_AGE = 60 * 60 * 24 * 30

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>(AUTH_TOKEN_COOKIE, {
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
  })
  const user = useCookie<IUser | null>(AUTH_USER_COOKIE, {
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
  })

  const isAuthenticated = computed(() => !!token.value)
  const initials = computed(() =>
    (user.value?.fullName || user.value?.userName || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('')
  )

  async function login(payload: ILoginPayload) {
    const res = await AuthService().login(payload)
    token.value = res.accessToken
    user.value = res.user
    return res.user
  }

  /** Refresca los datos del usuario desde el token (nombre/correo pudieron cambiar) */
  async function fetchMe() {
    user.value = await AuthService().me()
    return user.value
  }

  async function logout() {
    token.value = null
    user.value = null
    useMenuStore().reset()
    await navigateTo('/login')
  }

  return {
    token,
    user,
    isAuthenticated,
    initials,
    login,
    fetchMe,
    logout,
  }
})

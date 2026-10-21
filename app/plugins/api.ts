import type { Pinia } from 'pinia'
import { useAuthStore } from '~/store/auth.store'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  // El token se lee del store en cada petición: un useCookie propio aquí quedaría desfasado
  // justo después del login (Nuxt sincroniza refs de la misma cookie de forma asíncrona)
  const auth = () => useAuthStore(nuxtApp.$pinia as Pinia)

  const api = $fetch.create({
    baseURL: `${config.public.apiBase}/api`,
    onRequest({ options }) {
      const token = auth().token
      if (!token) return
      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${token}`)
      options.headers = headers
    },
    async onResponseError({ response }) {
      // Sesión expirada o token inválido: limpiar y regresar al login
      if (response.status === 401 && auth().token) {
        await nuxtApp.runWithContext(() => auth().logout())
      }
    },
  })

  return {
    provide: { api },
  }
})

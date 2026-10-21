import type { ILoginPayload, ILoginResponse, IUser } from '~/types/user.type'

export const AuthService = () => {
  const { $api } = useNuxtApp()

  return {
    async login(payload: ILoginPayload): Promise<ILoginResponse> {
      return await $api<ILoginResponse>('/auth/login', {
        method: 'POST',
        body: payload,
      })
    },
    async me(): Promise<IUser> {
      return await $api<IUser>('/auth/me', { method: 'GET' })
    },
  }
}

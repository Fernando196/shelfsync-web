import type { ICatalogQuery } from '~/types/api.type'
import type { IUser, IUserPayload } from '~/types/user.type'

export const UserService = () => {
  const { $api } = useNuxtApp()

  return {
    async getUsers(query?: ICatalogQuery): Promise<IUser[]> {
      return await $api<IUser[]>('/users', { method: 'GET', query: toCatalogQuery(query) })
    },
    async getUser(id: string): Promise<IUser> {
      return await $api<IUser>(`/users/${id}`, { method: 'GET' })
    },
    async postUser(user: IUserPayload): Promise<IUser> {
      return await $api<IUser>('/users', { method: 'POST', body: user })
    },
    async patchUser(id: string, user: Partial<IUserPayload>): Promise<IUser> {
      return await $api<IUser>(`/users/${id}`, { method: 'PATCH', body: user })
    },
    async deleteUser(id: string): Promise<void> {
      await $api(`/users/${id}`, { method: 'DELETE' })
    },
  }
}

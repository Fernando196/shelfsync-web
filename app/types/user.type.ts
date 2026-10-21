export interface IUser {
  id: string
  userName: string
  email: string | null
  fullName: string
  createdAt?: string
  updatedAt?: string
}

export interface IUserPayload {
  userName: string
  fullName: string
  email?: string
  password?: string
}

export interface ILoginPayload {
  userName: string
  password: string
}

export interface ILoginResponse {
  accessToken: string
  user: IUser
}

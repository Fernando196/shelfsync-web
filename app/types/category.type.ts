export interface ICategoryRef {
  id: string
  name: string
}

export interface ICategory extends ICategoryRef {
  active: boolean
  createdAt?: string
  updatedAt?: string
}

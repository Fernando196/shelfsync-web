import type { ICatalogQuery } from '~/types/api.type'
import type { ICategory } from '~/types/category.type'
import type { IProductLookup } from '~/types/product.type'

export const CatalogService = () => {
  const { $api } = useNuxtApp()

  return {
    // Categorías
    async getCategories(query?: ICatalogQuery): Promise<ICategory[]> {
      return await $api<ICategory[]>('/categories', { method: 'GET', query: toCatalogQuery(query) })
    },
    async createCategory(category: Omit<ICategory, 'id'>): Promise<ICategory> {
      return await $api<ICategory>('/categories', { method: 'POST', body: category })
    },
    async updateCategory(id: string, category: Partial<ICategory>): Promise<ICategory> {
      return await $api<ICategory>(`/categories/${id}`, { method: 'PATCH', body: category })
    },
    async deleteCategory(id: string): Promise<void> {
      await $api(`/categories/${id}`, { method: 'DELETE' })
    },

    // Productos (product-lookup)
    async getProducts(query?: ICatalogQuery): Promise<IProductLookup[]> {
      return await $api<IProductLookup[]>('/product-lookup', {
        method: 'GET',
        query: toCatalogQuery(query),
      })
    },
    async createProduct(product: Omit<IProductLookup, 'id'>): Promise<IProductLookup> {
      return await $api<IProductLookup>('/product-lookup', { method: 'POST', body: product })
    },
    async updateProduct(id: string, product: Partial<IProductLookup>): Promise<IProductLookup> {
      return await $api<IProductLookup>(`/product-lookup/${id}`, { method: 'PATCH', body: product })
    },
    async deleteProduct(id: string): Promise<void> {
      await $api(`/product-lookup/${id}`, { method: 'DELETE' })
    },
  }
}

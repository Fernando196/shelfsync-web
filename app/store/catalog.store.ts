import { CatalogService } from '~/services/catalogs'
import type { ICategory } from '~/types/category.type'
import type { IProductLookup } from '~/types/product.type'

export const useCatalogStore = defineStore('catalog', () => {
  const service = CatalogService()

  const categories = ref<ICategory[]>([])
  const products = ref<IProductLookup[]>([])

  const activeCategories = computed(() => categories.value.filter((c) => c.active))

  async function fetchCategories({ force = false } = {}) {
    if (!force && categories.value.length > 0) return categories.value
    const data = await service.getCategories()
    categories.value = [...data].sort((a, b) => a.name.localeCompare(b.name))
    return categories.value
  }

  async function addCategory(category: Omit<ICategory, 'id'>) {
    const created = await service.createCategory(category)
    categories.value.push(created)
    return created
  }

  async function updateCategory(id: string, category: Partial<ICategory>) {
    const updated = await service.updateCategory(id, category)
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = { ...categories.value[index]!, ...updated }
    return updated
  }

  async function deleteCategory(id: string) {
    await service.deleteCategory(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  async function fetchProducts({ force = false } = {}) {
    if (!force && products.value.length > 0) return products.value
    products.value = await service.getProducts()
    return products.value
  }

  async function addProduct(product: Omit<IProductLookup, 'id'>) {
    const created = await service.createProduct(product)
    products.value.unshift(created)
    return created
  }

  async function updateProduct(id: string, product: Partial<IProductLookup>) {
    const updated = await service.updateProduct(id, product)
    const index = products.value.findIndex((p) => p.id === id)
    if (index !== -1) products.value[index] = { ...products.value[index]!, ...updated }
    return updated
  }

  async function deleteProduct(id: string) {
    await service.deleteProduct(id)
    products.value = products.value.filter((p) => p.id !== id)
  }

  return {
    // State
    categories,
    activeCategories,
    products,

    // Actions
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  }
})

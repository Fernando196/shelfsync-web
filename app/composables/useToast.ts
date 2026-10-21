export type ToastType = 'success' | 'error' | 'info'

export interface IToast {
  id: number
  type: ToastType
  message: string
}

let nextId = 0

export function useToast() {
  const toasts = useState<IToast[]>('toasts', () => [])

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, type, message }]
    if (import.meta.client) setTimeout(() => remove(id), duration)
  }

  return {
    toasts,
    remove,
    success: (message: string) => show(message, 'success'),
    info: (message: string) => show(message, 'info'),
    /** Acepta un error del API y muestra su mensaje */
    error: (error: unknown, fallback?: string) =>
      show(typeof error === 'string' ? error : getErrorMessage(error, fallback), 'error', 5000),
  }
}

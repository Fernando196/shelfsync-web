<script setup lang="ts">
  import CustomModal from '../common/Modal/CustomModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { MenuService } from '~/services/menu'
  import { useAuthStore } from '~/store/auth.store'
  import { useMenuStore } from '~/store/menu.store'
  import type { IMenuCatalogItem, IMenuPermissions, IUserMenuAccess } from '~/types/menu.type'
  import type { IUser } from '~/types/user.type'

  const props = defineProps<{ user: IUser }>()

  const { close } = useModal()
  const toast = useToast()
  const service = MenuService()
  const auth = useAuthStore()
  const menuStore = useMenuStore()
  const route = useRoute()

  type PermKey = keyof IMenuPermissions
  const PERMS: { key: PermKey; label: string }[] = [
    { key: 'canView', label: 'Ver' },
    { key: 'canCreate', label: 'Crear' },
    { key: 'canEdit', label: 'Editar' },
    { key: 'canDelete', label: 'Eliminar' },
  ]

  const menus = ref<IMenuCatalogItem[]>([])
  const access = ref<Record<string, IMenuPermissions>>({})
  const loading = ref(true)
  const saving = ref(false)
  /** 404: el API no tiene el módulo de menús · 403: sin permiso para administrar accesos */
  const unavailable = ref<null | 404 | 403>(null)

  // Administrar accesos requiere "Editar" en Usuarios; avisar antes de quitárselo a uno mismo
  const usersMenuId = computed(() => menus.value.find((m) => m.path === '/users')?.id)
  const losesAdmin = computed(
    () =>
      props.user.id === auth.user?.id &&
      usersMenuId.value != null &&
      !access.value[String(usersMenuId.value)]?.canEdit
  )

  const empty = (): IMenuPermissions => ({ canView: false, canCreate: false, canEdit: false, canDelete: false })

  onMounted(async () => {
    try {
      const [catalog, current] = await Promise.all([
        service.getMenuCatalog(),
        service.getUserMenu(props.user.id),
      ])
      menus.value = catalog.filter((m) => m.active)
      const byMenu = new Map(current.map((a) => [String(a.menuId), a]))
      access.value = Object.fromEntries(
        menus.value.map((m) => {
          const a = byMenu.get(String(m.id))
          return [String(m.id), a ? { canView: a.canView, canCreate: a.canCreate, canEdit: a.canEdit, canDelete: a.canDelete } : empty()]
        })
      )
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode
      if (status === 404 || status === 403) unavailable.value = status
      else toast.error(e)
    } finally {
      loading.value = false
    }
  })

  function toggle(menuId: string | number, key: PermKey) {
    const row = access.value[String(menuId)]!
    row[key] = !row[key]
    // Crear/editar/eliminar implican poder ver; quitar "ver" quita todo
    if (key !== 'canView' && row[key]) row.canView = true
    if (key === 'canView' && !row.canView) Object.assign(row, empty())
  }

  function setAll(menuId: string | number, value: boolean) {
    access.value[String(menuId)] = { canView: value, canCreate: value, canEdit: value, canDelete: value }
  }

  const isFull = (menuId: string | number) => PERMS.every((p) => access.value[String(menuId)]?.[p.key])

  async function onSave() {
    saving.value = true
    try {
      const items: IUserMenuAccess[] = menus.value.map((m) => ({ menuId: m.id, ...access.value[String(m.id)]! }))
      await service.putUserMenu(props.user.id, items)
      // Si me edito a mí mismo, refrescar el menú lateral y salir de secciones que ya no veo
      if (props.user.id === auth.user?.id) {
        await menuStore.fetchMenu({ force: true })
        if (!menuStore.findByPath(route.path)) await navigateTo(menuStore.menuItems[0]?.path ?? '/')
      }
      toast.success('Accesos actualizados')
      close(true)
    } catch (e) {
      toast.error(e)
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <CustomModal title="Accesos del usuario" :subtitle="`${user.fullName} · @${user.userName}`" width="max-w-2xl" @close="close()">
    <div v-if="loading" class="flex flex-col gap-2">
      <div v-for="n in 4" :key="n" class="h-12 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div v-else-if="unavailable" class="bg-warning-bg text-warning flex gap-3 rounded-xl p-4 text-sm">
      <Icon :name="CAT_ICONS.ALERT" class="size-5 shrink-0" />
      <p v-if="unavailable === 403">
        No tienes permiso para administrar accesos. Se requiere permiso de <b>Editar</b> en Usuarios.
      </p>
      <p v-else>
        El API todavía no expone el módulo de menús (<code>/menu</code> y <code>/users/:id/menu</code>).
        Mientras tanto, todos los usuarios ven todas las secciones.
      </p>
    </div>

    <div v-else class="border-border overflow-x-auto rounded-xl border">
      <table class="w-full text-sm">
        <thead class="border-border border-b bg-slate-50">
          <tr>
            <th class="text-muted px-4 py-2.5 text-left text-xs font-semibold uppercase">Sección</th>
            <th v-for="perm in PERMS" :key="perm.key" class="text-muted w-20 px-2 py-2.5 text-center text-xs font-semibold uppercase">
              {{ perm.label }}
            </th>
            <th class="text-muted w-20 px-2 py-2.5 text-center text-xs font-semibold uppercase">Todo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="menu in menus" :key="menu.id" class="border-b border-slate-100 last:border-0">
            <td class="px-4 py-3">
              <span class="flex items-center gap-2 font-medium">
                <Icon :name="menu.icon" class="text-subtle size-4" />
                {{ menu.label }}
              </span>
            </td>
            <td v-for="perm in PERMS" :key="perm.key" class="px-2 py-3 text-center">
              <input
                type="checkbox"
                class="accent-accent size-4 cursor-pointer"
                :checked="access[String(menu.id)]?.[perm.key]"
                :aria-label="`${perm.label} ${menu.label}`"
                @change="toggle(menu.id, perm.key)"
              />
            </td>
            <td class="px-2 py-3 text-center">
              <button
                class="btn btn-sm"
                :class="isFull(menu.id) ? 'btn-dark' : ''"
                @click="setAll(menu.id, !isFull(menu.id))"
              >
                <Icon :name="CAT_ICONS.CHECK" class="size-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !unavailable && losesAdmin" class="bg-warning-bg text-warning mt-3 flex gap-2 rounded-xl px-3 py-2 text-sm">
      <Icon :name="CAT_ICONS.ALERT" class="mt-0.5 size-4 shrink-0" />
      Te estás quitando "Editar" en Usuarios: después de guardar ya no podrás administrar accesos.
    </p>

    <template #footer>
      <button class="btn" :disabled="saving" @click="close()">{{ unavailable ? 'Cerrar' : 'Cancelar' }}</button>
      <button v-if="!unavailable && !loading" class="btn btn-primary" :disabled="saving" @click="onSave">
        <Icon v-if="saving" name="lucide:loader-circle" class="size-4 animate-spin" />
        Guardar accesos
      </button>
    </template>
  </CustomModal>
</template>

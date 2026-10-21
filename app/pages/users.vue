<script setup lang="ts">
  import DataTable from '~/components/ui/DataTable.vue'
  import PageHeader from '~/components/ui/PageHeader.vue'
  import TableToolbar from '~/components/ui/TableToolbar.vue'
  import Search from '~/components/common/Search.vue'
  import ConfirmModal from '~/components/common/Modal/ConfirmModal.vue'
  import UserFormModal from '~/components/users/UserFormModal.vue'
  import UserAccessModal from '~/components/users/UserAccessModal.vue'
  import { CAT_ICONS } from '~/const/icons.const'
  import { UserService } from '~/services/users'
  import { useAuthStore } from '~/store/auth.store'
  import type { IUser } from '~/types/user.type'
  import type { TableColumn } from '~/types/table.type'

  useHead({ title: 'Usuarios · ShelfSync' })

  const userService = UserService()
  const auth = useAuthStore()
  const permissions = usePermissions('/users')
  const { openModal } = useModal()
  const toast = useToast()
  const dayjs = useDayjs()

  const search = ref('')
  const { data: users, pending, refresh } = await useAsyncData('users', () => userService.getUsers(), {
    default: () => [] as IUser[],
  })

  const rows = computed(() => {
    const term = search.value.toLowerCase()
    return users.value.filter((u) =>
      [u.fullName, u.userName, u.email].some((v) => v?.toLowerCase().includes(term))
    )
  })

  const columns: TableColumn<IUser>[] = [
    { key: 'fullName', label: 'Usuario' },
    { key: 'email', label: 'Correo', width: '240px' },
    { key: 'createdAt', label: 'Alta', width: '140px' },
  ]

  const initials = (u: IUser) =>
    (u.fullName || u.userName)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('')

  async function handleCreate() {
    const created = await openModal<IUser>(UserFormModal)
    if (!created) return
    // El API da acceso total a los usuarios nuevos; se ajusta después con el botón de accesos
    users.value = [...users.value, created]
  }

  async function handleEdit(user: IUser) {
    const updated = await openModal<IUser>(UserFormModal, { user })
    if (!updated) return
    users.value = users.value.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
    if (user.id === auth.user?.id) auth.user = { ...auth.user, ...updated }
  }

  async function handleAccess(user: IUser) {
    await openModal(UserAccessModal, { user })
  }

  async function handleDelete(user: IUser) {
    const ok = await openModal(ConfirmModal, {
      title: `Eliminar a ${user.fullName}`,
      message: 'El usuario ya no podrá entrar a la web ni a la app móvil.',
      confirmText: 'Eliminar',
      danger: true,
    })
    if (!ok) return
    try {
      await userService.deleteUser(user.id)
      users.value = users.value.filter((u) => u.id !== user.id)
      toast.success('Usuario eliminado')
    } catch (e) {
      toast.error(e)
    }
  }
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <PageHeader title="Usuarios" :subtitle="`${users.length} usuarios con acceso`">
      <template #right>
        <button v-if="permissions.canCreate" class="btn btn-primary" @click="handleCreate">
          <Icon :name="CAT_ICONS.ADD" class="size-4" />
          Nuevo usuario
        </button>
      </template>
    </PageHeader>

    <div>
      <TableToolbar>
        <template #left>
          <Search id="users" v-model="search" placeholder="Buscar por nombre, usuario o correo" :debounce="0" class="sm:max-w-sm" />
        </template>
        <template #actions>
          <button class="btn btn-sm" :disabled="pending" @click="refresh()">
            <Icon :name="CAT_ICONS.REFRESH" class="size-3.5" :class="{ 'animate-spin': pending }" />
          </button>
        </template>
      </TableToolbar>
      <DataTable :columns="columns" :rows="rows" row-key="id" :loading="pending" empty-message="No hay usuarios">
        <template #cell-fullName="{ row }">
          <div class="flex items-center gap-3">
            <span class="bg-primary-light text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {{ initials(row) }}
            </span>
            <div class="min-w-0">
              <p class="truncate font-medium">
                {{ row.fullName }}
                <span v-if="row.id === auth.user?.id" class="badge badge-emerald ml-1 before:hidden">Tú</span>
              </p>
              <p class="text-subtle truncate text-xs">@{{ row.userName }}</p>
            </div>
          </div>
        </template>
        <template #cell-email="{ row }">
          <span class="text-muted">{{ row.email || '—' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-subtle text-xs">{{ row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY') : '—' }}</span>
        </template>
        <template #actions="{ row }">
          <button v-if="permissions.canEdit" class="btn-icon" title="Accesos" @click="handleAccess(row)">
            <Icon :name="CAT_ICONS.SHIELD" class="size-4" />
          </button>
          <button v-if="permissions.canEdit" class="btn-icon" title="Editar" @click="handleEdit(row)">
            <Icon :name="CAT_ICONS.EDIT" class="size-4" />
          </button>
          <button
            v-if="permissions.canDelete && row.id !== auth.user?.id"
            class="btn-icon hover:bg-error-bg! hover:text-error!"
            title="Eliminar"
            @click="handleDelete(row)"
          >
            <Icon :name="CAT_ICONS.DELETE" class="size-4" />
          </button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

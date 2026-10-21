<script setup lang="ts">
  import CustomModal from '../common/Modal/CustomModal.vue'
  import InputWrapper from '../common/InputWrapper.vue'
  import { UserService } from '~/services/users'
  import type { IUser, IUserPayload } from '~/types/user.type'

  const props = defineProps<{ user?: IUser }>()
  const isEdit = computed(() => !!props.user)

  const { close } = useModal()
  const toast = useToast()

  const form = reactive({
    fullName: props.user?.fullName ?? '',
    userName: props.user?.userName ?? '',
    email: props.user?.email ?? '',
    password: '',
  })
  const changePassword = ref(!isEdit.value)
  const errors = reactive<Record<string, string | null>>({})
  const apiError = ref<string | null>(null)
  const saving = ref(false)

  function validate() {
    Object.keys(errors).forEach((k) => (errors[k] = null))
    if (!form.fullName.trim()) errors.fullName = 'Obligatorio'
    if (!form.userName.trim()) errors.userName = 'Obligatorio'
    else if (/\s/.test(form.userName.trim())) errors.userName = 'Sin espacios'
    if (form.email.trim().length > 50) errors.email = 'Máximo 50 caracteres'
    else if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Correo inválido'
    if (changePassword.value && form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
    return !Object.values(errors).some(Boolean)
  }

  async function onSave() {
    apiError.value = null
    if (!validate()) return
    saving.value = true
    try {
      const payload: IUserPayload = {
        fullName: form.fullName.trim(),
        userName: form.userName.trim().toLowerCase(),
        email: form.email.trim() || undefined,
      }
      if (changePassword.value) payload.password = form.password
      const saved = isEdit.value
        ? await UserService().patchUser(props.user!.id, payload)
        : await UserService().postUser(payload)
      toast.success(isEdit.value ? 'Usuario actualizado' : 'Usuario creado')
      close(saved)
    } catch (e) {
      apiError.value = getErrorMessage(e)
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <CustomModal :title="isEdit ? 'Editar usuario' : 'Nuevo usuario'" subtitle="Acceso a la web y a la app móvil" @close="close()">
    <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="onSave">
      <InputWrapper id="user-fullname" v-model="form.fullName" label="Nombre completo" required :error="errors.fullName" class="sm:col-span-2" />
      <InputWrapper
        id="user-username"
        v-model="form.userName"
        label="Usuario"
        placeholder="juan.perez"
        required
        :error="errors.userName"
      />
      <InputWrapper id="user-email" v-model="form.email" label="Correo electrónico" type="email" :error="errors.email" />

      <label v-if="isEdit" class="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
        <input v-model="changePassword" type="checkbox" class="accent-accent size-4" />
        Cambiar contraseña
      </label>
      <InputWrapper
        v-if="changePassword"
        id="user-password"
        v-model="form.password"
        :label="isEdit ? 'Nueva contraseña' : 'Contraseña'"
        type="password"
        autocomplete="new-password"
        required
        :error="errors.password"
        class="sm:col-span-2"
      />
      <p v-if="apiError" class="bg-error-bg text-error-text rounded-xl px-3 py-2 text-sm sm:col-span-2">{{ apiError }}</p>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <button class="btn" :disabled="saving" @click="close()">Cancelar</button>
      <button class="btn btn-primary" :disabled="saving" @click="onSave">
        <Icon v-if="saving" name="lucide:loader-circle" class="size-4 animate-spin" />
        {{ isEdit ? 'Guardar cambios' : 'Crear usuario' }}
      </button>
    </template>
  </CustomModal>
</template>

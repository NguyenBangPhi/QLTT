<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Library, LogIn } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'
import { normalizeApiError } from '~/lib/api-error'

definePageMeta({ layout: 'auth', public: true })
useHead({ title: 'Đăng nhập · Thư viện Đại học' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

function resolveTarget(redirect: unknown): string {
  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return auth.homePath
  }

  const resolved = router.resolve(redirect)
  if (!resolved.matched.length || resolved.path === '/login') return auth.homePath

  const allowed = resolved.meta.roles
  if (allowed?.length && (!auth.role || !allowed.includes(auth.role))) return auth.homePath

  return redirect
}

const schema = toTypedSchema(
  z.object({
    username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
)

const { handleSubmit, errors, defineField, isSubmitting } = useForm({ validationSchema: schema })
const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.login(values.username, values.password)
    await navigateTo(resolveTarget(route.query.redirect))
  } catch (error) {
    toast.error(normalizeApiError(error).message)
  }
})
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col items-center text-center">
      <div class="mb-3 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Library class="size-6" aria-hidden="true" />
      </div>
      <h1 class="text-xl font-semibold">Thư viện Đại học</h1>
      <p class="mt-1 text-sm text-muted-foreground">Đăng nhập để tiếp tục</p>
    </div>

    <UiCard class="p-6">
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-1.5">
          <label for="username" class="text-sm font-medium">Tên đăng nhập</label>
          <UiInput
            id="username"
            v-model="username"
            v-bind="usernameAttrs"
            autocomplete="username"
            placeholder="Nhập tên đăng nhập"
            :aria-invalid="Boolean(errors.username)"
            :aria-describedby="errors.username ? 'username-error' : undefined"
          />
          <p v-if="errors.username" id="username-error" class="text-xs text-destructive">
            {{ errors.username }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Mật khẩu</label>
          <UiInput
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            autocomplete="current-password"
            placeholder="Nhập mật khẩu"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'password-error' : undefined"
          />
          <p v-if="errors.password" id="password-error" class="text-xs text-destructive">
            {{ errors.password }}
          </p>
        </div>

        <UiButton type="submit" class="w-full" :loading="isSubmitting">
          <LogIn v-if="!isSubmitting" aria-hidden="true" />
          Đăng nhập
        </UiButton>
      </form>
    </UiCard>

    <p class="mt-4 text-center text-xs text-muted-foreground">
      Tài khoản thử nghiệm: <code class="font-medium">admin01</code> ·
      <code class="font-medium">thuthu01</code> · <code class="font-medium">sv001</code> — mật khẩu
      <code class="font-medium">123456</code>
    </p>
  </div>
</template>

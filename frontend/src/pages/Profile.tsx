import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { LogOut, Mail, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UPDATE_PROFILE_MUTATION } from '../graphql/mutations'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { getInitials } from '../lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function Profile() {
  const { user, updateUser, signOut } = useAuth()
  const navigate = useNavigate()

  const [updateProfile, { loading, error }] = useMutation(UPDATE_PROFILE_MUTATION)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  async function onSubmit(data: ProfileForm) {
    try {
      const result = await updateProfile({ variables: data })
      updateUser(result.data.updateProfile)
      toast.success('Perfil atualizado com sucesso!')
    } catch (e) {
      console.error(e)
    }
  }

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome completo"
            placeholder="Seu nome completo"
            leftIcon={<UserRound className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <Input
              label="E-mail"
              type="email"
              placeholder="mail@exemplo.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              disabled
              {...register('email')}
            />
            <p className="mt-1 text-sm text-gray-400">O e-mail não pode ser alterado</p>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error.graphQLErrors[0]?.message || 'Erro ao salvar'}
            </p>
          )}

          <Button type="submit" loading={loading} disabled={!isDirty} className="w-full mt-2">
            Salvar alterações
          </Button>
        </form>

        <Button variant="ghost" className="w-full mt-4 border text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  )
}

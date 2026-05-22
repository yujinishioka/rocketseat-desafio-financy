import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { RESET_PASSWORD_MUTATION } from '../graphql/mutations'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z
  .object({
    newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
type ResetForm = z.infer<typeof schema>

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [success, setSuccess] = useState(false)

  const [resetPassword, { loading, error }] = useMutation(RESET_PASSWORD_MUTATION)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(schema),
  })

  // Token ausente na URL
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h1 className="text-xl font-bold text-gray-900">Link inválido</h1>
          <p className="mt-2 text-sm text-gray-500">
            Este link de recuperação é inválido ou está incompleto. Solicite um novo.
          </p>
          <Link to="/forgot-password" className="mt-6 block">
            <Button className="w-full">Solicitar novo link</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">Senha redefinida!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sua senha foi alterada com sucesso. Faça login com a nova senha.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate('/')}>
            Ir para o login
          </Button>
        </div>
      </div>
    )
  }

  async function onSubmit(data: ResetForm) {
    try {
      await resetPassword({ variables: { token, newPassword: data.newPassword } })
      setSuccess(true)
    } catch {
      // erro tratado pelo Apollo e exibido abaixo
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Nova senha</h1>
          <p className="mt-1 text-sm text-gray-500">
            Escolha uma senha segura para sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a senha"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error.graphQLErrors[0]?.message || 'Erro ao redefinir senha'}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Redefinir senha
          </Button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}

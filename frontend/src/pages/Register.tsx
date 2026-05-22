import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Mail, Lock, UserRound, LogIn } from 'lucide-react'
import { REGISTER_MUTATION } from '../graphql/mutations'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { FinancyLogo } from '../components/ui/Logo'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})
type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION)

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterForm) {
    try {
      const result = await register({ variables: data })
      const { token, user } = result.data.register
      signIn(token, user)
      navigate('/dashboard')
    } catch {
      // erro tratado pelo Apollo
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <FinancyLogo />

        <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900">Criar conta</h1>
            <p className="mt-1 text-sm text-gray-500">Comece a controlar suas finanças ainda hoje</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome completo"
              leftIcon={<UserRound className="h-4 w-4" />}
              error={errors.name?.message}
              {...formRegister('name')}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="mail@exemplo.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...formRegister('email')}
            />

            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...formRegister('password')}
              />
              {!errors.password && (
                <p className="mt-1 text-xs text-gray-400">A senha deve ter no mínimo 8 caracteres</p>
              )}
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">
                {error.graphQLErrors[0]?.message || 'Erro ao criar conta'}
              </p>
            )}

            <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
              Cadastrar
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <p className="mt-4 text-center text-sm text-gray-500">Já tem uma conta?</p>
            <Link to="/">
              <Button variant="secondary" size="lg" className="mt-2 w-full">
                <LogIn className="h-4 w-4" />
                Fazer login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

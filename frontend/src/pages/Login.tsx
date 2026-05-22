import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Mail, Lock, UserRoundPlus } from 'lucide-react'
import { LOGIN_MUTATION } from '../graphql/mutations'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { FinancyLogo } from '../components/ui/Logo'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [remember, setRemember] = useState(false)
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    try {
      const result = await login({ variables: data })
      const { token, user } = result.data.login
      signIn(token, user, remember)
      navigate('/dashboard')
    } catch {
      // erro tratado pelo Apollo e exibido abaixo
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <FinancyLogo />

        <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900">Fazer login</h1>
            <p className="mt-1 text-sm text-gray-500">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="mail@exemplo.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-4 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={remember ? {
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C%2Fsvg%3E")`,
                      backgroundSize: '100% 100%',
                    } : {}}
                    className="h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-colors checked:border-primary-600 checked:bg-primary-600"
                  />
                  <span className="text-xs text-gray-500">Lembrar-me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  Recuperar senha
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">
                {error.graphQLErrors[0]?.message || 'Erro ao fazer login'}
              </p>
            )}

            <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <p className="mt-4 text-center text-sm text-gray-500">Ainda não tem uma conta?</p>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="mt-2 w-full">
                <UserRoundPlus className="h-4 w-4" />
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { FORGOT_PASSWORD_MUTATION } from '../graphql/mutations'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { FinancyLogo } from '../components/ui/Logo'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})
type ForgotForm = z.infer<typeof schema>

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: ForgotForm) {
    try {
      await forgotPassword({ variables: { email: data.email } })
      setSubmittedEmail(data.email)
      setSent(true)
    } catch {
      // Mesmo em caso de erro, mostramos sucesso para não vazar
      // se o e-mail existe ou não no banco
      setSubmittedEmail(data.email)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <FinancyLogo />
          <div className="w-full rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-14 w-14 text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Verifique seu e-mail</h1>
            <p className="mt-3 text-sm text-gray-500">
              Se <strong>{submittedEmail}</strong> estiver cadastrado, você receberá um link para
              redefinir sua senha em instantes.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Não esqueça de verificar a pasta de spam.
            </p>
            <Link to="/" className="mt-6 block">
              <Button variant="secondary" className="w-full">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <FinancyLogo />

        <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900">Recuperar senha</h1>
            <p className="mt-1 text-sm text-gray-500">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
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

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Enviar link de recuperação
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
    </div>
  )
}

import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import { hashPassword, comparePassword, generateToken } from '../../lib/auth.js'
import { sendPasswordResetEmail } from '../../lib/mailer.js'
import type { Context } from '../../context.js'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export const authResolvers = {
  Mutation: {
    register: async (
      _: unknown,
      args: { name: string; email: string; password: string },
      ctx: Context
    ) => {
      const result = registerSchema.safeParse(args)
      if (!result.success) {
        throw new GraphQLError(result.error.errors[0].message)
      }

      const { name, email, password } = result.data

      const existing = await ctx.prisma.user.findUnique({ where: { email } })
      if (existing) {
        throw new GraphQLError('Este email já está em uso')
      }

      const hashedPassword = await hashPassword(password)
      const user = await ctx.prisma.user.create({
        data: { name, email, password: hashedPassword },
      })

      return { token: generateToken(user.id), user }
    },

    login: async (
      _: unknown,
      args: { email: string; password: string },
      ctx: Context
    ) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: args.email } })
      if (!user) throw new GraphQLError('Email ou senha inválidos')

      const valid = await comparePassword(args.password, user.password)
      if (!valid) throw new GraphQLError('Email ou senha inválidos')

      return { token: generateToken(user.id), user }
    },

    forgotPassword: async (
      _: unknown,
      args: { email: string },
      ctx: Context
    ) => {
      // Sempre retorna true para não vazar se o e-mail existe ou não
      const user = await ctx.prisma.user.findUnique({ where: { email: args.email } })
      if (!user) return true

      const token = randomBytes(32).toString('hex')
      const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: token, passwordResetExpiry: expiry },
      })

      await sendPasswordResetEmail(user.email, user.name, token)
      return true
    },

    resetPassword: async (
      _: unknown,
      args: { token: string; newPassword: string },
      ctx: Context
    ) => {
      if (args.newPassword.length < 8) {
        throw new GraphQLError('A senha deve ter no mínimo 8 caracteres')
      }

      const user = await ctx.prisma.user.findFirst({
        where: {
          passwordResetToken: args.token,
          passwordResetExpiry: { gt: new Date() }, // token ainda válido
        },
      })

      if (!user) {
        throw new GraphQLError('Token inválido ou expirado. Solicite um novo link.')
      }

      const hashedPassword = await hashPassword(args.newPassword)

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      })

      return true
    },
  },
}

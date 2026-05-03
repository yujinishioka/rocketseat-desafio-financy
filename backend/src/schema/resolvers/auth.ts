import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { hashPassword, comparePassword, generateToken } from '../../lib/auth.js'
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
  },
}

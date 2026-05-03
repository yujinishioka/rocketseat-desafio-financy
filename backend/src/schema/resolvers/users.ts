import { GraphQLError } from 'graphql'
import type { Context } from '../../context.js'

function requireAuth(ctx: Context) {
  if (!ctx.userId) throw new GraphQLError('Não autenticado', { extensions: { code: 'UNAUTHENTICATED' } })
  return ctx.userId
}

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)
      const user = await ctx.prisma.user.findUnique({ where: { id: userId } })
      if (!user) throw new GraphQLError('Usuário não encontrado')
      return user
    },
  },
  Mutation: {
    updateProfile: async (
      _: unknown,
      args: { name?: string; email?: string },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx)

      if (args.email) {
        const existing = await ctx.prisma.user.findFirst({
          where: { email: args.email, NOT: { id: userId } },
        })
        if (existing) throw new GraphQLError('Este email já está em uso')
      }

      return ctx.prisma.user.update({
        where: { id: userId },
        data: {
          ...(args.name && { name: args.name }),
          ...(args.email && { email: args.email }),
        },
      })
    },
  },
}

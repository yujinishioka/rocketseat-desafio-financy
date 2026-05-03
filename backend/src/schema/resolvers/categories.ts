import { GraphQLError } from 'graphql'
import type { Context } from '../../context.js'

function requireAuth(ctx: Context) {
  if (!ctx.userId) throw new GraphQLError('Não autenticado', { extensions: { code: 'UNAUTHENTICATED' } })
  return ctx.userId
}

export const categoryResolvers = {
  Query: {
    categories: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)

      const categories = await ctx.prisma.category.findMany({
        where: { userId },
        include: { _count: { select: { transactions: true } } },
        orderBy: { name: 'asc' },
      })

      return categories.map((c) => ({
        ...c,
        transactionCount: c._count.transactions,
      }))
    },

    categorySummary: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)

      const [totalCategories, totalTransactions, categories] = await Promise.all([
        ctx.prisma.category.count({ where: { userId } }),
        ctx.prisma.transaction.count({ where: { userId } }),
        ctx.prisma.category.findMany({
          where: { userId },
          include: { _count: { select: { transactions: true } } },
        }),
      ])

      const sorted = categories.sort((a, b) => b._count.transactions - a._count.transactions)
      const mostUsed = sorted[0] ?? null

      return {
        totalCategories,
        totalTransactions,
        mostUsedCategory: mostUsed
          ? { ...mostUsed, transactionCount: mostUsed._count.transactions }
          : null,
        mostUsedCount: mostUsed?._count.transactions ?? 0,
      }
    },
  },

  Mutation: {
    createCategory: async (
      _: unknown,
      args: { name: string; description?: string; icon: string; color: string },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx)
      const category = await ctx.prisma.category.create({
        data: { ...args, userId },
        include: { _count: { select: { transactions: true } } },
      })
      return { ...category, transactionCount: category._count.transactions }
    },

    updateCategory: async (
      _: unknown,
      args: { id: string; name?: string; description?: string; icon?: string; color?: string },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx)
      const { id, ...data } = args

      const existing = await ctx.prisma.category.findFirst({ where: { id, userId } })
      if (!existing) throw new GraphQLError('Categoria não encontrada')

      const category = await ctx.prisma.category.update({
        where: { id },
        data,
        include: { _count: { select: { transactions: true } } },
      })
      return { ...category, transactionCount: category._count.transactions }
    },

    deleteCategory: async (_: unknown, args: { id: string }, ctx: Context) => {
      const userId = requireAuth(ctx)
      const existing = await ctx.prisma.category.findFirst({ where: { id: args.id, userId } })
      if (!existing) throw new GraphQLError('Categoria não encontrada')

      await ctx.prisma.category.delete({ where: { id: args.id } })
      return true
    },
  },
}

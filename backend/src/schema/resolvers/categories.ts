import { GraphQLError } from 'graphql'
import type { Context } from '../../context.js'

function requireAuth(ctx: Context) {
  if (!ctx.userId) throw new GraphQLError('Não autenticado', { extensions: { code: 'UNAUTHENTICATED' } })
  return ctx.userId
}

// Busca o total de amount de transações por categoria em uma única query de groupBy
async function getAmountMap(userId: string, ctx: Context): Promise<Map<string, number>> {
  const rows = await ctx.prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, categoryId: { not: null } },
    _sum: { amount: true },
  })
  return new Map(rows.map((r) => [r.categoryId as string, r._sum.amount ?? 0]))
}

export const categoryResolvers = {
  Query: {
    categories: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)

      const [categories, amountMap] = await Promise.all([
        ctx.prisma.category.findMany({
          where: { userId },
          include: { _count: { select: { transactions: true } } },
          orderBy: { name: 'asc' },
        }),
        getAmountMap(userId, ctx),
      ])

      return categories.map((c) => ({
        ...c,
        transactionCount: c._count.transactions,
        totalAmount: amountMap.get(c.id) ?? 0,
      }))
    },

    categorySummary: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)

      const [totalCategories, totalTransactions, categories, amountMap] = await Promise.all([
        ctx.prisma.category.count({ where: { userId } }),
        ctx.prisma.transaction.count({ where: { userId } }),
        ctx.prisma.category.findMany({
          where: { userId },
          include: { _count: { select: { transactions: true } } },
        }),
        getAmountMap(userId, ctx),
      ])

      const sorted = categories.sort((a, b) => b._count.transactions - a._count.transactions)
      const mostUsed = sorted[0] ?? null

      return {
        totalCategories,
        totalTransactions,
        mostUsedCategory: mostUsed
          ? { ...mostUsed, transactionCount: mostUsed._count.transactions, totalAmount: amountMap.get(mostUsed.id) ?? 0 }
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
      return { ...category, transactionCount: category._count.transactions, totalAmount: 0 }
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

      const [category, amountMap] = await Promise.all([
        ctx.prisma.category.update({
          where: { id },
          data,
          include: { _count: { select: { transactions: true } } },
        }),
        getAmountMap(userId, ctx),
      ])
      return { ...category, transactionCount: category._count.transactions, totalAmount: amountMap.get(id) ?? 0 }
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

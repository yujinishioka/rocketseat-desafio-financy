import { GraphQLError } from 'graphql'
import type { Context } from '../../context.js'

function requireAuth(ctx: Context) {
  if (!ctx.userId) throw new GraphQLError('Não autenticado', { extensions: { code: 'UNAUTHENTICATED' } })
  return ctx.userId
}

function formatTransaction(t: any) {
  return {
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    category: t.category
      ? { ...t.category, transactionCount: t.category._count?.transactions ?? 0 }
      : null,
  }
}

export const transactionResolvers = {
  Query: {
    transactions: async (
      _: unknown,
      args: {
        search?: string
        type?: 'INCOME' | 'EXPENSE'
        categoryId?: string
        month?: number
        year?: number
        page?: number
        limit?: number
      },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx)
      const page = args.page ?? 1
      const limit = args.limit ?? 10
      const skip = (page - 1) * limit

      const where: any = { userId }
      if (args.search) where.description = { contains: args.search }
      if (args.type) where.type = args.type
      if (args.categoryId) where.categoryId = args.categoryId

      if (args.month && args.year) {
        const start = new Date(args.year, args.month - 1, 1)
        const end = new Date(args.year, args.month, 1)
        where.date = { gte: start, lt: end }
      } else if (args.year) {
        const start = new Date(args.year, 0, 1)
        const end = new Date(args.year + 1, 0, 1)
        where.date = { gte: start, lt: end }
      }

      const [transactions, total] = await Promise.all([
        ctx.prisma.transaction.findMany({
          where,
          include: {
            category: { include: { _count: { select: { transactions: true } } } },
          },
          orderBy: { date: 'desc' },
          skip,
          take: limit,
        }),
        ctx.prisma.transaction.count({ where }),
      ])

      return {
        transactions: transactions.map(formatTransaction),
        total,
        pages: Math.ceil(total / limit),
      }
    },

    recentTransactions: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)
      const transactions = await ctx.prisma.transaction.findMany({
        where: { userId },
        include: {
          category: { include: { _count: { select: { transactions: true } } } },
        },
        orderBy: { date: 'desc' },
        take: 5,
      })
      return transactions.map(formatTransaction)
    },

    transactionSummary: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireAuth(ctx)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      const [allTransactions, monthlyTransactions] = await Promise.all([
        ctx.prisma.transaction.findMany({ where: { userId }, select: { amount: true, type: true } }),
        ctx.prisma.transaction.findMany({
          where: { userId, date: { gte: startOfMonth, lt: endOfMonth } },
          select: { amount: true, type: true },
        }),
      ])

      const totalBalance = allTransactions.reduce(
        (acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount),
        0
      )
      const monthlyIncome = monthlyTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0)
      const monthlyExpense = monthlyTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0)

      return { totalBalance, monthlyIncome, monthlyExpense }
    },
  },

  Mutation: {
    createTransaction: async (
      _: unknown,
      args: {
        description: string
        date: string
        amount: number
        type: 'INCOME' | 'EXPENSE'
        categoryId?: string
      },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx)
      const transaction = await ctx.prisma.transaction.create({
        data: {
          description: args.description,
          date: new Date(args.date),
          amount: args.amount,
          type: args.type,
          userId,
          categoryId: args.categoryId ?? null,
        },
        include: {
          category: { include: { _count: { select: { transactions: true } } } },
        },
      })
      return formatTransaction(transaction)
    },

    updateTransaction: async (
      _: unknown,
      args: {
        id: string
        description?: string
        date?: string
        amount?: number
        type?: 'INCOME' | 'EXPENSE'
        categoryId?: string
      },
      ctx: Context
    ) => {
      const userId = requireAuth(ctx)
      const { id, date, ...rest } = args

      const existing = await ctx.prisma.transaction.findFirst({ where: { id, userId } })
      if (!existing) throw new GraphQLError('Transação não encontrada')

      const transaction = await ctx.prisma.transaction.update({
        where: { id },
        data: {
          ...rest,
          ...(date && { date: new Date(date) }),
        },
        include: {
          category: { include: { _count: { select: { transactions: true } } } },
        },
      })
      return formatTransaction(transaction)
    },

    deleteTransaction: async (_: unknown, args: { id: string }, ctx: Context) => {
      const userId = requireAuth(ctx)
      const existing = await ctx.prisma.transaction.findFirst({ where: { id: args.id, userId } })
      if (!existing) throw new GraphQLError('Transação não encontrada')

      await ctx.prisma.transaction.delete({ where: { id: args.id } })
      return true
    },
  },
}

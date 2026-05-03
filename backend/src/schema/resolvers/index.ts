import { authResolvers } from './auth.js'
import { userResolvers } from './users.js'
import { transactionResolvers } from './transactions.js'
import { categoryResolvers } from './categories.js'

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...transactionResolvers.Query,
    ...categoryResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...transactionResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
}

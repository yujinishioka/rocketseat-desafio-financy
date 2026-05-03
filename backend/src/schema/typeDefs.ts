export const typeDefs = /* GraphQL */ `
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    icon: String!
    color: String!
    transactionCount: Int!
    createdAt: String!
  }

  type Transaction {
    id: ID!
    description: String!
    date: String!
    amount: Float!
    type: TransactionType!
    category: Category
    categoryId: String
    createdAt: String!
  }

  type TransactionsResult {
    transactions: [Transaction!]!
    total: Int!
    pages: Int!
  }

  type TransactionSummary {
    totalBalance: Float!
    monthlyIncome: Float!
    monthlyExpense: Float!
  }

  type CategorySummary {
    totalCategories: Int!
    totalTransactions: Int!
    mostUsedCategory: Category
    mostUsedCount: Int!
  }

  type Query {
    me: User!
    transactions(
      search: String
      type: TransactionType
      categoryId: String
      month: Int
      year: Int
      page: Int
      limit: Int
    ): TransactionsResult!
    recentTransactions: [Transaction!]!
    transactionSummary: TransactionSummary!
    categories: [Category!]!
    categorySummary: CategorySummary!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createTransaction(
      description: String!
      date: String!
      amount: Float!
      type: TransactionType!
      categoryId: String
    ): Transaction!

    updateTransaction(
      id: ID!
      description: String
      date: String
      amount: Float
      type: TransactionType
      categoryId: String
    ): Transaction!

    deleteTransaction(id: ID!): Boolean!

    createCategory(
      name: String!
      description: String
      icon: String!
      color: String!
    ): Category!

    updateCategory(
      id: ID!
      name: String
      description: String
      icon: String
      color: String
    ): Category!

    deleteCategory(id: ID!): Boolean!

    updateProfile(name: String, email: String): User!
  }
`

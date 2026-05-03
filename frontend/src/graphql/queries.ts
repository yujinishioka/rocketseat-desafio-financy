import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      createdAt
    }
  }
`

export const TRANSACTION_SUMMARY_QUERY = gql`
  query TransactionSummary {
    transactionSummary {
      totalBalance
      monthlyIncome
      monthlyExpense
    }
  }
`

export const RECENT_TRANSACTIONS_QUERY = gql`
  query RecentTransactions {
    recentTransactions {
      id
      description
      date
      amount
      type
      category {
        id
        name
        icon
        color
      }
    }
  }
`

export const TRANSACTIONS_QUERY = gql`
  query Transactions(
    $search: String
    $type: TransactionType
    $categoryId: String
    $month: Int
    $year: Int
    $page: Int
    $limit: Int
  ) {
    transactions(
      search: $search
      type: $type
      categoryId: $categoryId
      month: $month
      year: $year
      page: $page
      limit: $limit
    ) {
      transactions {
        id
        description
        date
        amount
        type
        categoryId
        category {
          id
          name
          icon
          color
        }
      }
      total
      pages
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      description
      icon
      color
      transactionCount
    }
  }
`

export const CATEGORY_SUMMARY_QUERY = gql`
  query CategorySummary {
    categorySummary {
      totalCategories
      totalTransactions
      mostUsedCategory {
        id
        name
        icon
        color
        transactionCount
      }
      mostUsedCount
    }
  }
`

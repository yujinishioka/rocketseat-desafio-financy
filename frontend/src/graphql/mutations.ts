import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $email: String) {
    updateProfile(name: $name, email: $email) {
      id
      name
      email
    }
  }
`

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction(
    $description: String!
    $date: String!
    $amount: Float!
    $type: TransactionType!
    $categoryId: String
  ) {
    createTransaction(
      description: $description
      date: $date
      amount: $amount
      type: $type
      categoryId: $categoryId
    ) {
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

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction(
    $id: ID!
    $description: String
    $date: String
    $amount: Float
    $type: TransactionType
    $categoryId: String
  ) {
    updateTransaction(
      id: $id
      description: $description
      date: $date
      amount: $amount
      type: $type
      categoryId: $categoryId
    ) {
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

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory(
    $name: String!
    $description: String
    $icon: String!
    $color: String!
  ) {
    createCategory(name: $name, description: $description, icon: $icon, color: $color) {
      id
      name
      description
      icon
      color
      transactionCount
    }
  }
`

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory(
    $id: ID!
    $name: String
    $description: String
    $icon: String
    $color: String
  ) {
    updateCategory(id: $id, name: $name, description: $description, icon: $icon, color: $color) {
      id
      name
      description
      icon
      color
      transactionCount
    }
  }
`

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

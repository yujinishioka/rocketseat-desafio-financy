import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token =
    localStorage.getItem('financy:token') ||
    sessionStorage.getItem('financy:token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('financy:token')
        sessionStorage.removeItem('financy:token')
        window.location.href = '/'
      }
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})

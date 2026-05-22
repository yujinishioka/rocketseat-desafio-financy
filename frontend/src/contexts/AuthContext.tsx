import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useApolloClient } from '@apollo/client'
import { ME_QUERY } from '../graphql/queries'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (token: string, user: User, remember?: boolean) => void
  signOut: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const client = useApolloClient()

  useEffect(() => {
    const token =
      localStorage.getItem('financy:token') ||
      sessionStorage.getItem('financy:token')
    if (!token) {
      setIsLoading(false)
      return
    }

    client
      .query({ query: ME_QUERY, fetchPolicy: 'network-only' })
      .then(({ data }) => {
        if (data?.me) setUser(data.me)
      })
      .catch(() => {
        localStorage.removeItem('financy:token')
        sessionStorage.removeItem('financy:token')
      })
      .finally(() => setIsLoading(false))
  }, [client])

  function signIn(token: string, userData: User, remember = false) {
    if (remember) {
      localStorage.setItem('financy:token', token)
    } else {
      sessionStorage.setItem('financy:token', token)
    }
    setUser(userData)
  }

  function signOut() {
    localStorage.removeItem('financy:token')
    sessionStorage.removeItem('financy:token')
    setUser(null)
    client.clearStore()
  }

  function updateUser(userData: User) {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

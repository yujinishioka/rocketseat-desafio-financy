import { verifyToken } from './lib/auth.js'
import { prisma } from './lib/prisma.js'

export type Context = {
  userId: string | null
  prisma: typeof prisma
}

export async function createContext(initialContext: { request: Request }): Promise<Context> {
  const auth = initialContext.request.headers.get('authorization')
  let userId: string | null = null

  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7)
    try {
      const payload = verifyToken(token)
      userId = payload.userId
    } catch {
      // token inválido ou expirado
    }
  }

  return { prisma, userId }
}

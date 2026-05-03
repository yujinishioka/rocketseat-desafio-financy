import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import 'dotenv/config'
import { schema } from './schema/index.js'
import { createContext } from './context.js'

const yoga = createYoga({
  schema,
  context: createContext,
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  graphiql: true,
})

const server = createServer(yoga)
const PORT = Number(process.env.PORT) || 3333

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/graphql`)
})

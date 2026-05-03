<p align="center">
  <img src="figma/Logo.svg" alt="Financy" width="200" />
</p>

<p align="center">
  Gerencie suas finanças pessoais com uma interface moderna e intuitiva.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" />
</p>

---

## Sobre o projeto

O **Financy** é uma aplicação fullstack de gerenciamento de finanças pessoais desenvolvida como desafio de pós-graduação da [Rocketseat](https://rocketseat.com.br). Ela permite que usuários registrem e organizem transações financeiras por meio de categorias personalizadas, acompanhem seu saldo e visualizem um resumo mensal de receitas e despesas.

### Funcionalidades

- **Autenticação** — cadastro e login com JWT, sessão persistente
- **Dashboard** — saldo total, receitas e despesas do mês, últimas 5 transações
- **Transações** — listagem com busca, filtros por tipo, categoria e período, paginação e CRUD completo
- **Categorias** — criação com ícone e cor personalizados, contagem de uso e CRUD completo
- **Perfil** — edição de nome e e-mail

---

## Tecnologias

### Backend
| Tecnologia | Função |
|---|---|
| [Node.js](https://nodejs.org) + [TypeScript](https://typescriptlang.org) | Runtime e tipagem estática |
| [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) | Servidor GraphQL (HTTP, CORS e GraphiQL embutidos) |
| [Prisma](https://prisma.io) | ORM e migrations |
| [SQLite](https://sqlite.org) | Banco de dados |
| [JWT](https://jwt.io) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Autenticação e hash de senha |
| [Zod](https://zod.dev) | Validação de dados |

### Frontend
| Tecnologia | Função |
|---|---|
| [React 18](https://react.dev) + [TypeScript](https://typescriptlang.org) | UI e tipagem |
| [Vite](https://vitejs.dev) | Bundler |
| [Apollo Client](https://apollographql.com/docs/react) | Cliente GraphQL |
| [React Router DOM](https://reactrouter.com) | Roteamento SPA |
| [Tailwind CSS](https://tailwindcss.com) | Estilização utilitária |
| [Radix UI](https://radix-ui.com) | Componentes acessíveis (Dialog, Select) |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Formulários e validação |
| [Lucide React](https://lucide.dev) | Ícones |

---

## Estrutura do repositório

```
rocketseat-desafio-financy/
├── backend/          # API GraphQL
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts          # Entry point do servidor
│       ├── context.ts        # Contexto GraphQL (auth via JWT)
│       ├── lib/
│       │   ├── auth.ts       # JWT e bcrypt
│       │   └── prisma.ts     # Instância do Prisma Client
│       └── schema/
│           ├── typeDefs.ts   # Schema GraphQL
│           └── resolvers/    # Queries e Mutations
└── frontend/         # SPA React
    └── src/
        ├── components/
        │   ├── layout/       # TopNav e Layout
        │   └── ui/           # Button, Input, Dialog, Select, Badge...
        ├── contexts/         # AuthContext (estado global do usuário)
        ├── graphql/          # Queries e Mutations Apollo
        ├── lib/              # Apollo Client e utilitários
        └── pages/            # Login, Register, Dashboard, Transactions, Categories, Profile
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org) v18 ou superior
- [npm](https://npmjs.com) v9 ou superior

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/yuu-nishioka/rocketseat-desafio-financy.git
cd rocketseat-desafio-financy
```

### 2. Configure e inicie o Backend

```bash
cd backend

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o `.env` e preencha o `JWT_SECRET` com uma string segura (você pode gerar uma com o comando abaixo):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O `.env` deve ficar assim:

```env
JWT_SECRET=sua_chave_gerada_aqui
DATABASE_URL=file:./dev.db
FRONTEND_URL=http://localhost:5173
PORT=3333
```

Instale as dependências, gere o Prisma Client e rode as migrations:

```bash
npm install
npm run db:generate
npm run db:migrate
```

Inicie o servidor:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3333/graphql`. O **GraphiQL** (playground interativo) também fica disponível nesse endereço pelo navegador.

---

### 3. Configure e inicie o Frontend

Em um novo terminal:

```bash
cd frontend

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

O `.env` já vem pré-configurado para apontar ao backend local:

```env
VITE_BACKEND_URL=http://localhost:3333/graphql
```

Instale as dependências e inicie:

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | `a3f8c2e1d4b7...` |
| `DATABASE_URL` | Caminho do banco SQLite | `file:./dev.db` |
| `FRONTEND_URL` | Origem permitida no CORS | `http://localhost:5173` |
| `PORT` | Porta do servidor | `3333` |

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_BACKEND_URL` | URL da API GraphQL | `http://localhost:3333/graphql` |

---

## Scripts disponíveis

### Backend

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo watch (tsx) |
| `npm run build` | Compila para JavaScript (`dist/`) |
| `npm run start` | Inicia a versão compilada |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Roda as migrations no banco |
| `npm run db:studio` | Abre o Prisma Studio (UI para o banco) |

### Frontend

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção (`dist/`) |
| `npm run preview` | Pré-visualiza o build de produção |

---

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](./LICENSE) para mais informações.

---

<p align="center">
  Desenvolvido por <a href="https://github.com/yuu-nishioka">Vinicius Yuji Nishioka</a> · Desafio Rocketseat Pós-Graduação
</p>

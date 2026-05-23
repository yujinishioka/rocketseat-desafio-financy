import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, SquarePen, Trash, ChevronLeft, ChevronRight, CircleArrowDown, CircleArrowUp, Wallet } from 'lucide-react'
import { TRANSACTIONS_QUERY, CATEGORIES_QUERY } from '../graphql/queries'
import { CREATE_TRANSACTION_MUTATION, UPDATE_TRANSACTION_MUTATION, DELETE_TRANSACTION_MUTATION } from '../graphql/mutations'
import { formatCurrency, formatDate, getMonthName } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog'
import { CategoryBadge, TypeBadge } from '../components/ui/Badge'
import { CategoryIconDisplay } from '../components/ui/CategoryIcon'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  date: z.string().min(1, 'Data obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  categoryId: z.string().optional(),
})

type TransactionForm = z.infer<typeof transactionSchema>

interface Transaction {
  id: string; description: string; date: string; amount: number
  type: 'INCOME' | 'EXPENSE'
  category?: { id: string; name: string; icon: string; color: string }
}

const now = new Date()
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1).charAt(0).toUpperCase() + getMonthName(i + 1).slice(1),
}))
const YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = now.getFullYear() - 4 + i
  return { value: String(y), label: String(y) }
})

function TransactionModal({
  open, onClose, onSaved, categories, editData,
}: Readonly<{
  open: boolean; onClose: () => void; onSaved: () => void
  categories: { id: string; name: string }[]; editData?: Transaction
}>) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(editData?.type ?? 'EXPENSE')
  const [createTx, { loading: creating }] = useMutation(CREATE_TRANSACTION_MUTATION)
  const [updateTx, { loading: updating }] = useMutation(UPDATE_TRANSACTION_MUTATION)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
  })

  useEffect(() => {
    if (open) {
      setType(editData?.type ?? 'EXPENSE')
      reset(editData
        ? { description: editData.description, date: editData.date.split('T')[0], amount: editData.amount, categoryId: editData.category?.id ?? '' }
        : { description: '', date: '', categoryId: '' })
    }
  }, [open, editData, reset])

  const categoryId = watch('categoryId')

  async function onSubmit(data: TransactionForm) {
    try {
      const catId = data.categoryId && data.categoryId !== 'none' ? data.categoryId : null
      if (editData) {
        await updateTx({ variables: { id: editData.id, ...data, type, categoryId: catId } })
      } else {
        await createTx({ variables: { ...data, type, categoryId: catId } })
      }
      reset(); onSaved(); onClose()
    } catch (e) { console.error(e) }
  }

  const categoryOptions = [
    { value: 'none', label: 'Sem categoria' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogHeader>
        <DialogTitle>{editData ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        <DialogDescription>Registre suas despesas ou receitas</DialogDescription>
      </DialogHeader>
      <div className="mb-4 flex rounded-lg border border-gray-200 p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${type === t ? (t === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-primary-600 text-white') : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'EXPENSE' ? <CircleArrowDown className="h-4 w-4" /> : <CircleArrowUp className="h-4 w-4" />}
            {t === 'EXPENSE' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Descrição" placeholder="Ex: Jantar no Restaurante" error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" type="date" error={errors.date?.message} {...register('date')} />
          <Input label="Valor" type="number" step="0.01" placeholder="R$ 0,00" error={errors.amount?.message} {...register('amount')} />
        </div>
        <Select label="Categoria" options={categoryOptions} placeholder="Selecione"
          value={categoryId || 'none'}
          onValueChange={(v) => setValue('categoryId', v === 'none' ? '' : v)} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={creating || updating}>Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

export function Transactions() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | undefined>()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>(String(now.getMonth() + 1))
  const [filterYear, setFilterYear] = useState<string>(String(now.getFullYear()))

  const { data, refetch } = useQuery(TRANSACTIONS_QUERY, {
    variables: {
      search: search || undefined,
      type: filterType === 'all' ? undefined : filterType,
      categoryId: filterCategory === 'all' ? undefined : filterCategory,
      month: filterMonth ? Number(filterMonth) : undefined,
      year: filterYear ? Number(filterYear) : undefined,
      page,
      limit: 10,
    },
  })
  const { data: catData } = useQuery(CATEGORIES_QUERY)
  const [deleteTx] = useMutation(DELETE_TRANSACTION_MUTATION)

  const result = data?.transactions
  const transactions: Transaction[] = result?.transactions ?? []
  const totalPages: number = result?.pages ?? 1
  const total: number = result?.total ?? 0
  const categories = catData?.categories ?? []

  function handleSaved() { refetch(); setPage(1) }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    await deleteTx({ variables: { id } })
    handleSaved()
  }

  const typeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'INCOME', label: 'Receita' },
    { value: 'EXPENSE', label: 'Despesa' },
  ]
  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    ...categories.map((c: any) => ({ value: c.id, label: c.name })),
  ]

  const monthLabel = MONTHS.find((m) => m.value === filterMonth)?.label ?? ''
  const periodLabel = monthLabel ? `${monthLabel} / ${filterYear}` : filterYear

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transações</h1>
          <p className="text-sm text-gray-500">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button onClick={() => { setEditingTx(undefined); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nova transação
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-48">
          <Input label="Buscar" placeholder="Buscar por descrição..." leftIcon={<Search className="h-4 w-4" />}
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="w-36">
          <Select label="Tipo" options={typeOptions} value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1) }} />
        </div>
        <div className="w-40">
          <Select label="Categoria" options={categoryOptions} value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setPage(1) }} />
        </div>
        <div className="w-36">
          <Select label="Mês" options={MONTHS} value={filterMonth} onValueChange={(v) => { setFilterMonth(v); setPage(1) }} placeholder="Mês" />
        </div>
        <div className="w-28">
          <Select label="Ano" options={YEARS} value={filterYear} onValueChange={(v) => { setFilterYear(v); setPage(1) }} placeholder="Ano" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-6 py-3">Descrição</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <Wallet className="mx-auto mb-2 h-10 w-10 text-gray-200" />
                  Nenhuma transação encontrada
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="flex items-center gap-3 px-6 py-3.5">
                    {t.category ? (
                      <CategoryIconDisplay icon={t.category.icon} color={t.category.color} size="sm" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Wallet className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{t.description}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-3.5">
                    {t.category ? (
                      <CategoryBadge label={t.category.name} color={t.category.color} />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5"><TypeBadge type={t.type} /></td>
                  <td className={`px-4 py-3.5 text-right font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingTx(t); setModalOpen(true) }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <span className="text-xs text-gray-400">
              1 a {Math.min(page * 10, total)} de {total} resultados
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-400 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-400 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        categories={categories}
        editData={editingTx}
      />
    </div>
  )
}

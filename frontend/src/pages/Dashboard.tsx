import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Wallet, CircleArrowUp, CircleArrowDown, ChevronRight, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TRANSACTION_SUMMARY_QUERY, RECENT_TRANSACTIONS_QUERY, CATEGORIES_QUERY } from '../graphql/queries'
import { CREATE_TRANSACTION_MUTATION, UPDATE_TRANSACTION_MUTATION } from '../graphql/mutations'
import { formatCurrency, formatDate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog'
import { CategoryBadge } from '../components/ui/Badge'
import { CategoryIconDisplay } from '../components/ui/CategoryIcon'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  date: z.string().min(1, 'Data obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  categoryId: z.string().optional(),
})
type TransactionForm = z.infer<typeof transactionSchema>

interface Transaction {
  id: string
  description: string
  date: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category?: { id: string; name: string; icon: string; color: string }
}

function SummaryCard({
  title, value, icon, colorClass, bgClass,
}: Readonly<{
  title: string; value: number; icon: React.ReactNode; colorClass: string; bgClass: string
}>) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgClass}`}>
          <span className={colorClass}>{icon}</span>
        </span>
        <span className="text-sm font-medium text-gray-500 uppercase">{title}</span>
      </div>
      <span className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</span>
    </div>
  )
}

function TransactionModal({
  open, onClose, onSaved, categories, editData,
}: Readonly<{
  open: boolean
  onClose: () => void
  onSaved: () => void
  categories: { id: string; name: string }[]
  editData?: Transaction
}>) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(editData?.type ?? 'EXPENSE')
  const isEditing = !!editData

  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION_MUTATION)
  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION_MUTATION)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
  })

  useEffect(() => {
    if (open) {
      setType(editData?.type ?? 'EXPENSE')
      reset(editData
        ? {
            description: editData.description,
            date: editData.date.split('T')[0],
            amount: editData.amount,
            categoryId: editData.category?.id ?? '',
          }
        : { description: '', date: '', categoryId: '' })
    }
  }, [open, editData, reset])

  const categoryId = watch('categoryId')

  async function onSubmit(data: TransactionForm) {
    try {
      const catId = data.categoryId && data.categoryId !== 'none' ? data.categoryId : null
      const refetchQueries = [TRANSACTION_SUMMARY_QUERY, RECENT_TRANSACTIONS_QUERY, CATEGORIES_QUERY]
      if (isEditing) {
        await updateTransaction({
          variables: { id: editData.id, ...data, type, categoryId: catId },
          refetchQueries,
        })
      } else {
        await createTransaction({
          variables: { ...data, type, categoryId: catId },
          refetchQueries,
        })
      }
      reset()
      onSaved()
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const categoryOptions = [
    { value: 'none', label: 'Sem categoria' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        <DialogDescription>Registre suas despesas ou receitas</DialogDescription>
      </DialogHeader>

      {/* Tipo */}
      <div className="mb-4 flex rounded-lg border border-gray-200 p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
              type === t
                ? t === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'EXPENSE' ? <CircleArrowDown className="h-4 w-4" /> : <CircleArrowUp className="h-4 w-4" />}
            {t === 'EXPENSE' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Descrição"
          placeholder="Ex: Jantar no Restaurante"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
          <Input
            label="Valor"
            type="number"
            step="0.01"
            placeholder="R$ 0,00"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>

        <Select
          label="Categoria"
          options={categoryOptions}
          value={categoryId || 'none'}
          onValueChange={(v) => setValue('categoryId', v === 'none' ? '' : v)}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={creating || updating}>Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  transactionCount: number
  totalAmount: number
}

export function Dashboard() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()

  const { data: summaryData, refetch: refetchSummary } = useQuery(TRANSACTION_SUMMARY_QUERY, { fetchPolicy: 'cache-and-network' })
  const { data: recentData, refetch: refetchRecent } = useQuery(RECENT_TRANSACTIONS_QUERY, { fetchPolicy: 'cache-and-network' })
  const now = new Date()
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY, {
    variables: { month: now.getMonth() + 1, year: now.getFullYear() },
    fetchPolicy: 'cache-and-network',
  })

  const summary = summaryData?.transactionSummary
  const recentTransactions: Transaction[] = recentData?.recentTransactions ?? []
  const allCategories: Category[] = categoriesData?.categories ?? []
  const monthlySortedCategories = [...allCategories]
    .filter((cat) => cat.totalAmount !== 0)
    .sort((a, b) => a.totalAmount - b.totalAmount)
    .slice(0, 6)

  function handleSaved() {
    refetchSummary()
    refetchRecent()
  }

  function openCreate() {
    setEditingTransaction(undefined)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cards Sumário */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Saldo Total"
          value={summary?.totalBalance ?? 0}
          icon={<Wallet className="h-5 w-5" />}
          colorClass="text-purple-500"
          bgClass="bg-purple-50"
        />
        <SummaryCard
          title="Receitas do Mês"
          value={summary?.monthlyIncome ?? 0}
          icon={<CircleArrowUp className="h-5 w-5" />}
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <SummaryCard
          title="Despesas do Mês"
          value={summary?.monthlyExpense ?? 0}
          icon={<CircleArrowDown className="h-5 w-5" />}
          colorClass="text-red-500"
          bgClass="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Transações Recentes */}
        <div className="flex flex-col rounded-xl bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-500 uppercase">Transações Recentes</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver todas
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 divide-y divide-gray-50">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Wallet className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhuma transação ainda</p>
              </div>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                  {t.category ? (
                    <CategoryIconDisplay icon={t.category.icon} color={t.category.color} size="sm" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Wallet className="h-4 w-4 text-gray-400" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-gray-900">{t.description}</span>
                    <span className="text-xs text-gray-400">{formatDate(t.date)}</span>
                  </div>

                  {t.category && (
                    <CategoryBadge label={t.category.name} color={t.category.color} />
                  )}

                  <div className={`flex items-center gap-1 ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="text-sm font-semibold">
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    {t.type === 'INCOME'
                      ? <CircleArrowUp className="h-4 w-4 shrink-0" />
                      : <CircleArrowDown className="h-4 w-4 shrink-0" />
                    }
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-3 flex justify-center">
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-500 uppercase">Categorias</h2>
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Gerenciar
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {monthlySortedCategories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Tag className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhuma movimentação este mês</p>
              </div>
            ) : (
              monthlySortedCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1">
                    <CategoryBadge label={cat.name} color={cat.color} />
                  </div>

                  <span className={`text-sm font-semibold ${cat.totalAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatCurrency(cat.totalAmount)}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        categories={allCategories}
        editData={editingTransaction}
      />
    </div>
  )
}

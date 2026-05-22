import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, SquarePen, Trash, Tag } from 'lucide-react'
import { CATEGORIES_QUERY, CATEGORY_SUMMARY_QUERY } from '../graphql/queries'
import { CREATE_CATEGORY_MUTATION, UPDATE_CATEGORY_MUTATION, DELETE_CATEGORY_MUTATION } from '../graphql/mutations'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog'
import { CategoryIconDisplay, CATEGORY_ICONS, CATEGORY_COLORS } from '../components/ui/CategoryIcon'
import { cn } from '../lib/utils'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
})
type CategoryForm = z.infer<typeof categorySchema>

interface Category {
  id: string; name: string; description?: string
  icon: string; color: string; transactionCount: number
}

function CategoryModal({
  open, onClose, onSaved, editData,
}: Readonly<{
  open: boolean; onClose: () => void; onSaved: () => void; editData?: Category
}>) {
  const isEditing = !!editData
  const [selectedIcon, setSelectedIcon] = useState(editData?.icon ?? CATEGORY_ICONS[0].name)
  const [selectedColor, setSelectedColor] = useState(editData?.color ?? CATEGORY_COLORS[0])

  const [createCat, { loading: creating }] = useMutation(CREATE_CATEGORY_MUTATION)
  const [updateCat, { loading: updating }] = useMutation(UPDATE_CATEGORY_MUTATION)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: editData ? { name: editData.name, description: editData.description ?? '' } : {},
  })

  async function onSubmit(data: CategoryForm) {
    try {
      if (isEditing) {
        await updateCat({ variables: { id: editData.id, ...data, icon: selectedIcon, color: selectedColor } })
      } else {
        await createCat({ variables: { ...data, icon: selectedIcon, color: selectedColor } })
      }
      reset(); onSaved(); onClose()
    } catch (e) { console.error(e) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        <DialogDescription>Organize suas transações com categorias</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Título" placeholder="Ex: Alimentação" error={errors.name?.message} {...register('name')} />
        <Input label="Descrição" placeholder="Descrição da categoria" {...register('description')} />

        {/* Icon picker */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Ícone</label>
          <div className="grid grid-cols-9 gap-1.5">
            {CATEGORY_ICONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedIcon(name)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-colors',
                  selectedIcon === name
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Cor</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'h-7 w-7 rounded-full border-2 transition-transform',
                  selectedColor === color ? 'scale-110 border-gray-900' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <CategoryIconDisplay icon={selectedIcon} color={selectedColor} />
          <span className="text-sm font-medium text-gray-700">Pré-visualização</span>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={creating || updating}>Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

export function Categories() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | undefined>()

  const { data, refetch } = useQuery(CATEGORIES_QUERY)
  const { data: summaryData, refetch: refetchSummary } = useQuery(CATEGORY_SUMMARY_QUERY)
  const [deleteCat] = useMutation(DELETE_CATEGORY_MUTATION)

  const categories: Category[] = data?.categories ?? []
  const summary = summaryData?.categorySummary

  function handleSaved() { refetch(); refetchSummary() }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta categoria? As transações vinculadas perderão a categoria.')) return
    await deleteCat({ variables: { id } })
    handleSaved()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categorias</h1>
          <p className="text-sm text-gray-500">Organize suas transações por categorias</p>
        </div>
        <Button onClick={() => { setEditingCat(undefined); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {/* Summary bar */}
      {summary && (
        <div className="flex items-center gap-8 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{summary.totalCategories}</span>
            <span className="text-xs text-gray-500">Total de categorias</span>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</span>
            <span className="text-xs text-gray-500">Total de transações</span>
          </div>
          {summary.mostUsedCategory && (
            <>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <CategoryIconDisplay
                  icon={summary.mostUsedCategory.icon}
                  color={summary.mostUsedCategory.color}
                  size="md"
                />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900">{summary.mostUsedCount}</span>
                  <span className="text-xs text-gray-500">{summary.mostUsedCategory.name} · Em uso</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Grid */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm">
          <Tag className="h-12 w-12 text-gray-200" />
          <p className="text-gray-500">Nenhuma categoria ainda</p>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <CategoryIconDisplay icon={cat.icon} color={cat.color} size="md" />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingCat(cat); setModalOpen(true) }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <SquarePen className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {cat.transactionCount} {cat.transactionCount === 1 ? 'transação' : 'transações'}
                </span>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editData={editingCat}
      />
    </div>
  )
}

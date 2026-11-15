import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

type AveriasAdminPaginationProps = {
  page: number
  totalPages: number
  total: number
  limit?: number
  loading?: boolean
  onPageChange: (page: number) => void
  labelSingular?: string
  labelPlural?: string
}

const AveriasAdminPagination = ({
  page,
  totalPages,
  total,
  limit,
  loading = false,
  onPageChange,
  labelSingular = 'avería',
  labelPlural = 'averías',
}: AveriasAdminPaginationProps) => {
  if (total === 0 || totalPages < 1) {
    return null
  }

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages
  const pageSize = limit && limit > 0 ? limit : Math.ceil(total / Math.max(totalPages, 1)) || total
  const desde = (page - 1) * pageSize + 1
  const hasta = Math.min(page * pageSize, total)

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:px-6"
      aria-label="Paginación de averías"
    >
      <p className="m-0">
        Mostrando {desde}–{hasta} de {total} {total === 1 ? labelSingular : labelPlural}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-[#1e5a9c] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canGoPrevious || loading}
          onClick={() => onPageChange(page - 1)}
        >
          <IconChevronLeft size={17} aria-hidden="true" />
          Anterior
        </button>
        <span className="px-2 font-semibold text-slate-600">
          Página {page} de {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-[#1e5a9c] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canGoNext || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <IconChevronRight size={17} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

export default AveriasAdminPagination

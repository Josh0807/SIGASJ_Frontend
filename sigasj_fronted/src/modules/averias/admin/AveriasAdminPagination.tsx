type AveriasAdminPaginationProps = {
  page: number
  totalPages: number
  total: number
  loading?: boolean
  onPageChange: (page: number) => void
}

const AveriasAdminPagination = ({
  page,
  totalPages,
  total,
  loading = false,
  onPageChange,
}: AveriasAdminPaginationProps) => {
  if (total === 0 || totalPages < 1) {
    return null
  }

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <nav className="gallery-admin__pagination" aria-label="Paginación de averías">
      <button
        type="button"
        disabled={!canGoPrevious || loading}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <p>
        Página {page} de {totalPages}
      </p>
      <button
        type="button"
        disabled={!canGoNext || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}

export default AveriasAdminPagination

import { clampProyectosPage } from './types'

type ProyectosAdminPaginationProps = {
  page: number
  totalPages: number
  total: number
  loading?: boolean
  onPageChange: (page: number) => void
}

const ProyectosAdminPagination = ({
  page,
  totalPages,
  total,
  loading = false,
  onPageChange,
}: ProyectosAdminPaginationProps) => {
  if (total === 0 || totalPages < 1) {
    return null
  }

  const currentPage = clampProyectosPage(page, totalPages)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <nav className="gallery-admin__pagination" aria-label="Paginación">
      <button
        type="button"
        disabled={!canGoPrevious || loading}
        onClick={() => onPageChange(clampProyectosPage(currentPage - 1, totalPages))}
      >
        Anterior
      </button>
      <p>
        Página {currentPage} de {totalPages}
      </p>
      <button
        type="button"
        disabled={!canGoNext || loading}
        onClick={() => onPageChange(clampProyectosPage(currentPage + 1, totalPages))}
      >
        Siguiente
      </button>
    </nav>
  )
}

export default ProyectosAdminPagination

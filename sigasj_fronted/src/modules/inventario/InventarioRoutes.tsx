import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MaterialesPage from './MaterialesPage'
import MaterialEditPage from './MaterialEditPage'
import MaterialCreatePage from './MaterialCreatePage'
import CategoriasPage from './categorias/CategoriasPage'
import CategoriaCreatePage from './categorias/CategoriaCreatePage'
import CategoriaEditPage from './categorias/CategoriaEditPage'
import AuthorizedRoute from '../auth/components/AuthorizedRoute'
import { InternalAdminRoleName } from '../auth/utils/internalRoles'
import ProveedoresPage from './proveedores/ProveedoresPage'
import ProveedorCreatePage from './proveedores/ProveedorCreatePage'
import ProveedorEditPage from './proveedores/ProveedorEditPage'
import EntradaCreatePage from './entradas/EntradaCreatePage'
import SalidaCreatePage from './salidas/SalidaCreatePage'
import SolicitudMaterialesPage from './solicitudes-materiales/SolicitudMaterialesPage'
import SolicitudesMaterialesSeguimientoPage from './solicitudes-materiales/SolicitudesMaterialesSeguimientoPage'
import SolicitudMaterialesDetallePage from './solicitudes-materiales/SolicitudMaterialesDetallePage'
import SolicitudesRevisionPage from './solicitudes-materiales/SolicitudesRevisionPage'
import SolicitudRevisionDetallePage from './solicitudes-materiales/SolicitudRevisionDetallePage'
import AlertasReposicionPage from './alertas-reposicion/AlertasReposicionPage'
import ReposicionesPage from './reposiciones/ReposicionesPage'
import ReposicionDetallePage from './reposiciones/ReposicionDetallePage'
import RecepcionesPage from './recepciones/RecepcionesPage'
import RecepcionDetallePage from './recepciones/RecepcionDetallePage'
import MovimientosPage from './movimientos/MovimientosPage'
import MovimientoDetallePage from './movimientos/MovimientoDetallePage'
import ReportesInventarioPage from './reportes/ReportesInventarioPage'
import InventarioModuleMenu from './InventarioModuleMenu'

const adminOnly = [InternalAdminRoleName.Administradora]
const salidaRoles = [InternalAdminRoleName.Administradora, InternalAdminRoleName.Fontanero]
const fontaneroOnly = [InternalAdminRoleName.Fontanero]

const shellClasses = [
  'inventory-module-shell relative [--inventory-accent:#2563eb] [--inventory-soft:#eff6ff]',
  '[&_.materials-admin__header]:!rounded-[24px] [&_.materials-admin__header]:!border-sky-100 [&_.materials-admin__header]:!bg-white [&_.materials-admin__header]:!p-7 [&_.materials-admin__header]:!shadow-[0_12px_34px_rgba(30,90,156,0.08)]',
  '[&_.materials-admin__eyebrow]:!text-[var(--inventory-accent)] [&_.materials-admin__count]:!bg-[var(--inventory-soft)] [&_.materials-admin__count]:!text-[var(--inventory-accent)]',
  '[&_.materials-admin__filters]:!rounded-[22px] [&_.materials-admin__filters]:!border-sky-100 [&_.materials-admin__filters]:!bg-white [&_.materials-admin__filters]:!p-6 [&_.materials-admin__filters]:!shadow-[0_10px_28px_rgba(30,90,156,0.06)]',
  '[&_.materials-admin__filters_input]:!rounded-xl [&_.materials-admin__filters_select]:!rounded-xl',
  '[&_.materials-admin__table-wrap]:!rounded-[22px] [&_.materials-admin__table-wrap]:!border-sky-100 [&_.materials-admin__table-wrap]:!shadow-[0_12px_30px_rgba(30,90,156,0.07)]',
  '[&_.materials-admin__form]:!rounded-[22px] [&_.materials-admin__form]:!border-sky-100 [&_.materials-admin__form]:!bg-white [&_.materials-admin__form]:!shadow-[0_12px_30px_rgba(30,90,156,0.07)]',
  '[&_.materials-admin__primary]:!inline-flex [&_.materials-admin__primary]:!min-h-12 [&_.materials-admin__primary]:!items-center [&_.materials-admin__primary]:!justify-center [&_.materials-admin__primary]:!gap-2 [&_.materials-admin__primary]:!rounded-xl [&_.materials-admin__primary]:!border-[var(--inventory-accent)] [&_.materials-admin__primary]:!bg-[var(--inventory-accent)] [&_.materials-admin__primary]:!px-5 [&_.materials-admin__primary]:!font-extrabold [&_.materials-admin__primary]:!shadow-[0_8px_18px_rgba(15,63,110,0.16)] hover:[&_.materials-admin__primary]:!-translate-y-0.5',
  '[&_.materials-admin__secondary]:!inline-flex [&_.materials-admin__secondary]:!min-h-12 [&_.materials-admin__secondary]:!items-center [&_.materials-admin__secondary]:!justify-center [&_.materials-admin__secondary]:!gap-2 [&_.materials-admin__secondary]:!rounded-xl [&_.materials-admin__secondary]:!border-slate-200 [&_.materials-admin__secondary]:!bg-white [&_.materials-admin__secondary]:!px-5 [&_.materials-admin__secondary]:!font-extrabold [&_.materials-admin__secondary]:!text-slate-700 [&_.materials-admin__secondary]:!shadow-sm hover:[&_.materials-admin__secondary]:!border-slate-300 hover:[&_.materials-admin__secondary]:!bg-slate-50',
  '[&_.materials-admin__form-actions]:!mt-2 [&_.materials-admin__form-actions]:!justify-between [&_.materials-admin__form-actions]:!border-t [&_.materials-admin__form-actions]:!border-slate-100 [&_.materials-admin__form-actions]:!pt-5 max-[760px]:[&_.materials-admin__form-actions]:!flex-col',
  '[&_.material-tracking]:!grid [&_.material-tracking]:!gap-6',
  '[&_.material-tracking__header]:!rounded-[24px] [&_.material-tracking__header]:!border [&_.material-tracking__header]:!border-sky-100 [&_.material-tracking__header]:!bg-white [&_.material-tracking__header]:!p-7 [&_.material-tracking__header]:!shadow-[0_12px_34px_rgba(30,90,156,0.08)]',
  '[&_.material-tracking__filters]:!flex [&_.material-tracking__filters]:!flex-wrap [&_.material-tracking__filters]:!items-center [&_.material-tracking__filters]:!gap-3 [&_.material-tracking__filters]:!rounded-[22px] [&_.material-tracking__filters]:!border [&_.material-tracking__filters]:!border-sky-100 [&_.material-tracking__filters]:!bg-white [&_.material-tracking__filters]:!p-5 [&_.material-tracking__filters]:!shadow-[0_10px_28px_rgba(30,90,156,0.06)]',
  '[&_.material-tracking__filters_select]:!min-h-12 [&_.material-tracking__filters_select]:!min-w-[180px] [&_.material-tracking__filters_select]:!flex-1 [&_.material-tracking__filters_select]:!rounded-xl [&_.material-tracking__filters_select]:!border-slate-200 [&_.material-tracking__filters_input]:!min-h-12 [&_.material-tracking__filters_input]:!min-w-[180px] [&_.material-tracking__filters_input]:!flex-1 [&_.material-tracking__filters_input]:!rounded-xl [&_.material-tracking__filters_input]:!border-slate-200',
  '[&_.material-tracking__table-wrap]:!rounded-[22px] [&_.material-tracking__table-wrap]:!border-sky-100 [&_.material-tracking__table-wrap]:!bg-white [&_.material-tracking__table-wrap]:!shadow-[0_12px_30px_rgba(30,90,156,0.07)]',
  '[&_.material-tracking__empty]:!rounded-[22px] [&_.material-tracking__empty]:!border-sky-100 [&_.material-tracking__empty]:!bg-white [&_.material-tracking__empty]:!shadow-[0_10px_28px_rgba(30,90,156,0.06)]',
  '[&_.material-request]:!grid [&_.material-request]:!gap-6',
  '[&_.material-request__header]:!rounded-[24px] [&_.material-request__header]:!border [&_.material-request__header]:!border-sky-100 [&_.material-request__header]:!bg-white [&_.material-request__header]:!p-7 [&_.material-request__header]:!shadow-[0_12px_34px_rgba(30,90,156,0.08)]',
  '[&_.material-request__form]:!rounded-[22px] [&_.material-request__form]:!border-sky-100 [&_.material-request__form]:!bg-white [&_.material-request__form]:!p-7 [&_.material-request__form]:!shadow-[0_12px_30px_rgba(30,90,156,0.07)]',
  '[&_.material-detail]:!grid [&_.material-detail]:!gap-6 [&_.material-detail__header]:!rounded-[24px] [&_.material-detail__header]:!shadow-[0_12px_34px_rgba(30,90,156,0.08)]',
  '[&_.material-detail__summary]:!rounded-[22px] [&_.material-detail__summary]:!shadow-[0_10px_28px_rgba(30,90,156,0.06)] [&_.material-detail__materials]:!rounded-[22px] [&_.material-detail__materials]:!shadow-[0_10px_28px_rgba(30,90,156,0.06)]',
  '[&_.material-tracking__detail-link]:!inline-flex [&_.material-tracking__detail-link]:!min-h-10 [&_.material-tracking__detail-link]:!items-center [&_.material-tracking__detail-link]:!justify-center [&_.material-tracking__detail-link]:!rounded-xl [&_.material-tracking__detail-link]:!border [&_.material-tracking__detail-link]:!border-[var(--inventory-accent)] [&_.material-tracking__detail-link]:!bg-[var(--inventory-soft)] [&_.material-tracking__detail-link]:!px-4 [&_.material-tracking__detail-link]:!font-extrabold [&_.material-tracking__detail-link]:!text-[var(--inventory-accent)] [&_.material-tracking__detail-link]:!no-underline hover:[&_.material-tracking__detail-link]:!-translate-y-0.5',
  '[&_.material-tracking__filter-action]:!inline-flex [&_.material-tracking__filter-action]:!min-h-12 [&_.material-tracking__filter-action]:!items-center [&_.material-tracking__filter-action]:!justify-center [&_.material-tracking__filter-action]:!rounded-xl [&_.material-tracking__filter-action]:!border-slate-200 [&_.material-tracking__filter-action]:!bg-white [&_.material-tracking__filter-action]:!px-5 [&_.material-tracking__filter-action]:!font-extrabold [&_.material-tracking__filter-action]:!text-slate-700 [&_.material-tracking__filter-action]:!shadow-sm',
  '[&_.material-tracking__pagination_button]:!min-h-11 [&_.material-tracking__pagination_button]:!rounded-xl [&_.material-tracking__pagination_button]:!border-slate-200 [&_.material-tracking__pagination_button]:!bg-white [&_.material-tracking__pagination_button]:!px-5 [&_.material-tracking__pagination_button]:!font-extrabold [&_.material-tracking__pagination_button]:!text-[var(--inventory-accent)] [&_.material-tracking__pagination_button]:!shadow-sm',
  '[&_.material-tracking__state_button]:!inline-flex [&_.material-tracking__state_button]:!min-h-11 [&_.material-tracking__state_button]:!items-center [&_.material-tracking__state_button]:!justify-center [&_.material-tracking__state_button]:!gap-2 [&_.material-tracking__state_button]:!rounded-xl [&_.material-tracking__state_button]:!border [&_.material-tracking__state_button]:!border-[var(--inventory-accent)] [&_.material-tracking__state_button]:!bg-[var(--inventory-soft)] [&_.material-tracking__state_button]:!px-4 [&_.material-tracking__state_button]:!font-extrabold [&_.material-tracking__state_button]:!text-[var(--inventory-accent)]',
  '[&_.material-request__primary]:!inline-flex [&_.material-request__primary]:!min-h-12 [&_.material-request__primary]:!items-center [&_.material-request__primary]:!justify-center [&_.material-request__primary]:!gap-2 [&_.material-request__primary]:!rounded-xl [&_.material-request__primary]:!border-[var(--inventory-accent)] [&_.material-request__primary]:!bg-[var(--inventory-accent)] [&_.material-request__primary]:!px-5 [&_.material-request__primary]:!font-extrabold [&_.material-request__primary]:!text-white [&_.material-request__primary]:!shadow-[0_8px_18px_rgba(15,63,110,0.16)]',
  '[&_.material-request__add]:!rounded-xl [&_.material-request__add]:!border-[var(--inventory-accent)] [&_.material-request__add]:!bg-[var(--inventory-soft)] [&_.material-request__add]:!font-extrabold [&_.material-request__add]:!text-[var(--inventory-accent)] [&_.material-request__remove]:!rounded-xl',
  '[&_.material-detail__back]:!inline-flex [&_.material-detail__back]:!min-h-11 [&_.material-detail__back]:!items-center [&_.material-detail__back]:!rounded-xl [&_.material-detail__back]:!border [&_.material-detail__back]:!border-slate-200 [&_.material-detail__back]:!bg-white [&_.material-detail__back]:!px-4 [&_.material-detail__back]:!font-extrabold [&_.material-detail__back]:!text-slate-700 [&_.material-detail__back]:!no-underline [&_.material-detail__back]:!shadow-sm',
  '[&_.material-review__actions]:!flex [&_.material-review__actions]:!flex-wrap [&_.material-review__actions]:!justify-end [&_.material-review__actions]:!gap-3 [&_.material-review__actions]:!border-t [&_.material-review__actions]:!border-slate-100 [&_.material-review__actions]:!pt-5',
  '[&_.material-review__approve]:!min-h-12 [&_.material-review__approve]:!rounded-xl [&_.material-review__approve]:!border-emerald-600 [&_.material-review__approve]:!bg-emerald-600 [&_.material-review__approve]:!px-5 [&_.material-review__approve]:!font-extrabold [&_.material-review__approve]:!text-white [&_.material-review__approve]:!shadow-[0_8px_18px_rgba(5,150,105,0.18)]',
  '[&_.material-review__reject]:!min-h-12 [&_.material-review__reject]:!rounded-xl [&_.material-review__reject]:!border-rose-200 [&_.material-review__reject]:!bg-rose-50 [&_.material-review__reject]:!px-5 [&_.material-review__reject]:!font-extrabold [&_.material-review__reject]:!text-rose-700',
  '[&_.gallery-admin__button]:!min-h-12 [&_.gallery-admin__button]:!rounded-xl [&_.gallery-admin__button]:!px-5 [&_.gallery-admin__button]:!font-extrabold [&_.gallery-admin__button]:!shadow-sm [&_.gallery-admin__button--primary]:!border-[var(--inventory-accent)] [&_.gallery-admin__button--primary]:!bg-[var(--inventory-accent)] [&_.gallery-admin__button--primary]:!text-white',
  '[&_.gallery-admin__filter-reset]:!border-slate-200 [&_.gallery-admin__filter-reset]:!bg-white [&_.gallery-admin__filter-reset]:!text-slate-700',
  '[&_input]:transition [&_select]:transition [&_textarea]:transition [&_button]:transition [&_a]:transition',
].join(' ')

function inventoryTheme(pathname: string) {
  if (pathname.includes('/categorias')) return '[--inventory-accent:#7c3aed] [--inventory-soft:#f5f3ff]'
  if (pathname.includes('/proveedores')) return '[--inventory-accent:#0284c7] [--inventory-soft:#f0f9ff]'
  if (pathname.includes('/entradas')) return '[--inventory-accent:#059669] [--inventory-soft:#ecfdf5]'
  if (pathname.includes('/salidas')) return '[--inventory-accent:#d97706] [--inventory-soft:#fffbeb]'
  if (pathname.includes('/alertas-reposicion')) return '[--inventory-accent:#dc2626] [--inventory-soft:#fef2f2]'
  if (pathname.includes('/reposiciones')) return '[--inventory-accent:#ea580c] [--inventory-soft:#fff7ed]'
  if (pathname.includes('/recepciones')) return '[--inventory-accent:#0d9488] [--inventory-soft:#f0fdfa]'
  if (pathname.includes('/movimientos')) return '[--inventory-accent:#0891b2] [--inventory-soft:#ecfeff]'
  if (pathname.includes('/reportes')) return '[--inventory-accent:#9333ea] [--inventory-soft:#faf5ff]'
  if (pathname.includes('/solicitudes')) return '[--inventory-accent:#4f46e5] [--inventory-soft:#eef2ff]'
  return '[--inventory-accent:#2563eb] [--inventory-soft:#eff6ff]'
}

export default function InventarioRoutes() {
  const { pathname } = useLocation()
  return <section className={`${shellClasses} ${inventoryTheme(pathname)}`}><InventarioModuleMenu /><Routes><Route index element={<Navigate to="materiales" replace />} /><Route path="materiales" element={<MaterialesPage />} /><Route path="materiales/nuevo" element={<MaterialCreatePage />} /><Route path="materiales/:id/editar" element={<MaterialEditPage />} /><Route path="categorias" element={<CategoriasPage />} /><Route path="categorias/nueva" element={<CategoriaCreatePage />} /><Route path="categorias/:id/editar" element={<CategoriaEditPage />} /><Route path="proveedores" element={<ProveedoresPage />} /><Route path="proveedores/nuevo" element={<AuthorizedRoute allowedRoles={adminOnly}><ProveedorCreatePage /></AuthorizedRoute>} /><Route path="proveedores/:id/editar" element={<AuthorizedRoute allowedRoles={adminOnly}><ProveedorEditPage /></AuthorizedRoute>} /><Route path="entradas" element={<AuthorizedRoute allowedRoles={adminOnly}><EntradaCreatePage /></AuthorizedRoute>} /><Route path="salidas" element={<AuthorizedRoute allowedRoles={salidaRoles}><SalidaCreatePage /></AuthorizedRoute>} /><Route path="solicitudes" element={<AuthorizedRoute allowedRoles={adminOnly}><SolicitudesRevisionPage /></AuthorizedRoute>} /><Route path="solicitudes/:id" element={<AuthorizedRoute allowedRoles={adminOnly}><SolicitudRevisionDetallePage /></AuthorizedRoute>} /><Route path="alertas-reposicion" element={<AuthorizedRoute allowedRoles={adminOnly}><AlertasReposicionPage /></AuthorizedRoute>} /><Route path="reposiciones" element={<AuthorizedRoute allowedRoles={adminOnly}><ReposicionesPage /></AuthorizedRoute>} /><Route path="reposiciones/:id" element={<AuthorizedRoute allowedRoles={adminOnly}><ReposicionDetallePage /></AuthorizedRoute>} /><Route path="recepciones" element={<AuthorizedRoute allowedRoles={adminOnly}><RecepcionesPage /></AuthorizedRoute>} /><Route path="recepciones/:id" element={<AuthorizedRoute allowedRoles={adminOnly}><RecepcionDetallePage /></AuthorizedRoute>} /><Route path="movimientos" element={<AuthorizedRoute allowedRoles={adminOnly}><MovimientosPage /></AuthorizedRoute>} /><Route path="movimientos/:id" element={<AuthorizedRoute allowedRoles={adminOnly}><MovimientoDetallePage /></AuthorizedRoute>} /><Route path="reportes" element={<AuthorizedRoute allowedRoles={adminOnly}><ReportesInventarioPage /></AuthorizedRoute>} /><Route path="solicitudes-materiales" element={<AuthorizedRoute allowedRoles={fontaneroOnly}><SolicitudesMaterialesSeguimientoPage /></AuthorizedRoute>} /><Route path="solicitudes-materiales/nueva" element={<AuthorizedRoute allowedRoles={fontaneroOnly}><SolicitudMaterialesPage /></AuthorizedRoute>} /><Route path="solicitudes-materiales/:id" element={<AuthorizedRoute allowedRoles={fontaneroOnly}><SolicitudMaterialesDetallePage /></AuthorizedRoute>} /><Route path="*" element={<Navigate to="materiales" replace />} /></Routes></section>
}

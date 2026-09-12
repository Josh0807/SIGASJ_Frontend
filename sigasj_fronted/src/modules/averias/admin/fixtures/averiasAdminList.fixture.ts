import type { AveriaListItem, AveriasAdminListado } from '../types'

/**
 * Fixture exclusivo de tests. El listado productivo consulta GET /api/v1/admin/averias.
 */
export const AVERIAS_ADMIN_UI_FIXTURE_ITEMS: AveriaListItem[] = [
  {
    id: 1,
    codigoSeguimiento: 'AV-2026-0001',
    fechaReporte: '2026-09-12T15:00:00.000Z',
    nombreReportante: 'María Rodríguez',
    sectorComunidad: 'San Juan',
    ubicacion:
      'Frente a la escuela, 50 m sur, casa verde con portón de madera y tanque elevado',
    descripcion:
      'Se observa una fuga visible en la tubería de distribución. El agua corre hacia la calle y ha formado un charco.',
    estado: 'RECIBIDA',
    prioridad: null,
    tipoAveria: null,
    fontanero: null,
  },
  {
    id: 2,
    codigoSeguimiento: 'AV-2026-0002',
    fechaReporte: '2026-09-12T23:30:00.000Z',
    nombreReportante: 'Juan Pérez',
    sectorComunidad: 'Barrio El Carmen',
    ubicacion: '200 m este del tanque, costado norte',
    descripcion: 'Rotura en tubería secundaria junto al medidor comunitario.',
    estado: 'RECIBIDA',
    prioridad: 'ALTA',
    tipoAveria: 'TUBERIA',
    fontanero: { id: 5, nombre: 'Luis Campos' },
  },
  {
    id: 3,
    codigoSeguimiento: 'AV-2026-0003',
    fechaReporte: '2026-09-05T10:00:00.000Z',
    nombreReportante: 'Ana Soto',
    sectorComunidad: 'Los Ángeles',
    ubicacion: 'Calle principal, frente al salón comunal',
    descripcion: 'Baja presión reportada por varias viviendas del sector.',
    estado: 'RECIBIDA',
    prioridad: 'MEDIA',
    tipoAveria: null,
    fontanero: { id: 8 },
  },
]

export const AVERIAS_ADMIN_UI_FIXTURE: AveriasAdminListado = {
  data: AVERIAS_ADMIN_UI_FIXTURE_ITEMS,
  total: 3,
  page: 1,
  limit: 20,
  totalPages: 1,
}

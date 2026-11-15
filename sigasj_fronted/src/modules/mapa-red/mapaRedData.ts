/**
 * @deprecated Preferir `mapaRedGeo.ts`.
 * Reexporta el catálogo GIS real (sin polígonos SVG inventados).
 */
export {
  SECTORES_CATALOGO as SECTORES,
  buscarSectores,
  sectorPorId,
  type SectorId,
  type SectorCatalogo as SectorRed,
} from './mapaRedGeo'

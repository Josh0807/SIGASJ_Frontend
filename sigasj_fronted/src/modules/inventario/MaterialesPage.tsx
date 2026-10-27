import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/components/AuthContext";
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from "../auth/utils/internalRoles";
import { materialEditPath } from "./inventarioPaths";
import { parseMaterialEstadoError } from "./materialEstadoError";
import { updateMaterialEstado } from "./materialesApi";
import MaterialStateAction from "./MaterialStateAction";
import type { Material } from "./types";
import { useMateriales } from "./useMateriales";
import { useCategorias } from "./categorias/useCategorias";
import { useProveedores } from "./proveedores/useProveedores";
import {
  IconAlertTriangle,
  IconCalendarTime,
  IconCategory,
  IconCheck,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconFilter,
  IconPackage,
  IconSearch,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { InventoryFormField } from "./InventoryFormField";

const PAGE_SIZE = 10;

type VencimientoUi = {
  label: string;
  tone: "none" | "ok" | "soon" | "expired";
};

function hoyCostaRicaIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatFechaVencimiento(iso: string | null | undefined): string {
  if (!iso) return "";
  const day = iso.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return day;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function resolveVencimientoUi(material: Material): VencimientoUi {
  const requiere =
    material.requiereFechaVencimiento === true ||
    material.categoria?.requiereFechaVencimiento === true;
  if (!requiere) {
    return { label: "No aplica", tone: "none" };
  }
  if (!material.fechaVencimiento) {
    return { label: "Sin fecha", tone: "soon" };
  }
  const day = material.fechaVencimiento.slice(0, 10);
  const hoy = hoyCostaRicaIso();
  if (day < hoy) {
    return {
      label: `Vencido · ${formatFechaVencimiento(day)}`,
      tone: "expired",
    };
  }
  const [y, m, d] = hoy.split("-").map(Number);
  const limiteDate = new Date(Date.UTC(y, m - 1, d + 30));
  const limiteIso = `${limiteDate.getUTCFullYear()}-${String(limiteDate.getUTCMonth() + 1).padStart(2, "0")}-${String(limiteDate.getUTCDate()).padStart(2, "0")}`;
  if (day <= limiteIso) {
    return {
      label: `Pronto · ${formatFechaVencimiento(day)}`,
      tone: "soon",
    };
  }
  return {
    label: formatFechaVencimiento(day),
    tone: "ok",
  };
}

export default function MaterialesPage() {
  const location = useLocation();
  const routeState = location.state as { success?: string; warning?: string } | null;
  const routeSuccess = routeState?.success;
  const routeWarning = routeState?.warning;
  const [searchInput, setSearchInput] = useState("");
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [page, setPage] = useState(1);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    kind: "success" | "error" | "warning";
    text: string;
  } | null>(() => {
    if (routeSuccess) return { kind: "success", text: routeSuccess };
    if (routeWarning) return { kind: "warning", text: routeWarning };
    return null;
  });
  const latestSearch = useRef("");
  const { user, logout } = useAuth();
  const currentRole = normalizeInternalRole(user?.role);
  const canManage = currentRole === InternalAdminRoleName.Administradora;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = searchInput.trim();
      if (value !== latestSearch.current) {
        latestSearch.current = value;
        setNombre(value);
        setPage(1);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { result, loading, error, refetch } = useMateriales({
    nombre: nombre || undefined,
    activo: activo === "" ? undefined : activo === "true",
    idCategoria: categoriaId ? Number(categoriaId) : undefined,
    idProveedor: proveedorId ? Number(proveedorId) : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const {
    result: categorias,
    loading: categoriasLoading,
    error: categoriasError,
    refetch: refetchCategorias,
  } = useCategorias({ page: 1, limit: 100 });
  const {
    result: proveedores,
    loading: proveedoresLoading,
    error: proveedoresError,
    refetch: refetchProveedores,
  } = useProveedores({ page: 1, limit: 100 });
  const filtered = Boolean(
    searchInput.trim() || activo || categoriaId || proveedorId,
  );

  const handleStateChange = async (material: Material, nextActivo: boolean) => {
    if (changingId !== null) return;
    setChangingId(material.id);
    setActionMessage(null);
    try {
      await updateMaterialEstado(material.id, nextActivo);
      setActionMessage({
        kind: "success",
        text: `El material «${material.nombre}» fue ${nextActivo ? "reactivado" : "desactivado"} correctamente.`,
      });
      refetch();
    } catch (caught) {
      const parsed = parseMaterialEstadoError(caught);
      setActionMessage({ kind: "error", text: parsed.message });
      if (parsed.status === 404) refetch();
      if (parsed.status === 401) logout();
    } finally {
      setChangingId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    latestSearch.current = "";
    setNombre("");
    setActivo("");
    setCategoriaId("");
    setProveedorId("");
    setPage(1);
  };

  return (
    <main className="materials-admin admin-content-modern gallery-admin sigasj-stack !gap-6">
      <header className="materials-admin__header !flex !min-h-[220px] !items-center !rounded-[24px] !border-sky-100 !bg-white !p-8">
        <div>
          <p className="materials-admin__eyebrow inventory-page-eyebrow">
            Inventario · Bodega
          </p>
          <div className="inventory-catalog__heading">
            <h1 className="inventory-page-title">Catálogo de materiales</h1>
            <span className="materials-admin__count !rounded-full !border-0 !bg-blue-50 !px-4 !py-2 !text-sm !font-extrabold !text-blue-700">
              {result.total} materiales
            </span>
          </div>
          <p className="inventory-page-subtitle">
            Consulte existencias, ubicación, stock mínimo y fechas de
            vencimiento de los materiales registrados.
          </p>
        </div>
      </header>
      <section
        className={`materials-admin__filters materials-admin__filters--inventory${canManage ? " min-[1100px]:!grid-cols-[minmax(280px,1.55fr)_minmax(250px,.8fr)_minmax(280px,1fr)_minmax(300px,1fr)]" : " materials-admin__filters--plumber"}`}
        aria-label="Búsqueda y filtros"
      >
        <InventoryFormField
          label="Buscar por nombre"
          icon={<IconSearch size={20} aria-hidden="true" />}
        >
          <input
            type="search"
            value={searchInput}
            maxLength={150}
            placeholder="Ej. Tubo PVC"
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </InventoryFormField>
        <InventoryFormField
          label="Estado"
          icon={<IconFilter size={20} aria-hidden="true" />}
        >
          <select
            value={activo}
            onChange={(event) => {
              setActivo(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </InventoryFormField>
        <InventoryFormField
          label="Categoría"
          icon={<IconCategory size={20} aria-hidden="true" />}
        >
          <select
            value={categoriaId}
            disabled={categoriasLoading}
            onChange={(event) => {
              setCategoriaId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
                {item.activo ? "" : " (inactiva)"}
              </option>
            ))}
          </select>
        </InventoryFormField>
        {canManage && (
          <InventoryFormField
            label="Proveedor"
            icon={<IconTruck size={20} aria-hidden="true" />}
          >
            <select
              value={proveedorId}
              disabled={proveedoresLoading}
              onChange={(event) => {
                setProveedorId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los proveedores</option>
              {proveedores.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                  {item.activo ? "" : " (inactivo)"}
                </option>
              ))}
            </select>
          </InventoryFormField>
        )}
        {filtered && (
          <button
            type="button"
            className="materials-admin__secondary"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        )}
        {categoriasError && (
          <div className="materials-admin__category-error" role="alert">
            No fue posible cargar el filtro de categorías.{" "}
            <button type="button" onClick={refetchCategorias}>
              Reintentar
            </button>
          </div>
        )}
        {canManage && proveedoresError && (
          <div className="materials-admin__category-error" role="alert">
            No fue posible cargar el filtro de proveedores.{" "}
            <button type="button" onClick={refetchProveedores}>
              Reintentar
            </button>
          </div>
        )}
      </section>
      {actionMessage && (
        <div
          className={`flex items-start gap-4 rounded-3xl border p-5 shadow-[0_14px_36px_rgba(15,23,42,0.10)] ${
            actionMessage.kind === "success"
              ? "!border-emerald-200 !bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_60%,#f0fdfa_100%)] !text-emerald-950"
              : actionMessage.kind === "warning"
                ? "!border-amber-200 !bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_62%,#fff7ed_100%)] !text-amber-950"
                : "!border-rose-200 !bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_62%,#fff7ed_100%)] !text-rose-950"
          }`}
          role={actionMessage.kind === "error" ? "alert" : "status"}
        >
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
            actionMessage.kind === "success"
              ? "bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-200"
              : actionMessage.kind === "warning"
                ? "bg-linear-to-br from-amber-500 to-orange-600 shadow-amber-200"
                : "bg-linear-to-br from-rose-500 to-red-600 shadow-rose-200"
          }`}>
            {actionMessage.kind === "success" ? <IconCheck size={26} stroke={3} aria-hidden="true" /> : actionMessage.kind === "warning" ? <IconAlertTriangle size={25} aria-hidden="true" /> : <IconX size={25} stroke={2.6} aria-hidden="true" />}
          </span>
          <div className="grid min-w-0 flex-1 gap-1.5">
            <strong className="text-base font-extrabold tracking-tight">
              {actionMessage.kind === "success" ? "Operación completada" : actionMessage.kind === "warning" ? "Atención" : "No se pudo completar"}
            </strong>
            <span className="leading-6 opacity-90">{actionMessage.text}</span>
          </div>
        </div>
      )}
      {loading && (
        <div className="materials-admin__state" role="status">
          <span className="materials-admin__spinner" />
          Cargando materiales…
        </div>
      )}
      {!loading && error && (
        <div className="materials-admin__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}
      {!loading && !error && result.data.length === 0 && (
        <div className="materials-admin__empty">
          <h2>{filtered ? "No hay coincidencias" : "Aún no hay materiales"}</h2>
          <p>
            {filtered
              ? "Pruebe con otros términos o limpie los filtros."
              : "Los materiales registrados aparecerán aquí."}
          </p>
        </div>
      )}
      {!loading && !error && result.data.length > 0 && (
        <MaterialTable
          materials={result.data}
          canManage={canManage}
          changingId={changingId}
          onStateChange={handleStateChange}
        />
      )}
      {!loading && !error && result.totalPages > 0 && (
        <nav
          className="materials-admin__pagination"
          aria-label="Paginación de materiales"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </button>
          <span>
            Página {page} de {result.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= result.totalPages}
            onClick={() =>
              setPage((value) => Math.min(result.totalPages, value + 1))
            }
          >
            Siguiente
          </button>
        </nav>
      )}
    </main>
  );
}

type TableProps = {
  materials: Material[];
  canManage: boolean;
  changingId: number | null;
  onStateChange: (material: Material, activo: boolean) => Promise<void>;
};

function MaterialTable({
  materials,
  canManage,
  changingId,
  onStateChange,
}: TableProps) {
  return (
    <div className="materials-admin__table-wrap materials-catalog-table overflow-x-auto !rounded-[22px] !border-sky-100 !bg-white !shadow-[0_12px_30px_rgba(30,90,156,0.07)] [&_thead]:!bg-[#0b3d78] [&_th]:!border-0 [&_th]:!py-4 [&_th]:!text-[0.72rem] [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_th]:!text-white [&_td]:!py-4 [&_td]:!align-top [&_tbody_tr]:!transition-colors hover:[&_tbody_tr]:!bg-sky-50/55">
      <table>
        <caption className="visually-hidden">Listado de materiales</caption>
        <thead>
          <tr>
            <th>Material</th>
            <th>Categoría</th>
            {canManage ? <th>Proveedor</th> : null}
            <th>Ubicación</th>
            <th>Existencia</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => {
            const lowStock = material.stockActual <= material.stockMinimo;
            const vencimiento = resolveVencimientoUi(material);
            return (
              <tr key={material.id}>
                <td data-label="Material">
                  <div className="flex min-w-[12rem] max-w-[22rem] items-start gap-3">
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-[#e8f4ff] to-[#d7ebff] text-[#0b6bcb]">
                      <IconPackage size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-[0.98rem] font-extrabold leading-snug tracking-tight text-[#062e63]">
                        {material.nombre}
                      </strong>
                      <span className="mt-1 block text-xs font-semibold text-[#6b849c]">
                        #{material.id} · {material.unidadMedida}
                      </span>
                      {material.descripcion ? (
                        <small className="mt-1.5 !block !line-clamp-2 !text-[0.8rem] !leading-5 !text-[#6a829a]">
                          {material.descripcion}
                        </small>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td data-label="Categoría">
                  <div className="grid gap-1.5">
                    <span className="font-semibold text-[#1e4b73]">
                      {material.categoria?.nombre ?? "Sin categoría"}
                    </span>
                    {material.categoria?.requiereFechaVencimiento ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-amber-800">
                        <IconCalendarTime size={12} aria-hidden="true" />
                        Con vencimiento
                      </span>
                    ) : null}
                  </div>
                </td>
                {canManage ? (
                  <td data-label="Proveedor">
                    <span className="font-semibold text-[#1e4b73]">
                      {material.proveedor?.nombre ?? "Sin proveedor"}
                    </span>
                    {material.proveedor && !material.proveedor.activo ? (
                      <small className="!mt-1 !block !text-rose-600">
                        Proveedor inactivo
                      </small>
                    ) : null}
                  </td>
                ) : null}
                <td data-label="Ubicación">
                  <span className="text-[#3d5f7c]">
                    {material.ubicacion || "Sin ubicación"}
                  </span>
                </td>
                <td data-label="Existencia">
                  <div className="grid gap-1">
                    <span
                      className={`inline-flex w-fit min-w-[2.75rem] items-center justify-center rounded-xl px-2.5 py-1.5 text-sm font-extrabold tabular-nums ${
                        lowStock
                          ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
                          : "bg-sky-50 text-[#0b4f8c] ring-1 ring-sky-100"
                      }`}
                    >
                      {material.stockActual}
                    </span>
                    <span className="text-[0.72rem] font-semibold text-[#7a92a8]">
                      Mín. {material.stockMinimo}
                      {lowStock ? " · bajo" : ""}
                    </span>
                  </div>
                </td>
                <td data-label="Vencimiento">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] font-bold ${
                      vencimiento.tone === "expired"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : vencimiento.tone === "soon"
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : vencimiento.tone === "ok"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <IconCalendarTime size={13} aria-hidden="true" />
                    {vencimiento.label}
                  </span>
                </td>
                <td data-label="Estado">
                  <span
                    className={`materials-admin__badge !inline-flex !items-center !gap-1.5 !rounded-full !border !px-3 !py-1.5 !text-xs !font-extrabold !shadow-sm ${material.activo ? "is-active !border-emerald-200 !bg-emerald-50 !text-emerald-700" : "is-inactive !border-slate-200 !bg-slate-100 !text-slate-600"}`}
                  >
                    {material.activo ? (
                      <IconCircleCheckFilled
                        className="text-emerald-500"
                        size={14}
                        aria-hidden="true"
                      />
                    ) : (
                      <IconCircleXFilled
                        className="text-slate-400"
                        size={14}
                        aria-hidden="true"
                      />
                    )}
                    {material.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className="materials-admin__row-actions !flex-nowrap !items-center !gap-2 max-[760px]:!flex-col">
                    {canManage ? (
                      <>
                        <Link
                          className="materials-admin__action !inline-flex !min-h-11 !items-center !justify-center !whitespace-nowrap !rounded-xl !border-0 !bg-linear-to-r !from-blue-700 !via-blue-600 !to-cyan-500 !px-4 !text-sm !font-extrabold !text-white !shadow-[0_8px_18px_rgba(37,99,235,0.22)] !transition-all !duration-300 !ease-out hover:!-translate-y-0.5 hover:!shadow-[0_12px_24px_rgba(37,99,235,0.3)] active:!translate-y-0 focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-blue-600 motion-reduce:!transform-none motion-reduce:!transition-none"
                          to={materialEditPath(material.id)}
                          state={{ material }}
                        >
                          Editar
                        </Link>
                        <MaterialStateAction
                          material={material}
                          disabled={changingId !== null}
                          onChange={onStateChange}
                        />
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-[#6b849c]">
                        Solo lectura
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

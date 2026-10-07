import { useState } from "react";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import type { Material } from "./types";
import { IconBan, IconRefresh } from "@tabler/icons-react";

type Props = {
  material: Material;
  disabled: boolean;
  onChange: (material: Material, activo: boolean) => Promise<void>;
};

export default function MaterialStateAction({
  material,
  disabled,
  onChange,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const handleClick = () =>
    material.activo ? setConfirming(true) : void onChange(material, true);
  return (
    <>
      <button
        type="button"
        className={`materials-admin__state-action group !inline-flex !min-h-14 !items-center !justify-center !gap-2.5 !whitespace-nowrap !rounded-2xl !px-6 !text-base !font-extrabold !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.03] active:!translate-y-0 active:!scale-[0.97] focus-visible:!outline-2 focus-visible:!outline-offset-4 disabled:!transform-none disabled:!opacity-60 motion-reduce:!transform-none motion-reduce:!transition-none ${material.activo ? "is-deactivate !border-rose-200 !bg-linear-to-r !from-rose-50 !to-red-50 !text-rose-700 !shadow-[0_9px_22px_rgba(225,29,72,0.14)] hover:!border-rose-400 hover:!from-rose-100 hover:!to-red-100 hover:!shadow-[0_15px_30px_rgba(225,29,72,0.23)] focus-visible:!outline-rose-600" : "is-reactivate !border-emerald-200 !bg-linear-to-r !from-emerald-50 !to-teal-50 !text-emerald-700 !shadow-[0_9px_22px_rgba(5,150,105,0.14)] hover:!border-emerald-400 hover:!from-emerald-100 hover:!to-teal-100 hover:!shadow-[0_15px_30px_rgba(5,150,105,0.23)] focus-visible:!outline-emerald-600"}`}
        disabled={disabled}
        onClick={handleClick}
      >
        {material.activo ? (
          <IconBan className="!transition-transform !duration-300 group-hover:!rotate-12 group-hover:!scale-110 motion-reduce:!transform-none" size={19} stroke={2} aria-hidden="true" />
        ) : (
          <IconRefresh className="!transition-transform !duration-300 group-hover:!rotate-180 motion-reduce:!transform-none" size={19} stroke={2} aria-hidden="true" />
        )}
        {disabled
          ? "Procesando…"
          : material.activo
            ? "Desactivar"
            : "Reactivar"}
      </button>
      <ConfirmDialog
        isOpen={confirming}
        title="Desactivar material"
        message={`¿Está segura de desactivar «${material.nombre}»? Dejará de estar disponible para nuevas salidas y solicitudes, pero se conservará su historial.`}
        confirmLabel="Desactivar material"
        confirmDanger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          void onChange(material, false);
        }}
      />
    </>
  );
}

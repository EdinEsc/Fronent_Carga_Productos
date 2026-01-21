
// src/components/AppHeader.jsx
export default function AppHeader({ active = "normalizacion", onChange }) {
  const pageTitle =
    active === "carga" ? "Carga de Productos" : "Limpieza de Datos";

  const baseBtn =
    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition";

  const activeBtn =
    "border-slate-900 bg-slate-900 text-white";

  const inactiveBtn =
    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Marca / Título */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3h8l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M15 3v5h5"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="text-sm font-semibold text-slate-900">
            {pageTitle}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange?.("normalizacion")}
            className={`${baseBtn} ${
              active === "normalizacion" ? activeBtn : inactiveBtn
            }`}
          >
            {/* Icono limpieza */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6v14m8-14v14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Limpieza de datos
          </button>

          <button
            onClick={() => onChange?.("carga")}
            className={`${baseBtn} ${
              active === "carga" ? activeBtn : inactiveBtn
            }`}
          >
            {/* Icono carga */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Carga de productos
          </button>
        </div>
      </div>
    </header>
  );
}

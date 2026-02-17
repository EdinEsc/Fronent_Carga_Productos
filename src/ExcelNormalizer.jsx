// // src/ExcelNormalizer.jsx
// import { useMemo, useState } from "react";

// export default function ExcelNormalizer() {
//   const API = useMemo(() => "http://127.0.0.1:8000", []);
//   const DEFAULT_ROUND = 2;

//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [uploadId, setUploadId] = useState(null);
//   const [groups, setGroups] = useState([]);
//   const [selected, setSelected] = useState(() => new Set());
//   const [stats, setStats] = useState(null);

//   const [applyIgvCost, setApplyIgvCost] = useState(false);
//   const [applyIgvSale, setApplyIgvSale] = useState(false);

//   const [openGroups, setOpenGroups] = useState(() => new Set());

//   const resetDuplicatesUI = () => {
//     setGroups([]);
//     setSelected(new Set());
//     setOpenGroups(new Set());
//   };

//   const toggleRow = (rowId) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (next.has(rowId)) next.delete(rowId);
//       else next.add(rowId);
//       return next;
//     });
//   };

//   // =========================
//   // NUEVO: SWITCH GLOBAL "Seleccionar todo"
//   // (se muestra arriba, junto a IGV)
//   // =========================
//   const selectAllRowsFromGroups = (gs) => {
//     const next = new Set();
//     for (const g of gs) {
//       for (const r of g.rows || []) next.add(r.__ROW_ID__);
//     }
//     return next;
//   };

//   const [selectAllEnabled, setSelectAllEnabled] = useState(false);

//   const toggleSelectAll = () => {
//     setSelectAllEnabled((prev) => {
//       const nextValue = !prev;

//       // si se activa: seleccionar todo
//       if (nextValue) {
//         setSelected(selectAllRowsFromGroups(groups));
//       } else {
//         // si se desactiva: limpiar selección
//         setSelected(new Set());
//       }

//       return nextValue;
//     });
//   };

//   // si llegan nuevos groups (después de analizar), aplica el estado del switch
//   const syncSelectAllWithGroups = (nextGroups) => {
//     if (selectAllEnabled) {
//       setSelected(selectAllRowsFromGroups(nextGroups));
//     } else {
//       setSelected(new Set());
//     }
//   };

//   const validateSelection = () => {
//     for (const g of groups) {
//       const hasOne = g.rows.some((r) => selected.has(r.__ROW_ID__));
//       if (!hasOne) return false;
//     }
//     return true;
//   };

//   const toggleGroupOpen = (key) => {
//     setOpenGroups((prev) => {
//       const next = new Set(prev);
//       if (next.has(key)) next.delete(key);
//       else next.add(key);
//       return next;
//     });
//   };

//   const downloadNormalized = async (rowIds, forcedUploadId = null) => {
//     const effectiveUploadId = forcedUploadId ?? uploadId;
//     if (!effectiveUploadId) {
//       throw new Error("Primero debes subir y analizar el archivo (uploadId vacío).");
//     }

//     const qs =
//       `&round_numeric=${DEFAULT_ROUND}` +
//       `&apply_igv_cost=${applyIgvCost ? "true" : "false"}` +
//       `&apply_igv_sale=${applyIgvSale ? "true" : "false"}`;

//     const url = `${API}/excel/normalize?upload_id=${encodeURIComponent(
//       effectiveUploadId
//     )}${qs}`;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(rowIds),
//     });

//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(`Backend respondió ${res.status}. ${t || ""}`);
//     }

//     setStats({
//       rowsBefore: res.headers.get("X-Rows-Before"),
//       rowsOk: res.headers.get("X-Rows-OK"),
//       rowsCorrected: res.headers.get("X-Rows-Corrected"),
//       errorsCount: res.headers.get("X-Errors-Count"),
//       codesFixed: res.headers.get("X-Codes-Fixed"),
//     });

//     const blob = await res.blob();
//     const urlBlob = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = urlBlob;

//     const base = (file?.name || "archivo").replace(/\.xlsx$/i, "");
//     a.download = `${base}_QA.xlsx`;

//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(urlBlob);

//     resetDuplicatesUI();
//     setSelectAllEnabled(false); // reset del switch
//   };

//   const onAnalyze = async (e) => {
//     e.preventDefault();
//     setError("");
//     setStats(null);
//     resetDuplicatesUI();
//     setUploadId(null);

//     if (!file) {
//       setError("Selecciona un archivo Excel (.xlsx)");
//       return;
//     }

//     try {
//       setLoading(true);

//       const form = new FormData();
//       form.append("file", file);

//       const res = await fetch(
//         `${API}/excel/analyze?round_numeric=${DEFAULT_ROUND}`,
//         {
//           method: "POST",
//           body: form,
//         }
//       );

//       if (!res.ok) {
//         const t = await res.text().catch(() => "");
//         throw new Error(`Backend respondió ${res.status}. ${t || ""}`);
//       }

//       const data = await res.json();
//       setUploadId(data.upload_id);

//       if (!data.has_duplicates) {
//         await downloadNormalized([], data.upload_id);
//         return;
//       }

//       const nextGroups = data.groups || [];
//       setGroups(nextGroups);

//       // abre el primer grupo
//       if (nextGroups.length > 0) {
//         setOpenGroups(new Set([nextGroups[0].key]));
//       }

//       // NUEVO: aplica "seleccionar todo" si el switch estaba activo
//       syncSelectAllWithGroups(nextGroups);
//     } catch (err) {
//       setError(err?.message || "Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onContinueWithSelection = async () => {
//     setError("");
//     setStats(null);

//     if (!validateSelection()) {
//       setError("Debes seleccionar al menos una fila por cada grupo de duplicados.");
//       return;
//     }

//     try {
//       setLoading(true);
//       await downloadNormalized(Array.from(selected));
//     } catch (err) {
//       setError(err?.message || "Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const hasDuplicates = groups.length > 0;
//   const endpointAnalyze = `${API}/excel/analyze?round_numeric=${DEFAULT_ROUND}`;

//   return (
//     <div className="w-full">
//       <form onSubmit={onAnalyze} className="space-y-6">
//         {/* File */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium text-slate-700">
//             Archivo Excel (.xlsx)
//           </label>

//           <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-900 hover:bg-slate-50">
//             <input
//               type="file"
//               accept=".xlsx"
//               className="hidden"
//               onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//             />

//             <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-800 transition group-hover:bg-slate-900 group-hover:text-white">
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M12 16V4m0 0 4 4M12 4 8 8"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <path
//                   d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>

//             <div className="mt-3 text-sm font-semibold text-slate-900">
//               {file ? file.name : "Seleccionar archivo .xlsx"}
//             </div>
//             <div className="mt-1 text-xs text-slate-500">
//               Endpoint:{" "}
//               <span className="font-mono break-all">{endpointAnalyze}</span>
//             </div>
//           </label>
//         </div>

//         {/* IGV toggles + Seleccionar todo (switch arriba) */}
//         <div className="grid gap-3 md:grid-cols-3">
//           <ToggleCard
//             title="Aplicar IGV (1.18) a Precio Costo"
//             value={applyIgvCost}
//             onToggle={() => setApplyIgvCost((v) => !v)}
//           />
//           <ToggleCard
//             title="Aplicar IGV (1.18) a Precio Venta"
//             value={applyIgvSale}
//             onToggle={() => setApplyIgvSale((v) => !v)}
//           />
//           <ToggleCard
//             title="Seleccionar todo (duplicados)"
//             value={selectAllEnabled}
//             onToggle={toggleSelectAll}
//             disabled={!hasDuplicates} // solo se activa cuando ya hay duplicados
//           />
//         </div>

//         {/* Action + info */}
//         <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//           <div className="flex flex-col gap-2 md:flex-row md:items-center">
//             <button
//               type="submit"
//               disabled={loading}
//               className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition md:w-auto ${
//                 loading
//                   ? "bg-slate-300 cursor-not-allowed"
//                   : "bg-slate-900 hover:bg-slate-800"
//               }`}
//             >
//               {loading ? (
//                 <>
//                   <Spinner />
//                   Analizando...
//                 </>
//               ) : (
//                 <>
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                     <path
//                       d="M21 21 15.8 15.8M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                   Subir y analizar duplicados
//                 </>
//               )}
//             </button>

//             <div className="text-xs text-slate-500">
//               uploadId:{" "}
//               <span className="font-mono break-all text-slate-800">
//                 {uploadId ?? "-"}
//               </span>
//             </div>
//           </div>

//           <div className="text-sm text-slate-600 md:text-right">
//             <span className="text-slate-500">Redondeo fijo:</span>{" "}
//             <span className="font-mono font-semibold text-slate-900">
//               {DEFAULT_ROUND}
//             </span>
//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
//             <div className="mt-0.5 text-red-700">
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//             <div>
//               <div className="text-sm font-semibold text-red-800">Error</div>
//               <div className="text-sm text-red-700">{error}</div>
//             </div>
//           </div>
//         )}

//         {/* Stats */}
//         {stats && (
//           <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
//             <div className="text-sm font-semibold text-emerald-900">Resultado</div>
//             <div className="mt-3 grid grid-cols-2 gap-3">
//               <Stat label="Filas antes" value={stats.rowsBefore} />
//               <Stat label="Filas OK" value={stats.rowsOk} />
//               <Stat label="Filas corregidas" value={stats.rowsCorrected} />
//               <Stat label="Errores detectados" value={stats.errorsCount} />
//               <div className="col-span-2">
//                 <Stat label="Códigos generados/fijados" value={stats.codesFixed} />
//               </div>
//             </div>
//           </div>
//         )}
//       </form>

//       {/* DUPLICADOS */}
//       {hasDuplicates ? (
//         <div className="mt-8">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Duplicados detectados
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 Selecciona al menos 1 fila por cada nombre duplicado y luego descarga el QA.
//               </p>
//             </div>

//             <button
//               type="button"
//               disabled={loading || !validateSelection()}
//               onClick={onContinueWithSelection}
//               className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
//                 loading || !validateSelection()
//                   ? "bg-slate-300 cursor-not-allowed"
//                   : "bg-emerald-600 hover:bg-emerald-700"
//               }`}
//             >
//               {loading ? (
//                 <>
//                   <Spinner />
//                   Generando...
//                 </>
//               ) : (
//                 "Continuar y descargar QA"
//               )}
//             </button>
//           </div>

//           <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
//             <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
//               {groups.map((g) => {
//                 const columns = g.rows?.length
//                   ? Object.keys(g.rows[0]).filter((c) => c !== "__ROW_ID__")
//                   : [];

//                 const groupValid = g.rows.some((r) => selected.has(r.__ROW_ID__));
//                 const isOpen = openGroups.has(g.key);

//                 return (
//                   <div
//                     key={g.key}
//                     className="overflow-hidden rounded-2xl border border-slate-200"
//                   >
//                     <button
//                       type="button"
//                       onClick={() => toggleGroupOpen(g.key)}
//                       className="w-full text-left"
//                     >
//                       <div className="flex items-start justify-between gap-4 bg-slate-50 px-5 py-4">
//                         <div className="min-w-0">
//                           <div className="text-xs font-medium text-slate-600">
//                             Nombre duplicado
//                           </div>
//                           <div className="mt-1 break-words whitespace-normal text-sm font-semibold text-slate-900">
//                             {g.key}
//                           </div>
//                           <div className="mt-1 text-xs text-slate-500">
//                             Total filas: {g.count}
//                           </div>
//                         </div>

//                         <div className="flex shrink-0 flex-col items-end gap-2">
//                           <span
//                             className={`rounded-full px-3 py-1 text-xs font-medium ${
//                               groupValid
//                                 ? "bg-emerald-100 text-emerald-800"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {groupValid ? "Selección válida" : "Falta 1 selección"}
//                           </span>
//                           <span className="text-xs text-slate-500">
//                             {isOpen ? "Ocultar" : "Ver"}
//                           </span>
//                         </div>
//                       </div>
//                     </button>

//                     {isOpen ? (
//                       <div className="overflow-auto">
//                         <table className="min-w-full text-sm">
//                           <thead className="sticky top-0 z-10 bg-white">
//                             <tr className="border-b border-slate-200">
//                               <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
//                                 Seleccionar
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
//                                 Fila
//                               </th>
//                               {columns.map((c) => (
//                                 <th
//                                   key={c}
//                                   className="px-4 py-3 text-left text-xs font-semibold text-slate-700"
//                                 >
//                                   {c}
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {g.rows.map((r) => (
//                               <tr
//                                 key={r.__ROW_ID__}
//                                 className="border-b border-slate-100 hover:bg-slate-50"
//                               >
//                                 <td className="px-4 py-3">
//                                   <input
//                                     type="checkbox"
//                                     checked={selected.has(r.__ROW_ID__)}
//                                     onChange={() => toggleRow(r.__ROW_ID__)}
//                                     className="h-4 w-4"
//                                   />
//                                 </td>
//                                 <td className="px-4 py-3 font-mono text-xs text-slate-700">
//                                   {r.__ROW_ID__}
//                                 </td>
//                                 {columns.map((c) => (
//                                   <td
//                                     key={c}
//                                     className="whitespace-nowrap px-4 py-3 text-slate-700"
//                                   >
//                                     {String(r[c] ?? "")}
//                                   </td>
//                                 ))}
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     ) : null}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

// /* Helpers */
// function Spinner() {
//   return (
//     <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
//       <circle
//         className="opacity-25"
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="4"
//       />
//       <path
//         className="opacity-75"
//         d="M4 12a8 8 0 0 1 8-8"
//         stroke="currentColor"
//         strokeWidth="4"
//         strokeLinecap="round"
//       />
//     </svg>
//   );
// }

// function ToggleCard({ title, value, onToggle, disabled = false }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4">
//       <div className="flex items-start justify-between gap-4">
//         <div className="text-sm font-semibold text-slate-900">{title}</div>
//         <button
//           type="button"
//           onClick={onToggle}
//           disabled={disabled}
//           className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//             disabled
//               ? "bg-slate-200 cursor-not-allowed"
//               : value
//               ? "bg-slate-900"
//               : "bg-slate-300"
//           }`}
//           aria-label="toggle"
//         >
//           <span
//             className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//               value ? "translate-x-5" : "translate-x-1"
//             }`}
//           />
//         </button>
//       </div>
//       {disabled ? (
//         <div className="mt-2 text-xs text-slate-500">
//           Disponible cuando se detecten duplicados.
//         </div>
//       ) : null}
//     </div>
//   );
// }

// function Stat({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-emerald-200 bg-white/60 p-4">
//       <div className="text-xs font-medium text-emerald-900">{label}</div>
//       <div className="mt-1 text-xl font-semibold text-slate-900">
//         {value ?? "-"}
//       </div>
//     </div>
//   );
// }


// src/ExcelNormalizer.jsx
import { useMemo, useState, useEffect } from "react";

export default function ExcelNormalizer() {
  const API = useMemo(() => "http://127.0.0.1:8000", []);
  const DEFAULT_ROUND = 2;

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [uploadId, setUploadId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [stats, setStats] = useState(null);

  // ===== NUEVO: Estado para Selva =====
  const [isSelva, setIsSelva] = useState(false);
  
  const [applyIgvCost, setApplyIgvCost] = useState(false);
  const [applyIgvSale, setApplyIgvSale] = useState(false);

  const [openGroups, setOpenGroups] = useState(() => new Set());

  // ===== EFECTO: Cuando se activa Selva, desactivar IGV y resetear toggles =====
  useEffect(() => {
    if (isSelva) {
      setApplyIgvCost(false);
      setApplyIgvSale(false);
    }
  }, [isSelva]);

  const resetDuplicatesUI = () => {
    setGroups([]);
    setSelected(new Set());
    setOpenGroups(new Set());
  };

  const toggleRow = (rowId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  // =========================
  // SWITCH GLOBAL "Seleccionar todo"
  // =========================
  const selectAllRowsFromGroups = (gs) => {
    const next = new Set();
    for (const g of gs) {
      for (const r of g.rows || []) next.add(r.__ROW_ID__);
    }
    return next;
  };

  const [selectAllEnabled, setSelectAllEnabled] = useState(false);

  const toggleSelectAll = () => {
    setSelectAllEnabled((prev) => {
      const nextValue = !prev;

      if (nextValue) {
        setSelected(selectAllRowsFromGroups(groups));
      } else {
        setSelected(new Set());
      }

      return nextValue;
    });
  };

  const syncSelectAllWithGroups = (nextGroups) => {
    if (selectAllEnabled) {
      setSelected(selectAllRowsFromGroups(nextGroups));
    } else {
      setSelected(new Set());
    }
  };

  const validateSelection = () => {
    for (const g of groups) {
      const hasOne = g.rows.some((r) => selected.has(r.__ROW_ID__));
      if (!hasOne) return false;
    }
    return true;
  };

  const toggleGroupOpen = (key) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const downloadNormalized = async (rowIds, forcedUploadId = null) => {
    const effectiveUploadId = forcedUploadId ?? uploadId;
    if (!effectiveUploadId) {
      throw new Error("Primero debes subir y analizar el archivo (uploadId vacío).");
    }

    // ===== IMPORTANTE: Pasar isSelva al backend =====
    const qs =
      `&round_numeric=${DEFAULT_ROUND}` +
      `&apply_igv_cost=${applyIgvCost ? "true" : "false"}` +
      `&apply_igv_sale=${applyIgvSale ? "true" : "false"}` +
      `&is_selva=${isSelva ? "true" : "false"}`;  // NUEVO: parámetro para Selva

    const url = `${API}/excel/normalize?upload_id=${encodeURIComponent(
      effectiveUploadId
    )}${qs}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rowIds),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Backend respondió ${res.status}. ${t || ""}`);
    }

    setStats({
      rowsBefore: res.headers.get("X-Rows-Before"),
      rowsOk: res.headers.get("X-Rows-OK"),
      rowsCorrected: res.headers.get("X-Rows-Corrected"),
      errorsCount: res.headers.get("X-Errors-Count"),
      codesFixed: res.headers.get("X-Codes-Fixed"),
    });

    const blob = await res.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;

    const base = (file?.name || "archivo").replace(/\.xlsx$/i, "");
    a.download = `${base}_QA.xlsx`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlBlob);

    resetDuplicatesUI();
    setSelectAllEnabled(false);
  };

  const onAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setStats(null);
    resetDuplicatesUI();
    setUploadId(null);

    if (!file) {
      setError("Selecciona un archivo Excel (.xlsx)");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        `${API}/excel/analyze?round_numeric=${DEFAULT_ROUND}`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Backend respondió ${res.status}. ${t || ""}`);
      }

      const data = await res.json();
      setUploadId(data.upload_id);

      if (!data.has_duplicates) {
        await downloadNormalized([], data.upload_id);
        return;
      }

      const nextGroups = data.groups || [];
      setGroups(nextGroups);

      if (nextGroups.length > 0) {
        setOpenGroups(new Set([nextGroups[0].key]));
      }

      syncSelectAllWithGroups(nextGroups);
    } catch (err) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const onContinueWithSelection = async () => {
    setError("");
    setStats(null);

    if (!validateSelection()) {
      setError("Debes seleccionar al menos una fila por cada grupo de duplicados.");
      return;
    }

    try {
      setLoading(true);
      await downloadNormalized(Array.from(selected));
    } catch (err) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const hasDuplicates = groups.length > 0;
  const endpointAnalyze = `${API}/excel/analyze?round_numeric=${DEFAULT_ROUND}`;

  return (
    <div className="w-full">
      <form onSubmit={onAnalyze} className="space-y-6">
        {/* File */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Archivo Excel (.xlsx)
          </label>

          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-900 hover:bg-slate-50">
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-800 transition group-hover:bg-slate-900 group-hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V4m0 0 4 4M12 4 8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="mt-3 text-sm font-semibold text-slate-900">
              {file ? file.name : "Seleccionar archivo .xlsx"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Endpoint:{" "}
              <span className="font-mono break-all">{endpointAnalyze}</span>
            </div>
          </label>
        </div>

        {/* ===== NUEVO: Toggle para Selva (arriba de todo) ===== */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-700">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-emerald-900">¿Es de la Selva?</div>
                <div className="text-xs text-emerald-700">
                  {isSelva 
                    ? "✅ Activado: IGV bloqueado, porcentaje = 0%" 
                    : "⚪ Desactivado: IGV disponible, porcentaje = 18%"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSelva(!isSelva)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                isSelva ? "bg-emerald-600" : "bg-slate-300"
              }`}
              aria-label="toggle selva"
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${
                  isSelva ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* IGV toggles + Seleccionar todo - AHORA CON BLOQUEO POR SELVA */}
        <div className="grid gap-3 md:grid-cols-3">
          <ToggleCard
            title="Aplicar IGV (1.18) a Precio Costo"
            value={applyIgvCost}
            onToggle={() => setApplyIgvCost((v) => !v)}
            disabled={isSelva} // BLOQUEADO si es Selva
          />
          <ToggleCard
            title="Aplicar IGV (1.18) a Precio Venta"
            value={applyIgvSale}
            onToggle={() => setApplyIgvSale((v) => !v)}
            disabled={isSelva} // BLOQUEADO si es Selva
          />
          <ToggleCard
            title="Seleccionar todo (duplicados)"
            value={selectAllEnabled}
            onToggle={toggleSelectAll}
            disabled={!hasDuplicates}
          />
        </div>

        {/* Mensaje informativo cuando Selva está activado */}
        {isSelva && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
            <span className="font-semibold">🌿 Modo Selva activado:</span> IGV bloqueado y porcentaje se establecerá en 0% automáticamente.
          </div>
        )}

        {/* Action + info */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition md:w-auto ${
                loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {loading ? (
                <>
                  <Spinner />
                  Analizando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21 15.8 15.8M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Subir y analizar duplicados
                </>
              )}
            </button>

            <div className="text-xs text-slate-500">
              uploadId:{" "}
              <span className="font-mono break-all text-slate-800">
                {uploadId ?? "-"}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-600 md:text-right">
            <span className="text-slate-500">Redondeo fijo:</span>{" "}
            <span className="font-mono font-semibold text-slate-900">
              {DEFAULT_ROUND}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="mt-0.5 text-red-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-red-800">Error</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="text-sm font-semibold text-emerald-900">Resultado</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Filas antes" value={stats.rowsBefore} />
              <Stat label="Filas OK" value={stats.rowsOk} />
              <Stat label="Filas corregidas" value={stats.rowsCorrected} />
              <Stat label="Errores detectados" value={stats.errorsCount} />
              <div className="col-span-2">
                <Stat label="Códigos generados/fijados" value={stats.codesFixed} />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* DUPLICADOS */}
      {hasDuplicates ? (
        <div className="mt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Duplicados detectados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecciona al menos 1 fila por cada nombre duplicado y luego descarga el QA.
              </p>
            </div>

            <button
              type="button"
              disabled={loading || !validateSelection()}
              onClick={onContinueWithSelection}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                loading || !validateSelection()
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? (
                <>
                  <Spinner />
                  Generando...
                </>
              ) : (
                "Continuar y descargar QA"
              )}
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
            <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
              {groups.map((g) => {
                const columns = g.rows?.length
                  ? Object.keys(g.rows[0]).filter((c) => c !== "__ROW_ID__")
                  : [];

                const groupValid = g.rows.some((r) => selected.has(r.__ROW_ID__));
                const isOpen = openGroups.has(g.key);

                return (
                  <div
                    key={g.key}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroupOpen(g.key)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-4 bg-slate-50 px-5 py-4">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-600">
                            Nombre duplicado
                          </div>
                          <div className="mt-1 break-words whitespace-normal text-sm font-semibold text-slate-900">
                            {g.key}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Total filas: {g.count}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              groupValid
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {groupValid ? "Selección válida" : "Falta 1 selección"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {isOpen ? "Ocultar" : "Ver"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="overflow-auto">
                        <table className="min-w-full text-sm">
                          <thead className="sticky top-0 z-10 bg-white">
                            <tr className="border-b border-slate-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                                Seleccionar
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                                Fila
                              </th>
                              {columns.map((c) => (
                                <th
                                  key={c}
                                  className="px-4 py-3 text-left text-xs font-semibold text-slate-700"
                                >
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {g.rows.map((r) => (
                              <tr
                                key={r.__ROW_ID__}
                                className="border-b border-slate-100 hover:bg-slate-50"
                              >
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selected.has(r.__ROW_ID__)}
                                    onChange={() => toggleRow(r.__ROW_ID__)}
                                    className="h-4 w-4"
                                  />
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                                  {r.__ROW_ID__}
                                </td>
                                {columns.map((c) => (
                                  <td
                                    key={c}
                                    className="whitespace-nowrap px-4 py-3 text-slate-700"
                                  >
                                    {String(r[c] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* Helpers */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ToggleCard({ title, value, onToggle, disabled = false }) {
  return (
    <div className={`rounded-2xl border ${disabled ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'} p-4`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>
          {title}
          {disabled && <span className="ml-2 text-xs font-normal text-slate-400">(bloqueado)</span>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            disabled
              ? "bg-slate-200 cursor-not-allowed"
              : value
              ? "bg-slate-900"
              : "bg-slate-300"
          }`}
          aria-label="toggle"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              value ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {disabled ? (
        <div className="mt-2 text-xs text-slate-400">
          Bloqueado en modo Selva
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white/60 p-4">
      <div className="text-xs font-medium text-emerald-900">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {value ?? "-"}
      </div>
    </div>
  );
}



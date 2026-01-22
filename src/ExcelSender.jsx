
// // src/ExcelSender.jsx
// import { useMemo, useState, useCallback } from "react";

// export default function ExcelSender() {
//   // ======================
//   // NODOS
//   // ======================
//   const NODES = useMemo(
//     () => [
//       { key: "n1", label: "Nodo 1", base: "https://n1.japiexcel.casamarketapp.com" },
//       { key: "n23", label: "Nodo 2 / 3", base: "https://n3.japiexcel.casamarketapp.com" },
//       { key: "n4", label: "Nodo 4", base: "https://n4.japiexcel.casamarketapp.com" },
//       { key: "n5", label: "Nodo 5", base: "https://n5.japiexcel.casamarketapp.com" },
//     ],
//     []
//   );

//   // ======================
//   // STATES
//   // ======================
//   const [nodeKey, setNodeKey] = useState("n1");
//   const [companyId, setCompanyId] = useState("");
//   const [priceListId, setPriceListId] = useState("");
//   const [subsidiaryId, setSubsidiaryId] = useState("");

//   const [idWarehouse, setIdWarehouse] = useState("");
//   const [idCountry, setIdCountry] = useState("1");
//   const [taxCodeCountry, setTaxCodeCountry] = useState("02");
//   const [flagUseSimpleBrand, setFlagUseSimpleBrand] = useState(true);

//   const [fileProductos, setFileProductos] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState(null);

//   const baseUrl = useMemo(() => {
//     return NODES.find((n) => n.key === nodeKey)?.base || NODES[0].base;
//   }, [nodeKey, NODES]);

//   const buildEndpoint = useCallback(() => {
//     return (
//       `${baseUrl}/api/excel/readexcel/${encodeURIComponent(companyId)}` +
//       `/pricelist/${encodeURIComponent(priceListId)}` +
//       `/subsidiary/${encodeURIComponent(subsidiaryId)}`
//     );
//   }, [baseUrl, companyId, priceListId, subsidiaryId]);

//   const endpointPreview =
//     companyId && priceListId && subsidiaryId ? buildEndpoint() : "";

//   const canSend =
//     !!fileProductos && !!companyId && !!priceListId && !!subsidiaryId && !loading;

//   // ======================
//   // SEND
//   // ======================
//   const onSend = async () => {
//     setError("");
//     setResult(null);

//     if (!fileProductos) return setError("Selecciona el archivo Excel (.xlsx o .xls).");
//     if (!companyId || !priceListId || !subsidiaryId) {
//       return setError("Completa Company ID, PriceList ID y Subsidiary ID.");
//     }

//     try {
//       setLoading(true);

//       const form = new FormData();
//       form.append("file_excel", fileProductos);
//       form.append("idCountry", idCountry);
//       form.append("taxCodeCountry", taxCodeCountry);
//       form.append("flagUseSimpleBrand", String(flagUseSimpleBrand));
//       if (idWarehouse) form.append("idWarehouse", idWarehouse);

//       const res = await fetch(buildEndpoint(), { method: "POST", body: form });

//       const text = await res.text();
//       if (!res.ok) throw new Error(text);

//       try {
//         setResult(JSON.parse(text));
//       } catch {
//         setResult(text);
//       }
//     } catch (e) {
//       setError(e?.message || "Error enviando el archivo");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ======================
//   // UI (modern, corporate)
//   // ======================
//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Content */}
//       <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-12">
//         {/* Left: form */}
//         <div className="lg:col-span-7">
//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-100 p-6">
//               <h1 className="text-lg font-semibold text-slate-900">
//                 Cargar archivo y enviar
//               </h1>
//               <p className="mt-1 text-sm text-slate-500">
//                 Completa los IDs, selecciona el nodo y adjunta el Excel.
//               </p>
//             </div>

//             <div className="space-y-6 p-6">
//               {/* Nodo */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-700">Nodo</label>
//                 <select
//                   value={nodeKey}
//                   onChange={(e) => setNodeKey(e.target.value)}
//                   className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
//                 >
//                   {NODES.map((n) => (
//                     <option key={n.key} value={n.key}>
//                       {n.label} — {n.base.replace("https://", "")}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* IDs */}
//               <div>
//                 <div className="mb-2 flex items-center justify-between">
//                   <label className="text-sm font-medium text-slate-700">IDs</label>
//                   <span className="text-xs text-slate-500">Obligatorios</span>
//                 </div>

//                 <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//                   <Field
//                     label="Company ID"
//                     placeholder="Ej: 5454"
//                     value={companyId}
//                     onChange={setCompanyId}
//                   />
//                   <Field
//                     label="PriceList ID"
//                     placeholder="Ej: 7662"
//                     value={priceListId}
//                     onChange={setPriceListId}
//                   />
//                   <Field
//                     label="Subsidiary ID"
//                     placeholder="Ej: 7821"
//                     value={subsidiaryId}
//                     onChange={setSubsidiaryId}
//                   />
//                 </div>
//               </div>

//               {/* Parámetros */}
//               <div>
//                 <div className="mb-2 flex items-center justify-between">
//                   <label className="text-sm font-medium text-slate-700">Parámetros</label>
//                   <span className="text-xs text-slate-500">Form-data</span>
//                 </div>

//                 <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//                   <Field
//                     label="idCountry"
//                     placeholder="1"
//                     value={idCountry}
//                     onChange={setIdCountry}
//                   />


//                   <TaxCodeSelect value={taxCodeCountry} onChange={setTaxCodeCountry} />




//                   <Field
//                     label="idWarehouse (opcional)"
//                     placeholder="Ej: 5712"
//                     value={idWarehouse}
//                     onChange={setIdWarehouse}
//                     helper="Solo si el cliente tiene más de una tienda/almacén."
//                   />
//                 </div>

//                 <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
//                   <div>
//                     <div className="text-sm font-medium text-slate-900">
//                       flagUseSimpleBrand
//                     </div>
//                     <div className="text-xs text-slate-500">
//                       Envía <span className="font-mono">true/false</span> al backend.
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => setFlagUseSimpleBrand((v) => !v)}
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                       flagUseSimpleBrand ? "bg-slate-900" : "bg-slate-300"
//                     }`}
//                     aria-label="Toggle flagUseSimpleBrand"
//                   >
//                     <span
//                       className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                         flagUseSimpleBrand ? "translate-x-5" : "translate-x-1"
//                       }`}
//                     />
//                   </button>
//                 </div>
//               </div>

//               {/* Archivo */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-700">Archivo Excel</label>

//                 <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-900 hover:bg-slate-50">
//                   <input
//                     type="file"
//                     accept=".xlsx,.xls"
//                     className="hidden"
//                     onChange={(e) => setFileProductos(e.target.files?.[0] ?? null)}
//                   />

//                   <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-800 transition group-hover:bg-slate-900 group-hover:text-white">
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                       <path
//                         d="M12 16V4m0 0 4 4M12 4 8 8"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                       <path
//                         d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </div>

//                   <div className="mt-3 text-sm font-semibold text-slate-900">
//                     {fileProductos ? fileProductos.name : "Seleccionar archivo .xlsx / .xls"}
//                   </div>
//                   <div className="mt-1 text-xs text-slate-500">
//                     Se enviará como <span className="font-mono">file_excel</span> (multipart/form-data)
//                   </div>
//                 </label>
//               </div>

//               {/* Error */}
//               {error && (
//                 <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
//                   <div className="mt-0.5 text-red-700">
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                       <path
//                         d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-red-800">Error</div>
//                     <div className="text-sm text-red-700">{error}</div>
//                   </div>
//                 </div>
//               )}

//               {/* Actions */}
//               <div className="flex flex-col gap-3 md:flex-row md:items-center">
//                 <button
//                   type="button"
//                   onClick={onSend}
//                   disabled={!canSend}
//                   className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition md:w-auto ${
//                     canSend
//                       ? "bg-slate-900 hover:bg-slate-800"
//                       : "bg-slate-300 cursor-not-allowed"
//                   }`}
//                 >
//                   {loading ? (
//                     <>
//                       <Spinner />
//                       Enviando...
//                     </>
//                   ) : (
//                     <>
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                         <path
//                           d="M22 2 11 13"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                         <path
//                           d="M22 2 15 22l-4-9-9-4 20-7z"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       Enviar Excel
//                     </>
//                   )}
//                 </button>

//                 <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
//                   <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <path
//                         d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                       <path
//                         d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     Endpoint
//                   </div>
//                   <div className="mt-1 break-all font-mono text-xs text-slate-800">
//                     {endpointPreview || "Completa los IDs para ver el endpoint"}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right: response */}
//         <div className="lg:col-span-5">
//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-100 p-6">
//               <h2 className="text-lg font-semibold text-slate-900">Respuesta del servidor</h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 Verifica si el backend retornó JSON o texto.
//               </p>
//             </div>

//             <div className="p-6">
//               {result ? (
//                 <pre className="max-h-[560px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
//                   {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
//                 </pre>
//               ) : (
//                 <EmptyState />
//               )}
//             </div>
//           </div>

//           {/* Tips */}
//           <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//             <div className="text-sm font-semibold text-slate-900">Recomendaciones</div>
//             <ul className="mt-3 space-y-2 text-sm text-slate-600">
//               <li className="flex gap-2">
//                 <Dot />
//                 <span>
//                   Si el cliente tiene 1 sola tienda, deja <span className="font-mono">idWarehouse</span> vacío.
//                 </span>
//               </li>
//               <li className="flex gap-2">
//                 <Dot />
//                 <span>
//                   El archivo se manda como <span className="font-mono">multipart/form-data</span>.
//                 </span>
//               </li>
//               <li className="flex gap-2">
//                 <Dot />
//                 <span>
//                   Si sale error 4xx/5xx, revisa los IDs y el nodo.
//                 </span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ======================
//    Helpers (same file)
//    ====================== */

// function Field({ label, value, onChange, placeholder, helper }) {
//   return (
//     <div className="space-y-1.5">
//       <label className="text-sm font-medium text-slate-700">{label}</label>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
//       />
//       {helper ? <div className="text-xs text-slate-500">{helper}</div> : null}
//     </div>
//   );
// }

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

// function Dot() {
//   return <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />;
// }

// function EmptyState() {
//   return (
//     <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
//       <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//           <path
//             d="M7 3h8l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinejoin="round"
//           />
//           <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
//         </svg>
//       </div>
//       <div className="mt-3 text-sm font-semibold text-slate-900">
//         Sin resultados todavía
//       </div>
//       <div className="mt-1 text-sm text-slate-600">
//         Cuando envíes el Excel, aquí se mostrará la respuesta del servidor.
//       </div>
//     </div>
//   );
// }

// function TaxCodeSelect({ value, onChange }) {
//   return (
//     <div className="space-y-1.5">
//       <label className="text-sm font-medium text-slate-700">taxCodeCountry</label>

//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
//       >
//         <option value="01">01 — IGV</option>
//         <option value="02">02 — Exonerado</option>
//       </select>

//       <div className="text-xs text-slate-500">
//         Selecciona el código tributario a enviar al backend.
//       </div>
//     </div>
//   );
// }



// src/ExcelSender.jsx
import { useMemo, useState, useCallback } from "react";

export default function ExcelSender() {
  // ======================
  // NODOS
  // ======================
  const NODES = useMemo(
    () => [
      { key: "n1", label: "Nodo 1", base: "https://n1.japiexcel.casamarketapp.com" },
      { key: "n23", label: "Nodo 2 / 3", base: "https://n3.japiexcel.casamarketapp.com" },
      { key: "n4", label: "Nodo 4", base: "https://n4.japiexcel.casamarketapp.com" },
      { key: "n5", label: "Nodo 5", base: "https://n5.japiexcel.casamarketapp.com" },
    ],
    []
  );

  // ======================
  // STATES
  // ======================
  const [nodeKey, setNodeKey] = useState("n1");
  const [companyId, setCompanyId] = useState("");
  const [priceListId, setPriceListId] = useState("");
  const [subsidiaryId, setSubsidiaryId] = useState("");

  const [idWarehouse, setIdWarehouse] = useState("");
  const [idCountry, setIdCountry] = useState("1");
  const [taxCodeCountry, setTaxCodeCountry] = useState("02");
  const [flagUseSimpleBrand, setFlagUseSimpleBrand] = useState(true);

  const [fileProductos, setFileProductos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [result, setResult] = useState(null);

  const baseUrl = useMemo(() => {
    return NODES.find((n) => n.key === nodeKey)?.base || NODES[0].base;
  }, [nodeKey, NODES]);

  const buildEndpoint = useCallback(() => {
    return (
      `${baseUrl}/api/excel/readexcel/${encodeURIComponent(companyId)}` +
      `/pricelist/${encodeURIComponent(priceListId)}` +
      `/subsidiary/${encodeURIComponent(subsidiaryId)}`
    );
  }, [baseUrl, companyId, priceListId, subsidiaryId]);

  const endpointPreview =
    companyId && priceListId && subsidiaryId ? buildEndpoint() : "";

  const canSend =
    !!fileProductos && !!companyId && !!priceListId && !!subsidiaryId && !loading;

  // ======================
  // FUNCIÓN PARA ANALIZAR ERRORES
  // ======================
  const parseError = (errorMessage, statusCode) => {
    const errors = {
      // Errores de validación
      "invalid excel": "El archivo Excel tiene un formato inválido",
      "invalid format": "Formato de archivo no soportado",
      "missing columns": "Faltan columnas requeridas en el Excel",
      "company not found": "El Company ID no existe en el sistema",
      "pricelist not found": "El PriceList ID no existe o no pertenece a esta compañía",
      "subsidiary not found": "El Subsidiary ID no existe o no pertenece a esta compañía",
      "warehouse not found": "El Warehouse ID no existe",
      
      // Errores de producto
      "product not found": "Uno o más productos no existen en el sistema",
      "sku already exists": "El SKU del producto ya está registrado",
      "invalid price": "El precio del producto es inválido",
      "invalid stock": "La cantidad de stock es inválida",
      "product creation failed": "Error al crear el producto",
      "product update failed": "Error al actualizar el producto",
      
      // Errores del sistema
      "database error": "Error en la base de datos",
      "server error": "Error interno del servidor",
      "timeout": "La operación tardó demasiado tiempo",
      "network error": "Error de conexión de red",
    };

    // Buscar errores conocidos
    const errorLower = errorMessage.toLowerCase();
    let foundError = null;
    
    for (const [key, description] of Object.entries(errors)) {
      if (errorLower.includes(key)) {
        foundError = { type: key, description, details: errorMessage };
        break;
      }
    }

    // Si no se encuentra error conocido, usar el mensaje original
    if (!foundError) {
      foundError = { 
        type: "unknown", 
        description: "Error desconocido", 
        details: errorMessage 
      };
    }

    // Agregar información del código de estado
    if (statusCode) {
      foundError.statusCode = statusCode;
      foundError.statusText = getStatusText(statusCode);
    }

    return foundError;
  };

  const getStatusText = (statusCode) => {
    const statusMap = {
      400: "Bad Request - La solicitud tiene errores",
      401: "Unauthorized - No autorizado",
      403: "Forbidden - Acceso prohibido",
      404: "Not Found - Recurso no encontrado",
      413: "Payload Too Large - Archivo muy grande",
      422: "Unprocessable Entity - Error de validación",
      500: "Internal Server Error - Error del servidor",
      502: "Bad Gateway - Error de gateway",
      503: "Service Unavailable - Servicio no disponible",
      504: "Gateway Timeout - Tiempo de espera agotado",
    };
    return statusMap[statusCode] || `Código de error: ${statusCode}`;
  };

  // ======================
  // SEND
  // ======================
  const onSend = async () => {
    setError("");
    setErrorDetails(null);
    setResult(null);

    // Validaciones previas
    if (!fileProductos) {
      setError("❌ Selecciona el archivo Excel (.xlsx o .xls).");
      return;
    }
    
    if (!companyId || !priceListId || !subsidiaryId) {
      const missing = [];
      if (!companyId) missing.push("Company ID");
      if (!priceListId) missing.push("PriceList ID");
      if (!subsidiaryId) missing.push("Subsidiary ID");
      
      setError(`⚠️ Completa los campos obligatorios: ${missing.join(", ")}`);
      return;
    }

    // Validar formato del archivo
    const fileName = fileProductos.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError("❌ El archivo debe ser un Excel (.xlsx o .xls)");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file_excel", fileProductos);
      form.append("idCountry", idCountry);
      form.append("taxCodeCountry", taxCodeCountry);
      form.append("flagUseSimpleBrand", String(flagUseSimpleBrand));
      if (idWarehouse) form.append("idWarehouse", idWarehouse);

      const endpoint = buildEndpoint();
      const res = await fetch(endpoint, { method: "POST", body: form });

      const text = await res.text();
      
      if (!res.ok) {
        const parsedError = parseError(text, res.status);
        setErrorDetails(parsedError);
        
        // Mensaje amigable para el usuario
        let userMessage = `❌ Error ${res.status}: ${parsedError.description}`;
        
        if (res.status === 404) {
          userMessage += "\n\nPosibles causas:\n• Los IDs ingresados no existen\n• El nodo seleccionado es incorrecto\n• La ruta API ha cambiado";
        } else if (res.status === 422) {
          userMessage += "\n\nRevisa:\n• El formato del archivo Excel\n• Las columnas requeridas\n• Los tipos de datos en cada columna";
        } else if (res.status === 500) {
          userMessage += "\n\nEl servidor tuvo un problema interno. Intenta de nuevo o contacta al administrador.";
        }
        
        setError(userMessage);
        throw new Error(text);
      }

      try {
        const jsonResult = JSON.parse(text);
        setResult(jsonResult);
        
        // Verificar si la respuesta tiene errores de productos
        if (jsonResult.errors && jsonResult.errors.length > 0) {
          setErrorDetails({
            type: "product_errors",
            description: "Errores en productos específicos",
            details: jsonResult.errors,
            successCount: jsonResult.success || 0,
            errorCount: jsonResult.errors.length
          });
          
          setError(`⚠️ Se procesaron ${jsonResult.success || 0} productos, pero ${jsonResult.errors.length} tuvieron errores. Revisa los detalles abajo.`);
        } else if (jsonResult.success) {
          setError(`✅ Éxito: Se procesaron ${jsonResult.success} productos correctamente.`);
        }
      } catch {
        setResult(text);
        setError(`✅ Respuesta del servidor: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
    } catch (e) {
      if (!errorDetails) {
        const parsedError = parseError(e?.message || "Error desconocido");
        setErrorDetails(parsedError);
        
        // Mensajes para errores de red
        if (e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
          setError("🌐 Error de conexión:\n\n• Verifica tu conexión a internet\n• El servidor del nodo podría estar caído\n• Revisa si hay problemas con CORS\n\nEndpoint: " + buildEndpoint());
        } else {
          setError("❌ Error enviando el archivo: " + (e?.message || "Error desconocido"));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI (modern, corporate)
  // ======================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Content */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-12">
        {/* Left: form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h1 className="text-lg font-semibold text-slate-900">
                Cargar archivo y enviar
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Completa los IDs, selecciona el nodo y adjunta el Excel.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {/* Nodo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nodo</label>
                <select
                  value={nodeKey}
                  onChange={(e) => setNodeKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  {NODES.map((n) => (
                    <option key={n.key} value={n.key}>
                      {n.label} — {n.base.replace("https://", "")}
                    </option>
                  ))}
                </select>
              </div>

              {/* IDs */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">IDs</label>
                  <span className="text-xs text-slate-500">Obligatorios</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field
                    label="Company ID"
                    placeholder="Ej: 5454"
                    value={companyId}
                    onChange={setCompanyId}
                  />
                  <Field
                    label="PriceList ID"
                    placeholder="Ej: 7662"
                    value={priceListId}
                    onChange={setPriceListId}
                  />
                  <Field
                    label="Subsidiary ID"
                    placeholder="Ej: 7821"
                    value={subsidiaryId}
                    onChange={setSubsidiaryId}
                  />
                </div>
              </div>

              {/* Parámetros */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Parámetros</label>
                  <span className="text-xs text-slate-500">Form-data</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field
                    label="idCountry"
                    placeholder="1"
                    value={idCountry}
                    onChange={setIdCountry}
                  />
                  <TaxCodeSelect value={taxCodeCountry} onChange={setTaxCodeCountry} />
                  <Field
                    label="idWarehouse (opcional)"
                    placeholder="Ej: 5712"
                    value={idWarehouse}
                    onChange={setIdWarehouse}
                    helper="Solo si el cliente tiene más de una tienda/almacén."
                  />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      flagUseSimpleBrand
                    </div>
                    <div className="text-xs text-slate-500">
                      Envía <span className="font-mono">true/false</span> al backend.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFlagUseSimpleBrand((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      flagUseSimpleBrand ? "bg-slate-900" : "bg-slate-300"
                    }`}
                    aria-label="Toggle flagUseSimpleBrand"
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        flagUseSimpleBrand ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Archivo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Archivo Excel</label>

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-900 hover:bg-slate-50">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setFileProductos(e.target.files?.[0] ?? null)}
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
                    {fileProductos ? fileProductos.name : "Seleccionar archivo .xlsx / .xls"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Se enviará como <span className="font-mono">file_excel</span> (multipart/form-data)
                  </div>
                </label>
              </div>

              {/* Error principal */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
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
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-red-800">Mensaje</div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-red-700">{error}</div>
                      
                      {/* Botón para copiar error */}
                      {errorDetails && (
                        <button
                          onClick={() => {
                            const textToCopy = `Error: ${error}\n\nDetalles: ${JSON.stringify(errorDetails, null, 2)}\n\nEndpoint: ${buildEndpoint()}`;
                            navigator.clipboard.writeText(textToCopy);
                          }}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M8 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Copiar detalles del error
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalles del error expandibles */}
                  {errorDetails && (
                    <div className="mt-4 border-t border-red-200 pt-4">
                      <details className="group">
                        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-red-800">
                          <span>Detalles técnicos del error</span>
                          <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </summary>
                        <div className="mt-2 rounded-lg bg-red-100 p-3">
                          <div className="space-y-2 text-xs">
                            {errorDetails.statusCode && (
                              <div className="flex justify-between">
                                <span className="font-medium">Código de estado:</span>
                                <span className="font-mono">{errorDetails.statusCode} - {errorDetails.statusText}</span>
                              </div>
                            )}
                            {errorDetails.type && (
                              <div className="flex justify-between">
                                <span className="font-medium">Tipo de error:</span>
                                <span className="font-mono">{errorDetails.type}</span>
                              </div>
                            )}
                            {errorDetails.description && (
                              <div className="flex justify-between">
                                <span className="font-medium">Descripción:</span>
                                <span>{errorDetails.description}</span>
                              </div>
                            )}
                            {errorDetails.successCount !== undefined && (
                              <div className="flex justify-between">
                                <span className="font-medium">Productos exitosos:</span>
                                <span className="text-green-600">{errorDetails.successCount}</span>
                              </div>
                            )}
                            {errorDetails.errorCount !== undefined && (
                              <div className="flex justify-between">
                                <span className="font-medium">Productos con error:</span>
                                <span className="text-red-600">{errorDetails.errorCount}</span>
                              </div>
                            )}
                            
                            {/* Mostrar errores específicos de productos */}
                            {errorDetails.details && Array.isArray(errorDetails.details) && (
                              <div className="mt-3">
                                <div className="font-medium">Errores por producto:</div>
                                <div className="mt-1 max-h-40 overflow-y-auto">
                                  {errorDetails.details.map((err, idx) => (
                                    <div key={idx} className="mt-1 rounded border border-red-200 bg-white p-2">
                                      <div className="font-mono text-xs">{JSON.stringify(err, null, 2)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Mostrar detalles del error crudo */}
                            {errorDetails.details && typeof errorDetails.details === 'string' && (
                              <div className="mt-3">
                                <div className="font-medium">Mensaje original:</div>
                                <div className="mt-1 rounded border border-red-200 bg-white p-2 font-mono text-xs">
                                  {errorDetails.details}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <button
                  type="button"
                  onClick={onSend}
                  disabled={!canSend}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition md:w-auto ${
                    canSend
                      ? "bg-slate-900 hover:bg-slate-800"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M22 2 11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2 15 22l-4-9-9-4 20-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Enviar Excel
                    </>
                  )}
                </button>

                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Endpoint
                  </div>
                  <div className="mt-1 break-all font-mono text-xs text-slate-800">
                    {endpointPreview || "Completa los IDs para ver el endpoint"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: response */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Respuesta del servidor</h2>
              <p className="mt-1 text-sm text-slate-500">
                Verifica si el backend retornó JSON o texto.
              </p>
            </div>

            <div className="p-6">
              {result ? (
                <div>
                  <pre className="max-h-[560px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
                    {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
                  </pre>
                  
                  {/* Botón para copiar respuesta */}
                  <button
                    onClick={() => {
                      const textToCopy = typeof result === "string" 
                        ? result 
                        : JSON.stringify(result, null, 2);
                      navigator.clipboard.writeText(textToCopy);
                    }}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 hover:bg-slate-200"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M8 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Copiar respuesta completa
                  </button>
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Recomendaciones</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <Dot />
                <span>
                  Si el cliente tiene 1 sola tienda, deja <span className="font-mono">idWarehouse</span> vacío.
                </span>
              </li>
              <li className="flex gap-2">
                <Dot />
                <span>
                  El archivo se manda como <span className="font-mono">multipart/form-data</span>.
                </span>
              </li>
              <li className="flex gap-2">
                <Dot />
                <span>
                  Si sale error, usa el botón "Copiar detalles" para enviar al soporte.
                </span>
              </li>
              <li className="flex gap-2">
                <Dot />
                <span>
                  Para errores 404, verifica que los IDs existen en el nodo correcto.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================
   Helpers (same file)
   ====================== */

function Field({ label, value, onChange, placeholder, helper }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
      />
      {helper ? <div className="text-xs text-slate-500">{helper}</div> : null}
    </div>
  );
}

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

function Dot() {
  return <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />;
}

function EmptyState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 3h8l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-900">
        Sin resultados todavía
      </div>
      <div className="mt-1 text-sm text-slate-600">
        Cuando envíes el Excel, aquí se mostrará la respuesta del servidor.
      </div>
    </div>
  );
}

function TaxCodeSelect({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">taxCodeCountry</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <option value="01">01 — IGV</option>
        <option value="02">02 — Exonerado</option>
      </select>

      <div className="text-xs text-slate-500">
        Selecciona el código tributario a enviar al backend.
      </div>
    </div>
  );
}
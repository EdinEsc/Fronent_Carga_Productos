// src/App.jsx
import { useState } from "react";

import AppHeader from "./components/AppHeader";
import ExcelNormalizer from "./ExcelNormalizer";
import ExcelSender from "./ExcelSender";

export default function App() {
  const [active, setActive] = useState("normalizacion");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader active={active} onChange={setActive} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {active === "normalizacion" ? <ExcelNormalizer /> : <ExcelSender />}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Eye, EyeOff, Layers, Search, SlidersHorizontal } from "lucide-react";
import { fetchGisLayersList } from "@/services/gisAnalysisService";

interface Layer { id?: string; layer?: string; name?: string; displayName?: string; category: string; selectable?: boolean; queryable?: boolean; data_status?: string; source?: string; attribution?: string; }
interface Props { activeLayers: string[]; onToggleLayer: (id: string) => void; }

export default function LayerControlPanel({ activeLayers, onToggleLayer }: Props) {
  const [layers, setLayers] = useState<Layer[]>([]); const [open, setOpen] = useState(false); const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); const [opacity, setOpacity] = useState<Record<string, number>>({}); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { fetchGisLayersList().then((data: Layer[]) => setLayers(data || [])).catch(() => setError("Layer registry is unavailable.")).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => layers.filter(l => `${l.name || l.displayName} ${l.category}`.toLowerCase().includes(search.toLowerCase())), [layers, search]);
  const groups = useMemo(() => visible.reduce<Record<string, Layer[]>>((all, layer) => { (all[layer.category] ||= []).push(layer); return all; }, {}), [visible]);
  return <div className="relative">
    <button onClick={() => setOpen(!open)} className="h-10 px-3 bg-white/95 border border-slate-200 rounded-xl shadow-xs flex items-center gap-2 text-xs font-bold text-slate-800"><Layers className="w-4 h-4 text-blue-600"/>GIS Layers ({activeLayers.length})</button>
    {open && <div className="absolute top-full left-0 mt-2 w-96 max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200 p-3 rounded-2xl shadow-xl z-50 space-y-2">
      <div className="relative"><Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search road, school, river, tank…" className="w-full pl-7 pr-2 py-1.5 text-xs border rounded-lg"/></div>
      {loading && <p className="text-xs text-slate-500">Loading layer registry…</p>}{error && <p className="text-xs text-red-600">{error}</p>}
      {Object.entries(groups).map(([category, group]) => <section key={category}><button onClick={() => setExpanded(e => ({ ...e, [category]: !e[category] }))} className="w-full flex items-center justify-between py-1.5 text-[10px] font-bold tracking-wider text-slate-500"><span>{category.replaceAll('_', ' ')}</span><ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded[category] === false ? '-rotate-90' : ''}`}/></button>
        {expanded[category] !== false && group.map(layer => { const id = layer.id || layer.layer || ''; const active = activeLayers.includes(id); const unavailable = layer.data_status === 'DATA_UNAVAILABLE'; return <div key={id} className="mb-1 p-2 rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex gap-2 items-center"><button disabled={unavailable} onClick={() => onToggleLayer(id)} className="disabled:cursor-not-allowed">{active ? <Eye className="w-4 h-4 text-blue-600"/> : <EyeOff className="w-4 h-4 text-slate-400"/>}</button><div className="min-w-0 flex-1"><p className="text-xs font-semibold truncate">{layer.name || layer.displayName}</p><p className="text-[9px] text-slate-500">{unavailable ? 'Data unavailable' : `${layer.selectable ? 'Selectable' : 'View only'} · ${layer.queryable ? 'Queryable' : 'Not queryable'}`}</p></div></div>
          {active && <div className="flex items-center gap-2 mt-1.5"><SlidersHorizontal className="w-3 h-3 text-slate-400"/><input aria-label={`${layer.name || id} opacity`} type="range" min="0" max="1" step="0.1" value={opacity[id] ?? 1} onChange={e => setOpacity(o => ({ ...o, [id]: Number(e.target.value) }))} className="flex-1"/><span className="text-[9px]">{Math.round((opacity[id] ?? 1) * 100)}%</span></div>}
        </div>; })}</section>)}
      {!loading && visible.length === 0 && <p className="text-xs text-slate-500">No registered layers match this search.</p>}
    </div>}
  </div>;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WMSTileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { ChevronDown, Eye, EyeOff, Layers, Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface TngisLayer { name: string; title: string; }

interface TngisStatus {
  configured: boolean;
  available: boolean;
  message: string;
  layers: TngisLayer[];
}

function groupFor(layer: TngisLayer): "Boundary" | "Thematic Layers" {
  const text = `${layer.name} ${layer.title}`.toLowerCase();
  return /boundary|district|taluk|revenue.?village|panchayat|block|survey|sub.?division|ward|corporation|slum/.test(text)
    ? "Boundary"
    : "Thematic Layers";
}

function FeatureInfoClickHandler({ activeLayers }: { activeLayers: string[] }) {
  const map = useMapEvents({
    click: async (e) => {
      if (activeLayers.length === 0) return;
      
      const bounds = map.getBounds();
      const size = map.getSize();
      // WMS 1.1.1 expects bbox as west,south,east,north
      const bbox = bounds.toBBoxString(); 
      
      for (const layer of activeLayers) {
        const url = new URL(`${API_BASE}/gis/tngis/feature-info`);
        url.searchParams.set('layers', layer);
        url.searchParams.set('bbox', bbox);
        url.searchParams.set('width', size.x.toString());
        url.searchParams.set('height', size.y.toString());
        url.searchParams.set('x', Math.round(e.containerPoint.x).toString());
        url.searchParams.set('y', Math.round(e.containerPoint.y).toString());
        url.searchParams.set('i', Math.round(e.containerPoint.x).toString());
        url.searchParams.set('j', Math.round(e.containerPoint.y).toString());
        url.searchParams.set('srs', 'EPSG:4326');
        url.searchParams.set('info_format', 'text/html');
        
        try {
          const res = await fetch(url.toString());
          if (res.ok) {
            const html = await res.text();
            // Ignore empty or error responses
            if (html.trim() && !html.includes('ServiceException') && !html.includes('msGMLOutput')) {
              L.popup()
                .setLatLng(e.latlng)
                .setContent(`<div class="max-h-64 overflow-auto text-sm bg-white text-slate-800 p-1">${html}</div>`)
                .openOn(map);
              break; // Only show popup for the topmost successful layer
            }
          }
        } catch (err) {
          console.error("Failed to fetch feature info", err);
        }
      }
    }
  });
  return null;
}

/**
 * TNGIS-style live layer browser. The backend provides only layers available
 * to the authorised server-side TNGIS session; each eye toggle adds/removes a
 * real WMS overlay from the Leaflet map.
 */
export default function TngisLiveOverlay() {
  const map = useMap();
  const panelRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<TngisStatus | null>(null);
  const [query, setQuery] = useState("");
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Boundary: true, "Thematic Layers": false });

  useEffect(() => {
    fetch(`${API_BASE}/gis/tngis/status`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => setStatus(result))
      .catch(() => setStatus({ configured: false, available: false, message: "Unable to check the TNGIS service.", layers: [] }));
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      L.DomEvent.disableClickPropagation(panelRef.current);
      L.DomEvent.disableScrollPropagation(panelRef.current);
    }
  }, [status]);

  const groupedLayers = useMemo(() => {
    const matching = (status?.layers || []).filter((layer) =>
      `${layer.name} ${layer.title}`.toLowerCase().includes(query.trim().toLowerCase())
    );
    return matching.reduce<Record<string, TngisLayer[]>>((groups, layer) => {
      const group = groupFor(layer);
      (groups[group] ||= []).push(layer);
      return groups;
    }, {});
  }, [status?.layers, query]);

  const toggleLayer = (name: string) => {
    setActiveLayers((current) => current.includes(name)
      ? current.filter((layer) => layer !== name)
      : [...current, name]);
  };

  const panel = (
    <aside
      ref={panelRef}
      className="absolute left-3 top-3 z-[1000] w-[295px] max-h-[calc(100%-24px)] overflow-hidden rounded-lg border border-cyan-400/50 bg-[#08243e]/95 text-white shadow-2xl backdrop-blur"
      aria-label="Official TNGIS live layer browser"
    >
      <div className="flex items-center gap-2 border-b border-cyan-400/30 bg-[#075f65] px-3 py-2">
        <Layers className="h-4 w-4 text-cyan-100" />
        <span className="text-sm font-bold tracking-wide">TNGIS LIVE LAYERS</span>
        <span className={`ml-auto h-2.5 w-2.5 rounded-full ${status?.available ? "bg-emerald-400" : "bg-amber-400"}`} />
      </div>

      <div className="border-b border-cyan-400/20 p-3">
        <label className="flex items-center gap-2 rounded-md border border-cyan-100/60 bg-[#071e35] px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-cyan-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search layer name"
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-300"
          />
        </label>
        <p className={`mt-2 text-xs ${status?.available ? "text-emerald-300" : "text-amber-300"}`}>
          {status?.available ? `${activeLayers.length} layer${activeLayers.length === 1 ? "" : "s"} visible` : status?.message || "Connecting to TNGIS…"}
        </p>
      </div>

      <div className="max-h-[calc(100vh-230px)] overflow-y-auto p-2">
        {status?.available && Object.entries(groupedLayers).map(([group, layers]) => (
          <section key={group} className="mb-2 overflow-hidden rounded-md border border-cyan-400/30">
            <button
              type="button"
              onClick={() => setExpanded((current) => ({ ...current, [group]: !current[group] }))}
              className="flex w-full items-center justify-between bg-[#158391] px-3 py-2 text-left text-sm font-semibold"
            >
              {group}
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded[group] ? "rotate-180" : ""}`} />
            </button>
            {expanded[group] && (
              <div className="space-y-0.5 bg-[#08243e] px-2 py-1.5">
                {layers.map((layer) => {
                  const visible = activeLayers.includes(layer.name);
                  return (
                    <button
                      key={layer.name}
                      type="button"
                      onClick={() => toggleLayer(layer.name)}
                      title={layer.name}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-yellow-300 hover:bg-cyan-900/70"
                    >
                      {visible ? <Eye className="h-4 w-4 shrink-0 text-cyan-300" /> : <EyeOff className="h-4 w-4 shrink-0 text-cyan-400" />}
                      <span className="truncate">{layer.title || layer.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
        {status?.available && Object.keys(groupedLayers).length === 0 && (
          <p className="p-3 text-center text-sm text-slate-300">No layers match “{query}”.</p>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {activeLayers.map((layer) => (
        <WMSTileLayer
          key={layer}
          url={`${API_BASE}/gis/tngis/wms`}
          layers={layer}
          format="image/png"
          transparent
          version="1.1.1"
          opacity={0.8}
          attribution="Tamil Nadu Geographical Information System (TNGIS)"
        />
      ))}
      <FeatureInfoClickHandler activeLayers={activeLayers} />
      {/* Layer selection is owned by the central LAND STACK registry panel.
          This connector deliberately does not mount a second, competing layer browser. */}
    </>
  );
}

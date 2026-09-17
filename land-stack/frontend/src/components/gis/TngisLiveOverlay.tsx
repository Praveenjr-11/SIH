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
      className="absolute left-3 top-3 z-[1000] w-[295px] max-h-[calc(100%-24px)] overflow-hidden rounded-lg border border-[#E3E8EF] bg-white text-[#14213D] shadow-lg"
      aria-label="Official TNGIS live layer browser"
    >
      <div className="flex items-center gap-2 border-b border-[#E3E8EF] bg-[#102A43] text-white px-3 py-2">
        <Layers className="h-4 w-4 text-white" />
        <span className="text-xs font-bold tracking-wide">TNGIS LIVE LAYERS</span>
        <span className={`ml-auto h-2 w-2 rounded-full ${status?.available ? "bg-[#16845B]" : "bg-[#E99A16]"}`} />
      </div>

      <div className="border-b border-[#E3E8EF] p-2.5 bg-[#F7F9FC]">
        <label className="flex items-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-2.5 py-1.5 text-xs">
          <Search className="h-3.5 w-3.5 text-[#53627A]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search layer name"
            className="w-full bg-transparent text-[#14213D] outline-none placeholder:text-[#53627A]"
          />
        </label>
        <p className={`mt-1.5 text-[10px] font-medium ${status?.available ? "text-[#16845B]" : "text-[#E99A16]"}`}>
          {status?.available ? `${activeLayers.length} layer${activeLayers.length === 1 ? "" : "s"} visible` : status?.message || "Connecting to TNGIS…"}
        </p>
      </div>

      <div className="max-h-[calc(100vh-230px)] overflow-y-auto p-2 custom-scrollbar">
        {status?.available && Object.entries(groupedLayers).map(([group, layers]) => (
          <section key={group} className="mb-2 overflow-hidden rounded-md border border-[#E3E8EF]">
            <button
              type="button"
              onClick={() => setExpanded((current) => ({ ...current, [group]: !current[group] }))}
              className="flex w-full items-center justify-between bg-[#F7F9FC] px-3 py-1.5 text-left text-xs font-semibold text-[#102A43]"
            >
              <span>{group}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-[#53627A] transition-transform ${expanded[group] ? "rotate-180" : ""}`} />
            </button>
            {expanded[group] && (
              <div className="space-y-0.5 bg-white px-2 py-1.5 border-t border-[#E3E8EF]">
                {layers.map((layer) => {
                  const visible = activeLayers.includes(layer.name);
                  return (
                    <button
                      key={layer.name}
                      type="button"
                      onClick={() => toggleLayer(layer.name)}
                      title={layer.name}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#14213D] hover:bg-[#F7F9FC]"
                    >
                      {visible ? <Eye className="h-3.5 w-3.5 shrink-0 text-[#1D5FD1]" /> : <EyeOff className="h-3.5 w-3.5 shrink-0 text-[#53627A]" />}
                      <span className="truncate">{layer.title || layer.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
        {status?.available && Object.keys(groupedLayers).length === 0 && (
          <p className="p-3 text-center text-xs text-[#53627A]">No layers match “{query}”.</p>
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

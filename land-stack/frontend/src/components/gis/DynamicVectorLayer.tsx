"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GeoJSON, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { getLayerById } from "@/config/gisLayerRegistry";
import type { LatLngBounds } from "leaflet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DynamicVectorLayerProps {
  layerId: string;
  onLoadStart?: () => void;
  onLoadSuccess?: (featureCount: number, source?: string) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (properties: any, layerName: string) => void;
}

export default function DynamicVectorLayer({
  layerId,
  onLoadStart,
  onLoadSuccess,
  onLoadError,
  onFeatureClick,
}: DynamicVectorLayerProps) {
  const map = useMap();
  const layerMeta = getLayerById(layerId);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const lastBoundsRef = useRef<string>("");

  const fetchLayerData = useCallback(async () => {
    if (!layerMeta) return;

    // WMS layers are rendered as tile overlays — not fetched as GeoJSON
    if (layerMeta.source_type === "WMS") return;

    const currentZoom = map.getZoom();

    // Only fetch if within allowed zoom levels
    if (currentZoom < layerMeta.min_zoom) {
      setData(null);
      onLoadError?.(`Zoom in closer to view (Min Zoom: ${layerMeta.min_zoom})`);
      return;
    }
    if (currentZoom > layerMeta.max_zoom) {
      setData(null);
      onLoadError?.(`Zoom out to view (Max Zoom: ${layerMeta.max_zoom})`);
      return;
    }

    // Deduplicate rapid moveend/zoomend fires
    const bounds: LatLngBounds = map.getBounds();
    const bboxKey = [
      bounds.getWest().toFixed(3),
      bounds.getSouth().toFixed(3),
      bounds.getEast().toFixed(3),
      bounds.getNorth().toFixed(3),
    ].join(",");
    if (bboxKey === lastBoundsRef.current && data !== null) return;
    lastBoundsRef.current = bboxKey;

    onLoadStart?.();
    setLoading(true);

    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ].join(",");

    // Build API URL from source field — strip /api/v1 prefix if present and prepend API_BASE
    const sourcePath = layerMeta.source.replace(/^\/api\/v1/, "");
    const url = new URL(`${API_BASE}${sourcePath}`);
    url.searchParams.set("bbox", bbox);

    let geojson: any = null;
    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(45000), // 45s timeout for large layers
      });

      try {
        geojson = await res.json();
      } catch (e) {
        onLoadError?.("Invalid response format from server");
        setData(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errMsg =
          geojson?.error ||
          geojson?.message ||
          `HTTP ${res.status}: ${res.statusText}`;
        onLoadError?.(errMsg);
        setData(null);
        setLoading(false);
        return;
      }

      if (geojson && Array.isArray(geojson.features)) {
        setData(geojson);
        const source: string = geojson._meta?.source || "API";
        onLoadSuccess?.(geojson.features.length, source);
      } else {
        // Empty feature collection is valid (no features in this viewport)
        setData(null);
        onLoadError?.("No features in current map view");
      }
    } catch (err: any) {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        onLoadError?.("Request timed out — try a smaller viewport");
      } else {
        onLoadError?.(err.message || "Unknown error");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [map, layerMeta, layerId]);

  useMapEvents({
    moveend: fetchLayerData,
    zoomend: fetchLayerData,
  });

  // Fetch on mount / when layerId changes
  useEffect(() => {
    lastBoundsRef.current = ""; // reset so next call always fetches
    fetchLayerData();
  }, [layerId]);

  const onEachFeature = (feature: any, layer: any) => {
    if (!layerMeta) return;
    layer.on({
      click: (e: any) => {
        if (typeof window !== "undefined" && (window as any).L) {
          (window as any).L.DomEvent.stopPropagation(e);
        }
        if (feature.properties && onFeatureClick) {
          onFeatureClick(feature.properties, layerMeta.name);
        }
      },
      mouseover: (e: any) => {
        const l = e.target;
        if (l.setStyle) {
          l.setStyle({ weight: (layerMeta.style.weight || 2) + 1, fillOpacity: Math.min((layerMeta.style.fillOpacity || 0.2) + 0.1, 0.9) });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        if (l.setStyle) {
          l.setStyle({ weight: layerMeta.style.weight || 2, fillOpacity: layerMeta.style.fillOpacity || 0.2 });
        }
      },
    });
  };

  if (!layerMeta || !data || !Array.isArray(data.features) || data.features.length === 0) {
    return null;
  }

  return (
    <GeoJSON
      key={`${layerId}-${data.features.length}-${lastBoundsRef.current}`}
      data={data}
      style={{
        color: layerMeta.style.color || "#6366f1",
        fillColor: layerMeta.style.fillColor || layerMeta.style.color || "#818cf8",
        weight: layerMeta.style.weight || 2,
        opacity: layerMeta.style.opacity ?? 1,
        fillOpacity: layerMeta.style.fillOpacity ?? 0.2,
        ...(layerMeta.style.dashArray ? { dashArray: layerMeta.style.dashArray } : {}),
      }}
      onEachFeature={onEachFeature}
    >
      <Tooltip sticky direction="top" className="text-[10px] font-bold">
        {layerMeta.name}
      </Tooltip>
    </GeoJSON>
  );
}

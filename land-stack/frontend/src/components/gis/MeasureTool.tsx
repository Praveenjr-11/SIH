"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMapEvents, Polyline, Polygon as LeafletPolygon, CircleMarker, Tooltip } from "react-leaflet";
import * as turf from "@turf/turf";

interface MeasureToolProps {
  mode: "distance" | "area";
  active: boolean;
  onMeasurementComplete?: (value: number, unit: string) => void;
}

export default function MeasureTool({ mode, active, onMeasurementComplete }: MeasureToolProps) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [measurement, setMeasurement] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Reset when mode changes or tool is toggled
  useEffect(() => {
    setPoints([]);
    setMeasurement(null);
    setIsFinished(false);
  }, [mode, active]);

  const computeMeasurement = useCallback(
    (pts: [number, number][]) => {
      if (mode === "distance" && pts.length >= 2) {
        // Convert [lat,lng] to [lng,lat] for turf
        const turfCoords = pts.map(([lat, lng]) => [lng, lat]);
        const line = turf.lineString(turfCoords);
        const lengthKm = turf.length(line, { units: "kilometers" });
        if (lengthKm < 1) {
          const lengthM = lengthKm * 1000;
          setMeasurement(`${lengthM.toFixed(1)} m`);
        } else {
          setMeasurement(`${lengthKm.toFixed(3)} km`);
        }
      } else if (mode === "area" && pts.length >= 3) {
        // Close the polygon for turf
        const turfCoords = pts.map(([lat, lng]) => [lng, lat]);
        turfCoords.push(turfCoords[0]); // close ring
        const polygon = turf.polygon([turfCoords]);
        const areaSqM = turf.area(polygon);
        const areaHectares = areaSqM / 10000;

        if (areaHectares < 1) {
          setMeasurement(`${areaSqM.toFixed(1)} m²`);
        } else {
          const areaAcres = areaHectares * 2.47105;
          setMeasurement(`${areaHectares.toFixed(3)} ha (${areaAcres.toFixed(2)} acres)`);
        }

        if (onMeasurementComplete) {
          onMeasurementComplete(areaHectares, "hectares");
        }
      }
    },
    [mode, onMeasurementComplete]
  );

  useMapEvents({
    click(e) {
      if (!active || isFinished) return;
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      const newPoints = [...points, newPoint];
      setPoints(newPoints);
      computeMeasurement(newPoints);
    },
    dblclick(e) {
      if (!active || points.length < 2) return;
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      setIsFinished(true);
      computeMeasurement(points);
    },
  });

  if (!active || points.length === 0) return null;

  const lastPoint = points[points.length - 1];

  return (
    <>
      {/* Vertex markers */}
      {points.map((pt, idx) => (
        <CircleMarker
          key={idx}
          center={pt}
          radius={4}
          pathOptions={{
            color: "#ffffff",
            fillColor: mode === "distance" ? "#2563eb" : "#dc2626",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}

      {/* Distance: polyline */}
      {mode === "distance" && points.length >= 2 && (
        <Polyline
          positions={points}
          pathOptions={{
            color: "#2563eb",
            weight: 3,
            dashArray: isFinished ? undefined : "8, 6",
            opacity: 0.9,
          }}
        />
      )}

      {/* Area: polygon */}
      {mode === "area" && points.length >= 3 && (
        <LeafletPolygon
          positions={points}
          pathOptions={{
            color: "#dc2626",
            fillColor: "#dc2626",
            fillOpacity: 0.15,
            weight: 2,
            dashArray: isFinished ? undefined : "8, 6",
          }}
        />
      )}

      {/* Measurement label tooltip at last point */}
      {measurement && lastPoint && (
        <CircleMarker
          center={lastPoint}
          radius={0}
          pathOptions={{ opacity: 0 }}
        >
          <Tooltip permanent direction="right" offset={[12, 0]} className="measure-tooltip">
            <div className="bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm">
              {measurement}
              {!isFinished && (
                <span className="block text-[9px] text-slate-300 font-normal mt-0.5">
                  {mode === "distance" ? "Click to add points • Dbl-click to finish" : "Click vertices • Dbl-click to close"}
                </span>
              )}
              {isFinished && (
                <span className="block text-[9px] text-emerald-300 font-semibold mt-0.5">✓ Measurement complete</span>
              )}
            </div>
          </Tooltip>
        </CircleMarker>
      )}
    </>
  );
}

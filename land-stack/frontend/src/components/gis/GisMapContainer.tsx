"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Parcel } from "@/types";
import { ClickedLocation } from "@/types/gis";
import LocationSearch from "./LocationSearch";
import LocationInspector from "./LocationInspector";
import AdministrativeBoundarySelector from "./AdministrativeBoundarySelector";
import LayerControlPanel from "./LayerControlPanel";
import AILandIntelligencePanel from "./AILandIntelligencePanel";

// Dynamic import for Leaflet map component without SSR
const GisMapInner = dynamic(() => import("./GisMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 text-xs font-semibold">Initializing Interactive GIS Map of India...</p>
      </div>
    </div>
  ),
});

interface GisMapContainerProps {
  parcels?: Parcel[];
  onSelectParcel?: (parcel: Parcel) => void;
}

export default function GisMapContainer({ parcels = [], onSelectParcel }: GisMapContainerProps) {
  const [clickedLocation, setClickedLocation] = useState<ClickedLocation | null>(null);
  const [targetFlyTo, setTargetFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    "LAYER-GSI-GEO",
    "LAYER-GSI-HAZARD",
    "LAYER-SOIL",
  ]);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleSelectLocationFromSearch = (lat: number, lng: number, displayName: string) => {
    // Set target coordinates for map flyTo animation
    setTargetFlyTo({ lat, lng, zoom: 13 });

    // Set clicked location state for inspector
    setClickedLocation({
      lat,
      lng,
      displayName,
      loading: false,
    });

    // Trigger AI Land Intelligence Analysis
    setShowAIPanel(true);
  };

  const handleSelectBoundary = (center: [number, number], zoom: number) => {
    setTargetFlyTo({ lat: center[0], lng: center[1], zoom });
  };

  const handleToggleLayer = (layerId: string) => {
    if (activeLayers.includes(layerId)) {
      setActiveLayers(activeLayers.filter((id) => id !== layerId));
    } else {
      setActiveLayers([...activeLayers, layerId]);
    }
  };

  const handleLocationClickedOnMap = (loc: ClickedLocation | null) => {
    setClickedLocation(loc);
    if (loc) {
      setShowAIPanel(true);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Top Floating GIS Control Bar */}
      <div className="absolute top-4 left-6 z-20 flex items-center space-x-3">
        <LocationSearch onSelectLocation={handleSelectLocationFromSearch} />
        <AdministrativeBoundarySelector onSelectBoundary={handleSelectBoundary} />
        <LayerControlPanel activeLayers={activeLayers} onToggleLayer={handleToggleLayer} />
      </div>

      {/* Core Leaflet GIS Map */}
      <GisMapInner
        parcels={parcels}
        onSelectParcel={onSelectParcel}
        clickedLocation={clickedLocation}
        setClickedLocation={handleLocationClickedOnMap}
        targetFlyTo={targetFlyTo}
      />

      {/* Bottom Left Clicked Location Inspector Drawer */}
      <LocationInspector
        location={clickedLocation}
        onClear={() => {
          setClickedLocation(null);
          setShowAIPanel(false);
        }}
      />

      {/* Right AI Land Intelligence Drawer */}
      {showAIPanel && clickedLocation && (
        <AILandIntelligencePanel
          lat={clickedLocation.lat}
          lng={clickedLocation.lng}
          onClose={() => setShowAIPanel(false)}
        />
      )}
    </div>
  );
}

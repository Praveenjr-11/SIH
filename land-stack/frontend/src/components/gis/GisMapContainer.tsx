"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Parcel } from "@/types";
import { ClickedLocation } from "@/types/gis";
import LocationInspector from "./LocationInspector";
import LayerManager from "./LayerManager";
import AILandIntelligencePanel from "./AILandIntelligencePanel";
import HierarchyNavigator from "./HierarchyNavigator";

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
  // Layers are opt-in: detailed datasets load only after a user enables them.
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [layerStates, setLayerStates] = useState<Record<string, { status: "idle" | "loading" | "loaded" | "error"; errorMsg?: string; featureCount?: number; source?: string }>>({});
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Phase 1: Selected parcel ULPIN for overlay analysis
  const [selectedUlpin, setSelectedUlpin] = useState<string | null>(null);

  // Phase 2: Active query layer for click-to-query
  const [activeQueryLayer, setActiveQueryLayer] = useState<string>("parcels");

  // Hierarchy drill-down: boundary GeoJSON for highlighting on map
  const [hierarchyBoundary, setHierarchyBoundary] = useState<any>(null);

  const handleToggleLayer = (layerId: string) => {
    if (activeLayers.includes(layerId)) {
      setActiveLayers(activeLayers.filter((id) => id !== layerId));
      setLayerStates((prev) => {
        const next = { ...prev };
        delete next[layerId];
        return next;
      });
    } else {
      setActiveLayers([...activeLayers, layerId]);
      setLayerStates((prev) => ({ ...prev, [layerId]: { status: "idle" } }));
    }

    // Map layer toggles to query layer names
    const cleanId = layerId.toLowerCase().replace("layer-", "").replace("gsi-", "").replace("geo", "geology").replace("hazard", "risk_zones");
    if (["geology", "soil", "landuse", "waterbodies", "roads", "elevation", "risk_zones"].includes(cleanId)) {
      setActiveQueryLayer(cleanId);
    } else {
      setActiveQueryLayer("parcels");
    }
  };

  const handleLayerLoadStart = (layerId: string) => {
    setLayerStates((prev) => ({ ...prev, [layerId]: { status: "loading" } }));
  };

  const handleLayerLoadSuccess = (layerId: string, featureCount?: number, source?: string) => {
    setLayerStates((prev) => ({ ...prev, [layerId]: { status: "loaded", featureCount, source } }));
  };

  const handleLayerLoadError = (layerId: string, errorMsg: string) => {
    setLayerStates((prev) => ({ ...prev, [layerId]: { status: "error", errorMsg } }));
  };

  const handleLayerFeatureClick = (properties: any, layerName: string) => {
    // Show standard clicked location panel with the feature properties
    setClickedLocation({
      lat: 0, // Fallback if no specific lat/lng
      lng: 0,
      displayName: properties.name || properties.district_name || layerName,
      addressDetails: properties,
    } as any);
    setShowAIPanel(false); // Can open AI panel later if wanted
  };

  const handleLocationClickedOnMap = (loc: ClickedLocation | null) => {
    setClickedLocation(loc);
    if (loc) {
      setShowAIPanel(true);
    }
  };

  const handleSelectParcel = (parcel: Parcel) => {
    setSelectedUlpin(parcel.ulpin);
    if (onSelectParcel) {
      onSelectParcel(parcel);
    }
  };

  // Hierarchy drill-down callbacks
  const handleHierarchyFlyToBounds = (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    // Compute center from bounds and appropriate zoom
    const lat = (bounds.minLat + bounds.maxLat) / 2;
    const lng = (bounds.minLng + bounds.maxLng) / 2;
    const latSpan = bounds.maxLat - bounds.minLat;
    const zoom = latSpan > 1 ? 8 : latSpan > 0.3 ? 10 : latSpan > 0.1 ? 12 : 14;
    setTargetFlyTo({ lat, lng, zoom });
  };

  const handleHierarchySelectUlpin = (ulpin: string) => {
    setSelectedUlpin(ulpin);
    // Find parcel from existing data and select it
    const parcel = parcels.find((p) => p.ulpin === ulpin);
    if (parcel) {
      handleSelectParcel(parcel);
      if (parcel.center) {
        setTargetFlyTo({ lat: parcel.center[0], lng: parcel.center[1], zoom: 17 });
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Top Floating GIS Control Bar */}
      <div className="absolute top-3 left-3 sm:left-4 z-[2000] flex flex-wrap items-start gap-2 max-w-[calc(100vw-2rem)]">
        <LayerManager 
          activeLayers={activeLayers} 
          layerStates={layerStates}
          onToggleLayer={handleToggleLayer} 
        />
        <HierarchyNavigator
          onFlyToBounds={handleHierarchyFlyToBounds}
          onSelectParcelUlpin={handleHierarchySelectUlpin}
          onBoundaryGeoJSON={setHierarchyBoundary}
        />
      </div>

      {/* Core Leaflet GIS Map */}
      <GisMapInner
        parcels={parcels}
        onSelectParcel={handleSelectParcel}
        clickedLocation={clickedLocation}
        setClickedLocation={handleLocationClickedOnMap}
        targetFlyTo={targetFlyTo}
        activeQueryLayer={activeQueryLayer}
        overlayData={null}
        hierarchyBoundary={hierarchyBoundary}
        activeRegistryLayers={activeLayers}
        onLayerLoadStart={handleLayerLoadStart}
        onLayerLoadSuccess={handleLayerLoadSuccess}
        onLayerLoadError={handleLayerLoadError}
        onLayerFeatureClick={handleLayerFeatureClick}
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
          displayName={clickedLocation.displayName}
          addressDetails={clickedLocation.addressDetails}
          onClose={() => setShowAIPanel(false)}
        />
      )}
    </div>
  );
}

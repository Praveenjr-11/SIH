"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Parcel } from "@/types";
import { ClickedLocation } from "@/types/gis";
import LocationInspector from "./LocationInspector";
import GisLayerPanel from "./GisLayerPanel";
import GisSearch from "./GisSearch";
import HierarchyNavigator from "./HierarchyNavigator";
import AILandIntelligencePanel from "./AILandIntelligencePanel";
import LandDetailsPanel from "./LandDetailsPanel";
import { fetchOfficialLandDetails, OfficialLandDetailsResponse } from "@/services/gisLandRecordService";

// Dynamic import for Leaflet map component without SSR
const GisMapInner = dynamic(() => import("./GisMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#F7F9FC] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#1D5FD1] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#53627A] text-xs font-semibold">Initializing Tamil Nadu Cadastral GIS Platform...</p>
      </div>
    </div>
  ),
});

interface GisMapContainerProps {
  parcels?: Parcel[];
  onSelectParcel?: (parcel: Parcel) => void;
}

export default function GisMapContainer({ parcels = [], onSelectParcel }: GisMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active layers state: default has "cadastral_parcels" and "satellite_imagery" enabled for live satellite view
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["cadastral_parcels", "satellite_imagery"]));
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [clickedLocation, setClickedLocation] = useState<ClickedLocation | null>(null);
  const [targetFlyTo, setTargetFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [officialLandData, setOfficialLandData] = useState<OfficialLandDetailsResponse | null>(null);
  const [loadingOfficialLandData, setLoadingOfficialLandData] = useState(false);
  const [showLandDetailsPanel, setShowLandDetailsPanel] = useState(false);
  const [isOfficerMode, setIsOfficerMode] = useState(false);

  // Hierarchy drill-down: boundary GeoJSON for highlighting on map
  const [hierarchyBoundary, setHierarchyBoundary] = useState<any>(null);

  // Toggle individual layer
  const handleToggleLayer = (layerId: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  // Reset to defaults: Cadastral Parcels and Satellite Imagery active
  const handleResetToDefaults = () => {
    setActiveLayers(new Set(["cadastral_parcels", "satellite_imagery"]));
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
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

  const loadLandDetailsForLocation = (loc: ClickedLocation, officerState: boolean) => {
    setLoadingOfficialLandData(true);
    fetchOfficialLandDetails(loc.lat, loc.lng, officerState)
      .then((data) => setOfficialLandData(data))
      .catch((err) => console.error('Failed to load official land details:', err))
      .finally(() => setLoadingOfficialLandData(false));
  };

  const handleLocationClickedOnMap = (loc: ClickedLocation | null) => {
    setClickedLocation(loc);
    if (loc) {
      setShowAIPanel(true);
      setShowLandDetailsPanel(true);
      loadLandDetailsForLocation(loc, isOfficerMode);
    } else {
      setShowLandDetailsPanel(false);
      setOfficialLandData(null);
    }
  };

  const handleToggleOfficerMode = (newOfficerState: boolean) => {
    setIsOfficerMode(newOfficerState);
    if (clickedLocation) {
      loadLandDetailsForLocation(clickedLocation, newOfficerState);
    }
  };

  const handleSelectParcel = (parcel: Parcel) => {
    if (parcel.center && Array.isArray(parcel.center) && parcel.center.length >= 2) {
      setTargetFlyTo({ lat: parcel.center[0], lng: parcel.center[1], zoom: 17 });
    }
    if (onSelectParcel) {
      onSelectParcel(parcel);
    }
  };

  const handleSelectLocation = (lat: number, lng: number, displayName: string, addressDetails?: any, geojson?: any) => {
    setTargetFlyTo({ lat, lng, zoom: 14 });
    setClickedLocation({
      lat,
      lng,
      displayName,
      addressDetails,
      geojson,
      loading: false,
    });
  };

  // Hierarchy drill-down callbacks
  const handleHierarchyFlyToBounds = (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    const lat = (bounds.minLat + bounds.maxLat) / 2;
    const lng = (bounds.minLng + bounds.maxLng) / 2;
    const latSpan = bounds.maxLat - bounds.minLat;
    const zoom = latSpan > 1 ? 8 : latSpan > 0.3 ? 10 : latSpan > 0.1 ? 12 : 14;
    setTargetFlyTo({ lat, lng, zoom });
  };

  const handleHierarchySelectUlpin = (ulpin: string) => {
    const parcel = parcels.find((p) => p.ulpin === ulpin);
    if (parcel) {
      handleSelectParcel(parcel);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[calc(100vh-64px)] overflow-hidden bg-[#F7F9FC]">
      {/* FLOATING TOP TOOLBAR (Search & Administrative Hierarchy Navigator) */}
      <div className="absolute top-3 left-3 sm:left-4 z-[2000] flex flex-wrap items-center gap-2.5 max-w-[calc(100vw-120px)] sm:max-w-none">
        {/* Unified Search: ULPIN, Survey Number, Owner Name, Village, Taluk, District, Address */}
        <GisSearch
          parcels={parcels}
          onSelectParcel={handleSelectParcel}
          onSelectLocation={handleSelectLocation}
        />

        {/* Administrative Hierarchy Drill-Down (District -> Taluk -> Village -> Survey No) */}
        <HierarchyNavigator
          onFlyToBounds={handleHierarchyFlyToBounds}
          onSelectParcelUlpin={handleHierarchySelectUlpin}
          onBoundaryGeoJSON={setHierarchyBoundary}
        />
      </div>

      {/* FLOATING GIS LAYER PANEL (6 Categories, 23 Layers) */}
      <GisLayerPanel
        isOpen={isLayerPanelOpen}
        onClose={() => setIsLayerPanelOpen(false)}
        activeLayers={activeLayers}
        onToggleLayer={handleToggleLayer}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* CORE LEAFLET MAP */}
      <GisMapInner
        parcels={parcels}
        onSelectParcel={handleSelectParcel}
        clickedLocation={clickedLocation}
        setClickedLocation={setClickedLocation}
        targetFlyTo={targetFlyTo}
        activeLayers={activeLayers}
        onToggleLayer={handleToggleLayer}
        isLayerPanelOpen={isLayerPanelOpen}
        onToggleLayerPanel={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        hierarchyBoundary={hierarchyBoundary}
      />

      {/* BOTTOM LEFT LOCATION INSPECTOR DRAWER (When arbitrary map point is clicked) */}
      <LocationInspector
        location={clickedLocation}
        onClear={() => {
          setClickedLocation(null);
          setShowAIPanel(false);
          setShowLandDetailsPanel(false);
        }}
      />

      {/* Right Official Government Land Details Drawer */}
      {showLandDetailsPanel && (
        <LandDetailsPanel
          data={officialLandData}
          loading={loadingOfficialLandData}
          isOfficer={isOfficerMode}
          onToggleOfficer={handleToggleOfficerMode}
          onClose={() => setShowLandDetailsPanel(false)}
        />
      )}

      {/* Right AI Land Intelligence Drawer (can be toggled if Land Details closed) */}
      {showAIPanel && clickedLocation && !showLandDetailsPanel && (
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

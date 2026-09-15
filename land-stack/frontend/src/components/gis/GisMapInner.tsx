"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { Parcel } from "@/types";
import { ClickedLocation, BasemapType } from "@/types/gis";
import MapClickHandler from "./MapClickHandler";
import MapControls from "./MapControls";
import MeasureTool from "./MeasureTool";
import { reverseGeocode } from "@/services/gisService";
import { fetchLocationAnalysis, fetchFeatureInfo } from "@/services/gisAnalysisService";
import { resolveMasterPlanZone, resolveZoneWithBackendType, MasterPlanZoneConfig } from "@/utils/zoneResolver";
import DynamicVectorLayer from "./DynamicVectorLayer";
import FeatureDataTable from "./FeatureDataTable";

// Fix missing marker icon issue in Leaflet + Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface OverlayData {
  uploadedGeojson: any;
  overlappingParcels: any[];
}

interface GisMapInnerProps {
  parcels?: Parcel[];
  onSelectParcel?: (parcel: Parcel) => void;
  clickedLocation: ClickedLocation | null;
  setClickedLocation: (loc: ClickedLocation | null) => void;
  targetFlyTo: { lat: number; lng: number; zoom?: number } | null;
  activeQueryLayer?: string;
  overlayData?: OverlayData | null;
  hierarchyBoundary?: any;
  activeRegistryLayers: string[];
  onLayerLoadStart?: (layerId: string) => void;
  onLayerLoadSuccess?: (layerId: string, featureCount?: number, source?: string) => void;
  onLayerLoadError?: (layerId: string, errorMsg: string) => void;
  onLayerFeatureClick?: (properties: any, layerName: string) => void;
}

// Controller to fly map smoothly to target coordinates
function FlyToController({ target }: { target: { lat: number; lng: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom || 13, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Fix map container size calculation on mount
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function GisMapInner({
  parcels = [],
  onSelectParcel,
  clickedLocation,
  setClickedLocation,
  targetFlyTo,
  activeQueryLayer,
  overlayData,
  hierarchyBoundary,
  activeRegistryLayers,
  onLayerLoadStart,
  onLayerLoadSuccess,
  onLayerLoadError,
  onLayerFeatureClick,
}: GisMapInnerProps) {
  const [basemap, setBasemap] = useState<BasemapType>("satellite");
  const [zoneData, setZoneData] = useState<MasterPlanZoneConfig | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Phase 3: Measurement tool state
  const [measureMode, setMeasureMode] = useState<"off" | "distance" | "area">("off");
  const [measureKey, setMeasureKey] = useState(0);

  // Phase 2: Feature info popup for thematic layers
  const [featureInfoPopup, setFeatureInfoPopup] = useState<{
    lat: number;
    lng: number;
    layer: string;
    attributes: Record<string, any>;
  } | null>(null);

  const basemapUrls = {
    osm: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  };

  const basemapAttributions = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    satellite: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    topo: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  };

  useEffect(() => {
    if (!clickedLocation) {
      setZoneData(null);
      setAnalysisData(null);
      return;
    }

    // Step 1: Compute zone from frontend Nominatim data (instant, no API wait)
    const resolvedZoning = resolveMasterPlanZone(
      clickedLocation.lat,
      clickedLocation.lng,
      clickedLocation.displayName,
      clickedLocation.addressDetails
    );
    setZoneData(resolvedZoning);

    // Step 2: Fetch backend analysis (Overpass + Elevation + full data) for more accurate zone
    async function loadZone() {
      try {
        const analysis = await fetchLocationAnalysis(clickedLocation!.lat, clickedLocation!.lng);
        if (analysis) {
          setAnalysisData(analysis);
          if (analysis.zoningMarking?.zoneType) {
            // Backend has a more accurate classification — recompute geometry with correct scope
            const backendZone = resolveZoneWithBackendType(
              clickedLocation!.lat,
              clickedLocation!.lng,
              analysis.zoningMarking.zoneType,
              analysis.zoningMarking
            );
            setZoneData(backendZone);
          }
        }
      } catch (err) {
        console.error("Error loading zone marking:", err);
      }
    }

    loadZone();
  }, [clickedLocation?.lat, clickedLocation?.lng, clickedLocation?.displayName]);

  const handleMapClick = async (lat: number, lng: number) => {
    // Phase 3: Don't process normal clicks while measuring
    if (measureMode !== "off") return;

    // Phase 2: If a thematic layer is active (not parcels), do a feature-info query
    const queryLayer = activeQueryLayer || 'parcels';
    if (queryLayer !== 'parcels') {
      setFeatureInfoPopup(null);
      try {
        const info = await fetchFeatureInfo(queryLayer, lat, lng);
        if (info && info.found) {
          setFeatureInfoPopup({ lat, lng, layer: queryLayer, attributes: info.attributes });
        }
      } catch (err) {
        console.warn('Feature info query failed:', err);
      }
      return;
    }

    // Default parcel/location click behavior
    setFeatureInfoPopup(null);
    setClickedLocation({
      lat,
      lng,
      displayName: `Locating place details...`,
      loading: true,
    });

    const details = await reverseGeocode(lat, lng);
    setClickedLocation({
      lat,
      lng,
      displayName: details.displayName,
      addressDetails: details.addressDetails,
      loading: false,
    });
  };

  const handleClearMeasure = useCallback(() => {
    setMeasureKey((k) => k + 1);
  }, []);

  const survey = analysisData?.cadastralSurvey;
  const tax = analysisData?.propertyTax;
  const court = analysisData?.courtCase;
  const admin = analysisData?.administration;

  // Determine if the clicked location is a broad administrative region boundary
  const locCategory = (clickedLocation?.addressDetails?.category || "").toLowerCase();
  const locType = (clickedLocation?.addressDetails?.type || "").toLowerCase();
  const isState = locCategory === "boundary" && (locType === "state" || locType === "country");
  const isDistrict = locCategory === "boundary" && (locType === "state_district" || locType === "county" || locType === "region" || locType === "administrative");
  const isRegion = isState || isDistrict;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[20.5937, 78.9629]} // Centered on India by default
        zoom={5} // Zoom level covering whole India
        zoomControl={false} // Custom controls used
        className="w-full h-full z-10"
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
      >
        <MapResizeFix />

        <TileLayer
          key={basemap}
          url={basemapUrls[basemap]}
          attribution={basemapAttributions[basemap]}
          maxZoom={19}
        />

        {/* Phase 5: Dynamic GIS Layers from Registry */}
        {activeRegistryLayers.map((layerId) => (
          <DynamicVectorLayer 
            key={layerId} 
            layerId={layerId} 
            onLoadStart={() => onLayerLoadStart?.(layerId)}
            onLoadSuccess={(count, src) => onLayerLoadSuccess?.(layerId, count, src)}
            onLoadError={(msg) => onLayerLoadError?.(layerId, msg)}
            onFeatureClick={(props, layerName) => onLayerFeatureClick?.(props, layerName)}
          />
        ))}

        {basemap === "satellite" && (
          <TileLayer
            key="satellite-labels"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        )}

        {/* FlyTo Helper */}
        <FlyToController target={targetFlyTo} />

        {/* Click Anywhere Event Handler */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Custom Map Control Panel */}
        <MapControls
          currentBasemap={basemap}
          onSelectBasemap={(b) => setBasemap(b)}
          measureMode={measureMode}
          onSetMeasureMode={setMeasureMode}
          onClearMeasure={handleClearMeasure}
          onGoToPoint={handleMapClick}
        />

        {/* Phase 5: Attribute Filter & Data Table */}
        <FeatureDataTable activeLayers={activeRegistryLayers} />

        {/* Phase 3: Measurement Tool */}
        <MeasureTool
          key={measureKey}
          mode={measureMode === "off" ? "distance" : measureMode}
          active={measureMode !== "off"}
        />

        {/* Dynamic Zone Polygon Overlay when a Location is Clicked */}
        {clickedLocation && zoneData && (
          <>
            {/* Render Actual Geographical Boundary if available */}
            {clickedLocation.geojson ? (
              <GeoJSON
                key={`geojson-${clickedLocation.lat}-${clickedLocation.lng}-${zoneData.zoneType}`}
                data={clickedLocation.geojson}
                style={{
                  color: zoneData.color || "#10b981",
                  fillColor: zoneData.fillColor || "#10b981",
                  fillOpacity: 0.15,
                  weight: 3,
                  dashArray: "4, 4",
                }}
              >
                <Tooltip direction="center" className="custom-zone-tooltip shadow-xl border-none">
                  <span className="font-bold text-xs tracking-tight" style={{ color: zoneData.color || "#059669" }}>
                    {zoneData.zoneTitle} Boundary
                  </span>
                </Tooltip>
              </GeoJSON>
            ) : (
              /* Fallback to Synthetic Geometric Polygon */
              zoneData.polygonCoordinates && (
                <Polygon
                  key={`zone-${clickedLocation.lat}-${clickedLocation.lng}-${zoneData.zoneType}`}
                  positions={zoneData.polygonCoordinates}
                  pathOptions={{
                    color: zoneData.color || "#10b981",
                    fillColor: zoneData.fillColor || "#10b981",
                    fillOpacity: 0.35,
                    weight: 3,
                    dashArray: "6, 6",
                  }}
                >
                  <Tooltip permanent direction="top" className="custom-zone-tooltip shadow-xl border-none">
                    <span className="font-bold text-xs tracking-tight" style={{ color: zoneData.color || "#059669" }}>
                      {zoneData.zoneTitle}
                    </span>
                  </Tooltip>
                </Polygon>
              )
            )}
          </>
        )}


        {/* Marker for Clicked GIS Location */}
        {clickedLocation && (
          <Marker position={[clickedLocation.lat, clickedLocation.lng]}>
            <Popup className="text-xs font-sans max-w-xs md:max-w-sm">
              <div className="p-1 space-y-2 min-w-[260px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-slate-900 text-xs">
                      {isRegion ? "REGIONAL JURISDICTION" : "CADASTRAL PARCEL RECORD"}
                    </span>
                  </div>
                  {zoneData && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                      style={{ backgroundColor: zoneData.color || "#10b981" }}
                    >
                      {zoneData.zoneType?.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                {/* Survey & Owner Details (or Regional details) */}
                {isRegion ? (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {(clickedLocation.displayName?.split(",")[0] || admin?.district || admin?.state)?.toUpperCase()}
                        </span>
                        <span className="font-mono text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase">
                          {locType}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-700">
                        <span className="font-semibold text-slate-900 block">{admin?.state || "India"}</span>
                        <span className="text-[10px] text-slate-600">Lat: {clickedLocation.lat.toFixed(4)}° N | Lng: {clickedLocation.lng.toFixed(4)}° E</span>
                      </div>
                    </div>
                  </div>
                ) : survey ? (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-900 text-xs">{survey.surveyNumber}</span>
                        <span className="font-mono text-[9px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                          {survey.ulpin}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-700">
                        <span className="font-semibold text-slate-900 block">Owner: {survey.ownerName}</span>
                        <span className="text-[10px] text-slate-600">Patta: {survey.pattaNumber} | Area: {survey.areaAcres} Acres ({survey.areaSqMeters} m²)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                      <div className="bg-slate-100 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[9px]">Reg Doc No</span>
                        <span className="font-bold text-slate-800">{survey.registrationDocNo?.split('(')[0] || 'Doc Verified'}</span>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[9px]">Guideline Rate</span>
                        <span className="font-bold text-emerald-700">{tax?.guidelineValueSqFt || '₹ 2,500/sqft'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono italic animate-pulse">
                    Fetching land registry survey details...
                  </div>
                )}

                {/* Zoning Details */}
                {zoneData && (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] space-y-0.5">
                    <span className="font-bold block" style={{ color: zoneData.color || "#059669" }}>
                      {zoneData.zoneTitle}
                    </span>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {zoneData.permissibleUse}
                    </p>
                    <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-slate-700 border-t border-slate-200 mt-1">
                      <span>FSI: {zoneData.fsiLimit}</span>
                      <span>Max Height: {zoneData.maxBuildingHeight}</span>
                    </div>
                  </div>
                )}

                {/* Location Address */}
                <div className="text-[10px] text-slate-600 border-t border-slate-200 pt-1.5">
                  <span className="font-mono text-slate-400 block text-[9px]">
                    {clickedLocation.lat.toFixed(6)}° N, {clickedLocation.lng.toFixed(6)}° E
                  </span>
                  <p className="text-slate-800 font-medium leading-tight mt-0.5">
                    {admin ? `${admin.village ? admin.village + ', ' : ''}${admin.subdistrict ? admin.subdistrict + ', ' : ''}${admin.district ? admin.district + ', ' : ''}${admin.state || 'India'} ${admin.pincode ? '- ' + admin.pincode : ''}` : clickedLocation.displayName}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Parcel Polygons if available */}
        {parcels.map((parcel) => {
          if (!parcel?.coordinates || !Array.isArray(parcel.coordinates) || parcel.coordinates.length === 0) {
            return null;
          }

          // Handle GeoJSON Polygon ring structure [[[lng, lat]...]] or simple ring [[lng, lat]...]
          const firstElement = parcel.coordinates[0];
          const rawRing = Array.isArray(firstElement?.[0]) ? firstElement : parcel.coordinates;

          if (!Array.isArray(rawRing) || rawRing.length === 0) {
            return null;
          }

          const positions = rawRing
            .filter((pt): pt is [number, number] => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number')
            .map(([lng, lat]) => [lat, lng] as [number, number]);

          if (positions.length < 3) return null;

          return (
            <Polygon
              key={parcel.ulpin || parcel.id}
              positions={positions}
              pathOptions={{
                color: parcel.verificationStatus === "Verified" ? "#059669" : "#d97706",
                fillColor: parcel.verificationStatus === "Verified" ? "#10b981" : "#f59e0b",
                fillOpacity: 0.25,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelectParcel && onSelectParcel(parcel),
              }}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="font-mono font-bold text-blue-700 block">{parcel.ulpin}</span>
                  <span className="font-semibold text-slate-900">{parcel.currentUse}</span>
                  <span className="text-[10px] block text-slate-500">S.No {parcel.surveyNumber} ({parcel.areaAcres} Acres)</span>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Phase 2: Generic Feature Info Popup for Thematic Layers */}
        {featureInfoPopup && (
          <Marker position={[featureInfoPopup.lat, featureInfoPopup.lng]}>
            <Popup className="text-xs font-sans max-w-xs">
              <div className="p-1.5 space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    <span className="font-bold text-slate-900 text-[11px] uppercase">
                      {featureInfoPopup.layer.replace(/_/g, " ")} Info
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {Object.entries(featureInfoPopup.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-slate-800 font-bold text-right ml-2">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1 font-mono">
                  {featureInfoPopup.lat.toFixed(5)}, {featureInfoPopup.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Phase 5: Overlay — Uploaded Survey in Red */}
        {overlayData?.uploadedGeojson?.features?.length > 0 && (
          <GeoJSON
            key={`overlay-uploaded-${JSON.stringify(overlayData!.uploadedGeojson).length}`}
            data={overlayData!.uploadedGeojson}
            style={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.25,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top">
              <span className="text-[10px] font-bold text-red-600">📤 Uploaded Survey</span>
            </Tooltip>
          </GeoJSON>
        )}

        {/* Phase 5: Overlay — Overlapping Existing Parcels in Blue */}
        {overlayData?.overlappingParcels?.map((parcel: any, idx: number) => {
          if (!parcel.geometry?.coordinates) return null;
          const ring = parcel.geometry.coordinates[0] || [];
          const positions = ring
            .filter((pt: any) => Array.isArray(pt) && pt.length >= 2)
            .map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
          if (positions.length < 3) return null;
          return (
            <Polygon
              key={`overlay-existing-${parcel.ulpin || idx}`}
              positions={positions}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                weight: 3,
                dashArray: "6, 4",
              }}
            >
              <Tooltip permanent direction="bottom">
                <span className="text-[10px] font-bold text-blue-700">🏛️ {parcel.ulpin || 'Existing Parcel'}</span>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Hierarchy Drill-Down: Boundary Highlight */}
        {hierarchyBoundary && (
          <GeoJSON
            key={`hierarchy-boundary-${JSON.stringify(hierarchyBoundary).length}`}
            data={hierarchyBoundary.type ? hierarchyBoundary : { type: 'Feature', geometry: hierarchyBoundary, properties: {} }}
            style={{
              color: "#6366f1",
              fillColor: "#818cf8",
              fillOpacity: 0.08,
              weight: 3,
              dashArray: "10, 6",
            }}
          >
            <Tooltip permanent direction="center" className="custom-zone-tooltip">
              <span className="text-[10px] font-bold text-indigo-700">📍 Selected Boundary</span>
            </Tooltip>
          </GeoJSON>
        )}
      </MapContainer>
    </div>
  );
}

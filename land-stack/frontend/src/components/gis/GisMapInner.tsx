"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { Parcel } from "@/types";
import { ClickedLocation, BasemapType } from "@/types/gis";
import MapClickHandler from "./MapClickHandler";
import MapControls from "./MapControls";
import MeasureTool from "./MeasureTool";
import { reverseGeocode, fetchOverpassFeatureGeometry } from "@/services/gisService";
import { fetchLocationAnalysis, fetchFeatureInfo, fetchHierarchyBoundary, fetchAdminBoundaries } from "@/services/gisAnalysisService";
import { resolveMasterPlanZone, resolveZoneWithBackendType, MasterPlanZoneConfig } from "@/utils/zoneResolver";
import DynamicVectorLayer from "./DynamicVectorLayer";
import FeatureDataTable from "./FeatureDataTable";
import ZoneInfoCard from "./ZoneInfoCard";
import * as turf from "@turf/turf";
import { X } from "lucide-react";

import "leaflet/dist/leaflet.css";

// Fix missing marker icon issue in Leaflet + Next.js
if (typeof window !== "undefined") {
  try {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  } catch (err) {
    console.warn("Leaflet default icon setup notice:", err);
  }
}

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
  activeLayers?: Set<string>;
  onToggleLayer?: (layerId: string) => void;
  isLayerPanelOpen?: boolean;
  onToggleLayerPanel?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  activeQueryLayer?: string;
  overlayData?: OverlayData | null;
  hierarchyBoundary?: any;
  activeRegistryLayers?: string[];
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
      map.flyTo([target.lat, target.lng], target.zoom || 15, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Fix map container size calculation on mount and during sidebar transitions
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    const t1 = setTimeout(handleResize, 100);
    const t2 = setTimeout(handleResize, 350);
    const t3 = setTimeout(handleResize, 600);

    window.addEventListener("resize", handleResize);
    window.addEventListener("transitionend", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    try {
      const container = map.getContainer();
      if (typeof ResizeObserver !== "undefined" && container) {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(container);
      }
    } catch {
      // Ignore if container is not ready
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("transitionend", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [map]);
  return null;
}

// Track zoom level for dynamic tooltip rendering
function ZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    const handleZoom = () => onZoomChange(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, onZoomChange]);
  return null;
}

// Verified TN Districts centroid and approximate polygon coverage
const TN_DISTRICTS_BOUNDARIES = [
  { name: "Kanchipuram", lat: 12.8342, lng: 79.7036, dLat: 0.28, dLng: 0.32 },
  { name: "Chengalpattu", lat: 12.6821, lng: 79.9865, dLat: 0.26, dLng: 0.28 },
  { name: "Thiruvallur", lat: 13.1432, lng: 79.9085, dLat: 0.32, dLng: 0.35 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, dLat: 0.14, dLng: 0.12 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558, dLat: 0.40, dLng: 0.35 },
  { name: "Madurai", lat: 9.9252, lng: 78.1198, dLat: 0.34, dLng: 0.36 },
  { name: "Salem", lat: 11.6643, lng: 78.1460, dLat: 0.38, dLng: 0.38 },
  { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, dLat: 0.36, dLng: 0.40 },
  { name: "Tirunelveli", lat: 8.7139, lng: 77.7567, dLat: 0.35, dLng: 0.35 },
  { name: "Thanjavur", lat: 10.7870, lng: 79.1378, dLat: 0.32, dLng: 0.38 },
  { name: "Erode", lat: 11.3410, lng: 77.7172, dLat: 0.42, dLng: 0.36 },
  { name: "Vellore", lat: 12.9165, lng: 79.1325, dLat: 0.28, dLng: 0.32 },
  { name: "Dindigul", lat: 10.3673, lng: 77.9803, dLat: 0.45, dLng: 0.42 },
  { name: "Cuddalore", lat: 11.7480, lng: 79.7714, dLat: 0.32, dLng: 0.36 },
  { name: "Kanyakumari", lat: 8.0883, lng: 77.5385, dLat: 0.22, dLng: 0.24 },
  { name: "Ramanathapuram", lat: 9.3639, lng: 78.8395, dLat: 0.32, dLng: 0.55 },
  { name: "Virudhunagar", lat: 9.5680, lng: 77.9624, dLat: 0.30, dLng: 0.35 },
  { name: "Karur", lat: 10.9601, lng: 78.0766, dLat: 0.28, dLng: 0.30 },
  { name: "Namakkal", lat: 11.2189, lng: 78.1674, dLat: 0.32, dLng: 0.30 },
  { name: "Nilgiris", lat: 11.4102, lng: 76.6950, dLat: 0.25, dLng: 0.32 },
  { name: "Krishnagiri", lat: 12.5186, lng: 78.2137, dLat: 0.42, dLng: 0.45 },
  { name: "Dharmapuri", lat: 12.1211, lng: 78.1582, dLat: 0.38, dLng: 0.35 },
];

// High-fidelity geographic perimeter coordinates of Tamil Nadu State Boundary
const TAMIL_NADU_STATE_OUTLINE: [number, number][] = [
  [13.53, 80.20], // Pulicat Lake / AP border
  [13.40, 80.12], // Gummidipoondi
  [13.43, 79.95], // Satyavedu border
  [13.35, 79.80], // Uthukkottai
  [13.18, 79.60], // Tiruttani / Arakkonam border
  [13.11, 79.42], // Sholinghur
  [12.98, 79.13], // Katpadi / Ranipet / Chittoor border
  [12.94, 78.87], // Gudiyatham border
  [12.68, 78.62], // Vaniyambadi / Andhra border
  [12.58, 78.52], // Natrampalli / Tirupattur
  [12.75, 78.36], // Kuppam / Krishnagiri border
  [12.75, 77.82], // Hosur / Karnataka border
  [12.58, 77.65], // Denkanikottai / Thally
  [12.12, 77.77], // Hogenakkal / Dharmapuri / Cauvery River
  [11.80, 77.80], // Mettur / Salem hills
  [11.83, 77.30], // Chamrajnagar / Biligiriranga Hills border
  [11.75, 77.10], // Hasanur / Sathyamangalam
  [11.58, 76.60], // Theppakadu / Moyar / Mudumalai
  [11.50, 76.45], // Gudalur / Nilgiris / Wayanad border
  [11.45, 76.54], // Naduvattam / Nilgiris
  [11.35, 76.50], // Ooty / Mukurthi / Silent Valley border
  [11.23, 76.58], // Upper Bhavani / Kundah
  [11.00, 76.68], // Siruvani / Attappadi border
  [10.84, 76.85], // Walayar / Palakkad Gap
  [10.45, 76.85], // Topslip / Parambikulam border
  [10.32, 76.95], // Valparai / Anaimalai
  [10.28, 76.90], // Sholayar border
  [10.32, 77.20], // Chinnar / Amaravathi / Dindigul border
  [10.23, 77.48], // Kodaikanal / Palani Hills
  [10.02, 77.28], // Theni / Bodinayakanur / Munnar border
  [9.60, 77.20],  // Cumbum / Thekkady border
  [9.50, 77.45],  // Megamalai / Srivilliputhur / Rajapalayam
  [9.15, 77.30],  // Sivagiri / Tenkasi / Achankovil border
  [8.98, 77.24],  // Shenkottai / Aryankavu border
  [8.70, 77.30],  // Courtallam / Papanasam hills
  [8.60, 77.32],  // Kalakkad Mundanthurai / Agasthiyamalai
  [8.45, 77.25],  // Pechiparai / Kodayar
  [8.30, 77.17],  // Marthandam / Kaliyakkavilai
  [8.28, 77.10],  // Pozhiyoor / Neendakara coastal border
  [8.18, 77.25],  // Colachel coastline
  [8.08, 77.55],  // Kanyakumari (Cape Comorin)
  [8.17, 77.68],  // Radhapuram / Koodankulam
  [8.28, 77.90],  // Uvari / Tisayanvilai coast
  [8.49, 78.12],  // Tiruchendur
  [8.78, 78.14],  // Thoothukudi (Tuticorin)
  [9.08, 78.36],  // Vembar / Kulathur coast
  [9.20, 78.50],  // Sayalgudi coast
  [9.23, 78.78],  // Kilakarai
  [9.28, 79.13],  // Mandapam / Pamban
  [9.28, 79.31],  // Rameswaram
  [9.18, 79.52],  // Dhanushkodi / Arichal Munai
  [9.28, 79.13],  // Mandapam
  [9.48, 78.90],  // Devipattinam
  [9.74, 79.02],  // Tondi / Palk Bay
  [10.04, 79.25], // Manamelkudi
  [10.35, 79.50], // Muthupet
  [10.29, 79.85], // Point Calimere (Kodikkarai)
  [10.37, 79.85], // Vedaranyam
  [10.68, 79.85], // Velankanni
  [10.76, 79.84], // Nagapattinam
  [10.92, 79.83], // Karaikal border
  [11.03, 79.85], // Tarangambadi
  [11.14, 79.85], // Poompuhar / Sirkazhi
  [11.49, 79.78], // Pichavaram mangroves
  [11.75, 79.77], // Cuddalore
  [11.93, 79.83], // Puducherry coast
  [12.20, 79.95], // Marakkanam / Kaliveli
  [12.62, 80.19], // Mamallapuram
  [12.79, 80.25], // Kovalam
  [13.08, 80.28], // Chennai Marina
  [13.25, 80.33], // Ennore / Kattupalli
  [13.53, 80.20], // Pulicat Lake
];

export default function GisMapInner({
  parcels = [],
  onSelectParcel,
  clickedLocation,
  setClickedLocation,
  targetFlyTo,
  activeLayers = new Set(["cadastral_parcels"]),
  onToggleLayer,
  isLayerPanelOpen = false,
  onToggleLayerPanel,
  isFullscreen = false,
  onToggleFullscreen,
  activeQueryLayer,
  overlayData,
  hierarchyBoundary,
  activeRegistryLayers = [],
  onLayerLoadStart,
  onLayerLoadSuccess,
  onLayerLoadError,
  onLayerFeatureClick,
}: GisMapInnerProps) {
  const [currentZoom, setCurrentZoom] = useState(7);
  const [zoneData, setZoneData] = useState<MasterPlanZoneConfig | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [zoneLoading, setZoneLoading] = useState(false);
  // Holds the precise Overpass polygon (upgraded async after click)
  const [overpassBoundaryGeojson, setOverpassBoundaryGeojson] = useState<any>(null);

  // Measurement tool state
  const [measureMode, setMeasureMode] = useState<"off" | "distance" | "area" | "select_zone">("off");
  const [measureKey, setMeasureKey] = useState(0);
  const [selectedZoneParcels, setSelectedZoneParcels] = useState<Parcel[]>([]);
  const [selectedZoneArea, setSelectedZoneArea] = useState<{ value: number, unit: string } | null>(null);

  // Feature info popup for thematic layers
  const [featureInfoPopup, setFeatureInfoPopup] = useState<{
    lat: number;
    lng: number;
    layer: string;
    attributes: Record<string, any>;
  } | null>(null);

  // Administrative Boundaries GeoJSON
  const [adminDistrictGeoJSON, setAdminDistrictGeoJSON] = useState<any>(null);

  // Determine basemap based on activeLayers:
  // If satellite_imagery is checked -> satellite basemap, otherwise -> clean DPI vector Carto Voyager basemap
  const isSatelliteBasemap = activeLayers.has("satellite_imagery");

  const basemapUrls = {
    osm: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const basemapAttributions = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    satellite: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  };

  // Load Administrative Boundaries when checked
  useEffect(() => {
    if (activeLayers.has("administrative_boundary") && !adminDistrictGeoJSON) {
      fetchAdminBoundaries("districts")
        .then((data) => {
          if (data && data.features && data.features.length > 0) {
            setAdminDistrictGeoJSON(data);
          }
        })
        .catch((err) => console.warn("Could not load backend district boundaries:", err));
    }
  }, [activeLayers, adminDistrictGeoJSON]);

  useEffect(() => {
    if (!clickedLocation) {
      setZoneData(null);
      setAnalysisData(null);
      setZoneLoading(false);
      setOverpassBoundaryGeojson(null);
      return;
    }

    // Step 1: Compute zone from frontend Nominatim data (instant — gives immediate feedback)
    // This is the AUTHORITATIVE zone classification based on place name keyword matching.
    const resolvedZoning = resolveMasterPlanZone(
      clickedLocation.lat,
      clickedLocation.lng,
      clickedLocation.displayName,
      clickedLocation.addressDetails
    );
    setZoneData(resolvedZoning);
    setZoneLoading(true);

    // Step 2: Fetch backend analysis (Overpass + Elevation) for supplementary data only.
    // The backend zone ONLY overrides if the frontend fell back to AGRI_ZONE (generic default)
    // AND the backend has a more specific classification.
    // This prevents the zone from randomly changing after the backend API responds.
    const frontendZoneType = resolvedZoning.zoneType;

    async function loadZone() {
      try {
        const analysis = await fetchLocationAnalysis(clickedLocation!.lat, clickedLocation!.lng);
        if (analysis) {
          setAnalysisData(analysis);

          const backendZoneType: string = analysis.zoningMarking?.zoneType || "";
          const isFrontendGeneric = frontendZoneType === "AGRI_ZONE";
          const isBackendSpecific = backendZoneType && backendZoneType !== "AGRI_ZONE";

          // Only let backend override if frontend was stuck on the generic fallback
          if (isFrontendGeneric && isBackendSpecific) {
            const backendZone = resolveZoneWithBackendType(
              clickedLocation!.lat,
              clickedLocation!.lng,
              backendZoneType,
              analysis.zoningMarking,
              clickedLocation!.addressDetails
            );
            setZoneData(backendZone);
          }
          // Otherwise: keep the frontend-resolved zone as-is — backend supplements data only
        }
      } catch (err) {
        console.error("Error loading zone marking:", err);
      } finally {
        setZoneLoading(false);
      }
    }

    loadZone();
  }, [clickedLocation?.lat, clickedLocation?.lng, clickedLocation?.displayName]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (measureMode !== "off") return;
    
    // Clear zone selection if clicked outside
    if (selectedZoneParcels.length > 0) {
      setSelectedZoneParcels([]);
      setSelectedZoneArea(null);
    }

    const queryLayer = activeQueryLayer || "parcels";
    if (queryLayer !== "parcels") {
      setFeatureInfoPopup(null);
      try {
        const info = await fetchFeatureInfo(queryLayer, lat, lng);
        if (info && info.found) {
          setFeatureInfoPopup({ lat, lng, layer: queryLayer, attributes: info.attributes });
        }
      } catch (err) {
        console.warn("Feature info query failed:", err);
      }
      return;
    }

    setFeatureInfoPopup(null);
    setClickedLocation({
      lat,
      lng,
      displayName: "Identifying official parcel...",
      loading: true,
    });

    try {
      // 1. Identify official land parcel from PostGIS
      const res = await fetch(`http://localhost:5000/api/v1/parcels/identify?lat=${lat}&lng=${lng}`);
      const identifyData = await res.json();

      if (identifyData && identifyData.success && identifyData.parcelStatus === 'IDENTIFIED' && identifyData.parcel) {
        // Real parcel found — open ParcelInspector with enriched data
        const enhancedParcel = {
          ...identifyData.parcel,
          _identifyIntelligence: {
            boundaryStatus: identifyData.boundaryStatus,
            geometrySource: identifyData.geometrySource,
            areaSqM: identifyData.areaSqM,
            perimeterM: identifyData.perimeterM,
            requiresSurveyVerification: identifyData.requiresSurveyVerification,
            message: identifyData.message,
          },
        };
        if (onSelectParcel) {
          onSelectParcel(enhancedParcel);
        }
        // Clear location so we don't also show LocationInspector/ZoneInfoCard
        setClickedLocation(null);
        return;
      }
      // If parcel not found or geometry unavailable — fall through to reverse geocode below
    } catch (err) {
      console.warn("Failed to hit identify API, falling back to reverse geocode:", err);
    }


    // Fallback if not hitting a parcel — reverse geocode for place name + address only
    const details = await reverseGeocode(lat, lng);
    const nominatimGeojson = details.geojson;

    // ── Phase 1: Evaluate Nominatim polygon ──────────────────────────────────
    // Keep Nominatim polygon only if it is a FEATURE (not an administrative boundary)
    // and it is reasonably compact (< 0.09° span ≈ 10km)
    let boundaryGeojson: any = null;
    const cat = (details.addressDetails?.category || "").toLowerCase();
    const nomType = (details.addressDetails?.type || "").toLowerCase();
    const isAdminBoundary =
      cat === "boundary" ||
      nomType === "administrative" ||
      nomType === "state" ||
      nomType === "county" ||
      nomType === "district" ||
      nomType === "postcode" ||
      nomType === "country" ||
      nomType === "subdistrict" ||
      nomType === "state_district";

    if (nominatimGeojson && !isAdminBoundary) {
      const isPolyGeom =
        nominatimGeojson.type === "Polygon" || nominatimGeojson.type === "MultiPolygon" ||
        nominatimGeojson.geometry?.type === "Polygon" || nominatimGeojson.geometry?.type === "MultiPolygon";
      if (isPolyGeom) {
        const coords: number[][] = [];
        const collectCoords = (g: any) => {
          if (!g) return;
          if (g.type === "Polygon") g.coordinates.flat().forEach((c: number[]) => coords.push(c));
          else if (g.type === "MultiPolygon") g.coordinates.flat(2).forEach((c: number[]) => coords.push(c));
          else if (g.geometry) collectCoords(g.geometry);
        };
        collectCoords(nominatimGeojson);
        if (coords.length > 0) {
          const lngs = coords.map(c => c[0]);
          const lats = coords.map(c => c[1]);
          const spanLat = Math.max(...lats) - Math.min(...lats);
          const spanLng = Math.max(...lngs) - Math.min(...lngs);
          if (spanLat < 0.09 && spanLng < 0.09) {
            boundaryGeojson = nominatimGeojson;
          }
        }
      }
    }

    // ── Phase 2: Set location immediately (fast UX) ──────────────────────────
    setClickedLocation({
      lat,
      lng,
      displayName: details.displayName,
      addressDetails: details.addressDetails,
      geojson: boundaryGeojson,
      _osmType: details._osmType,
      _osmId: details._osmId,
      _nominatimCategory: details._nominatimCategory,
      _nominatimType: details._nominatimType,
      loading: false,
    });

    // ── Phase 3: Async Overpass fetch — upgrade to exact OSM polygon boundary ─
    // Always fires for every click — is_in() only needs lat/lng, not osmId
    setOverpassBoundaryGeojson(null); // Clear previous boundary immediately
    fetchOverpassFeatureGeometry(
      details._osmType as string || "node",
      details._osmId as number || 0,
      lat,
      lng
    ).then((overpassGeojson) => {
      if (overpassGeojson) {
        setOverpassBoundaryGeojson(overpassGeojson);
      }
    }).catch(() => { /* silent fail — keep Nominatim boundary */ });

  };

  const handleClearMeasure = useCallback(() => {
    setMeasureKey((k) => k + 1);
    setSelectedZoneParcels([]);
    setSelectedZoneArea(null);
  }, []);

  const survey = analysisData?.cadastralSurvey;
  const tax = analysisData?.propertyTax;
  const admin = analysisData?.administration;

  const locCategory = (clickedLocation?.addressDetails?.category || "").toLowerCase();
  const locType = (clickedLocation?.addressDetails?.type || "").toLowerCase();
  const isState = locCategory === "boundary" && (locType === "state" || locType === "country");
  const isDistrict = locCategory === "boundary" && (locType === "state_district" || locType === "county" || locType === "region" || locType === "administrative");
  const isRegion = isState || isDistrict;

  // Layer switches
  const showCadastralParcels = activeLayers.has("cadastral_parcels");
  const showRoadNetwork = activeLayers.has("road_network");
  const showAdminBoundaries = activeLayers.has("administrative_boundary");
  const showDisputes = activeLayers.has("gov_disputes");
  const showZoning = activeLayers.has("plan_zoning") || activeLayers.has("plan_master_plan");
  const showValuation = activeLayers.has("fiscal_valuation");
  const showWater = activeLayers.has("infra_water");
  const showFloodHazard = activeLayers.has("env_flood_hazard");

  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)] relative">
      <MapContainer
        center={[11.1271, 78.6569]} // Centered on Tamil Nadu
        zoom={7} // Zoom level covering Tamil Nadu
        zoomControl={false}
        className="w-full h-full z-10"
        style={{ width: "100%", height: "100%", minHeight: "calc(100vh - 64px)" }}
      >
        <MapResizeFix />
        <ZoomTracker onZoomChange={setCurrentZoom} />

        {/* 1. BASEMAP TILE LAYER */}
        <TileLayer
          key={isSatelliteBasemap ? "satellite" : "osm"}
          url={isSatelliteBasemap ? basemapUrls.satellite : basemapUrls.osm}
          attribution={isSatelliteBasemap ? basemapAttributions.satellite : basemapAttributions.osm}
          maxZoom={19}
        />

        {/* Satellite Labels Overlay */}
        {isSatelliteBasemap && (
          <TileLayer
            key="satellite-labels"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        )}

        {/* 2. ROAD NETWORK TILE OVERLAY (When "Road Network" is active) */}
        {showRoadNetwork && (
          <TileLayer
            key="roads-network-overlay"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.65}
            maxZoom={19}
          />
        )}

        {/* 3. ADMINISTRATIVE BOUNDARIES (When "Administrative Boundary" is active) */}
        {showAdminBoundaries && (
          <>
            {/* High-Precision Tamil Nadu State Outer Boundary */}
            <Polygon
              key="tn-state-outer-boundary"
              positions={TAMIL_NADU_STATE_OUTLINE}
              pathOptions={{
                color: "#1D5FD1",
                fillColor: "#1D5FD1",
                fillOpacity: 0.04,
                weight: 2.5,
                dashArray: "8, 4",
              }}
            >
              <Tooltip direction="center" permanent={false}>
                <span className="font-bold text-xs text-[#1D5FD1]">
                  Tamil Nadu State Administrative Boundary
                </span>
              </Tooltip>
            </Polygon>

            {adminDistrictGeoJSON?.features ? (
              <GeoJSON
                key="admin-districts-geojson"
                data={adminDistrictGeoJSON}
                style={{
                  color: "#4f46e5",
                  fillColor: "#6366f1",
                  fillOpacity: 0.05,
                  weight: 2,
                  dashArray: "6, 4",
                }}
              />
            ) : (
              // High-fidelity fallback district boundaries
              TN_DISTRICTS_BOUNDARIES.map((d) => (
                <Polygon
                  key={`dist-${d.name}`}
                  positions={[
                    [d.lat - d.dLat, d.lng - d.dLng],
                    [d.lat + d.dLat * 0.9, d.lng - d.dLng * 0.95],
                    [d.lat + d.dLat * 1.05, d.lng + d.dLng],
                    [d.lat - d.dLat * 0.95, d.lng + d.dLng * 1.05],
                    [d.lat - d.dLat, d.lng - d.dLng],
                  ]}
                  pathOptions={{
                    color: "#4338ca",
                    fillColor: "#6366f1",
                    fillOpacity: 0.04,
                    weight: 2,
                    dashArray: "6, 5",
                  }}
                >
                  <Tooltip direction="center" permanent={currentZoom < 11} className="district-boundary-tooltip">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-[#4338ca]">
                      {d.name} District
                    </span>
                  </Tooltip>
                </Polygon>
              ))
            )}
          </>
        )}

        {/* 4. CADASTRAL PARCELS (When "Cadastral Parcels" is active) */}
        {showCadastralParcels &&
          parcels.map((parcel) => {
            if (!parcel?.coordinates || !Array.isArray(parcel.coordinates) || parcel.coordinates.length === 0) {
              return null;
            }

            const firstElement = parcel.coordinates[0];
            const rawRing = Array.isArray(firstElement?.[0]) ? firstElement : parcel.coordinates;

            if (!Array.isArray(rawRing) || rawRing.length === 0) {
              return null;
            }

            const positions = rawRing
              .filter((pt): pt is [number, number] => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === "number" && typeof pt[1] === "number")
              .map(([lng, lat]) => [lat, lng] as [number, number]);

            if (positions.length < 3) return null;

            const isDisputed = parcel.encumbranceStatus === "Disputed" || parcel.courtCaseDetails?.status?.includes("Stay");

            // THEMATIC COLOR CALCULATION
            let strokeColor = "#1D5FD1";
            let fillColor = "#3B82F6";
            let fillOpacity = 0.25;

            if (showDisputes && isDisputed) {
              strokeColor = "#D9363E";
              fillColor = "#EF4444";
              fillOpacity = 0.45;
            } else if (showZoning) {
              const zone = parcel.currentUse?.toLowerCase() || "";
              if (zone.includes("industrial") || zone.includes("sipcot")) {
                strokeColor = "#6366F1";
                fillColor = "#818CF8";
              } else if (zone.includes("commercial") || zone.includes("cbd")) {
                strokeColor = "#E99A16";
                fillColor = "#FBBF24";
              } else if (zone.includes("eco") || zone.includes("forest")) {
                strokeColor = "#06B6D4";
                fillColor = "#22D3EE";
              } else {
                strokeColor = "#16845B";
                fillColor = "#10B981";
              }
            } else if (showValuation) {
              const val = parcel.areaAcres;
              strokeColor = val > 15 ? "#16845B" : val > 5 ? "#1D5FD1" : "#E99A16";
              fillColor = strokeColor;
            } else if (parcel.verificationStatus === "Verified") {
              strokeColor = "#16845B";
              fillColor = "#10B981";
            }

            return (
              <Polygon
                key={parcel.ulpin || parcel.id}
                positions={positions}
                pathOptions={{
                  color: strokeColor,
                  fillColor: fillColor,
                  fillOpacity: fillOpacity,
                  weight: isDisputed && showDisputes ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => {
                    if (onSelectParcel) {
                      onSelectParcel(parcel);
                    }
                  },
                }}
              >
                {/* Survey Number & ULPIN Display */}
                <Tooltip direction="center" permanent={currentZoom >= 13} className="custom-parcel-tooltip">
                  <div className="bg-white/95 px-1.5 py-0.5 rounded shadow-xs border border-[#E3E8EF] text-center pointer-events-none">
                    <span className="font-bold text-[10px] text-[#102A43] block leading-tight">
                      S.No {parcel.surveyNumber}
                    </span>
                    <span className="font-mono text-[8px] font-semibold text-[#1D5FD1] block leading-tight">
                      {parcel.ulpin}
                    </span>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[220px] text-xs font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-[#102A43]">S.No {parcel.surveyNumber}</span>
                      <span className="font-mono text-[10px] bg-[#F1F5FB] text-[#1D5FD1] px-1.5 py-0.5 rounded font-bold">
                        {parcel.ulpin}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <div>Owner: <strong className="text-[#102A43]">{parcel.ownerName}</strong></div>
                      <div>Location: {parcel.village}, {parcel.district}</div>
                      <div>Area: <strong>{parcel.areaAcres} Acres</strong></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectParcel && onSelectParcel(parcel)}
                      className="w-full mt-1 px-2 py-1 bg-[#1D5FD1] hover:bg-[#154CB0] text-white font-semibold text-[11px] rounded transition-colors text-center"
                    >
                      Open Parcel Information →
                    </button>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* 5. Dynamic GIS Layers from Registry */}
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

        {/* FlyTo Helper */}
        <FlyToController target={targetFlyTo} />

        {/* Click Anywhere Event Handler */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* MAP CONTROLS (Zoom In, Zoom Out, Satellite Toggle, Locate, Measure, Layer Control, Fullscreen) */}
        <MapControls
          currentBasemap={isSatelliteBasemap ? "satellite" : "osm"}
          onToggleBasemap={() => onToggleLayer && onToggleLayer("satellite_imagery")}
          measureMode={measureMode}
          onSetMeasureMode={setMeasureMode}
          onClearMeasure={handleClearMeasure}
          onGoToPoint={handleMapClick}
          isLayerPanelOpen={isLayerPanelOpen}
          onToggleLayerPanel={onToggleLayerPanel}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />

        {/* Measurement Tool */}
        <MeasureTool
          key={measureKey}
          mode={measureMode === "off" ? "distance" : measureMode}
          active={measureMode !== "off"}
          onMeasurementComplete={(val, unit, geom) => {
            if (measureMode === "select_zone" && geom) {
              const intersecting = parcels.filter(p => {
                if (!p.coordinates || p.coordinates.length === 0) return false;
                const firstElement = p.coordinates[0];
                const rawRing = Array.isArray(firstElement?.[0]) ? firstElement : p.coordinates;
                if (!Array.isArray(rawRing) || rawRing.length < 3) return false;

                const positions = rawRing
                  .filter((pt): pt is [number, number] => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === "number" && typeof pt[1] === "number")
                  .map(([lng, lat]) => [lng, lat] as [number, number]);
                
                if (positions.length < 3) return false;
                // turf requires first and last positions to be the same to close the polygon ring
                if (positions[0][0] !== positions[positions.length - 1][0] || positions[0][1] !== positions[positions.length - 1][1]) {
                  positions.push(positions[0]);
                }

                try {
                  const parcelPoly = turf.polygon([positions]);
                  return turf.booleanIntersects(geom, parcelPoly);
                } catch (e) {
                  return false;
                }
              });
              setSelectedZoneParcels(intersecting);
              setSelectedZoneArea({ value: val, unit });
            }
          }}
        />

        {/* Dynamic Zone Polygon Overlay when a Location is Clicked */}
        {clickedLocation && (() => {
          // Priority: 1) Overpass exact polygon  2) Nominatim polygon  3) Circular buffer fallback
          const activeBoundaryGeojson = overpassBoundaryGeojson || clickedLocation.geojson;
          return (
            <>
              {activeBoundaryGeojson ? (
                <GeoJSON
                  key={`geojson-${clickedLocation.lat}-${clickedLocation.lng}-${overpassBoundaryGeojson ? "overpass" : "nominatim"}`}
                  data={
                    activeBoundaryGeojson.type === "Feature" || activeBoundaryGeojson.type === "FeatureCollection"
                      ? activeBoundaryGeojson
                      : { type: "Feature", geometry: activeBoundaryGeojson, properties: {} }
                  }
                  style={{
                    color: zoneData?.color || "#4f46e5",
                    fillColor: zoneData?.fillColor || "#6366f1",
                    fillOpacity: overpassBoundaryGeojson ? 0.15 : 0.18,
                    weight: overpassBoundaryGeojson ? 3.5 : 3,
                    dashArray: overpassBoundaryGeojson ? "none" : "6, 4",
                  }}
                >
                  <Tooltip direction="center" className="custom-zone-tooltip shadow-xl border-none">
                    <span className="font-bold text-xs tracking-tight" style={{ color: zoneData?.color || "#4f46e5" }}>
                      {zoneData?.zoneTitle || clickedLocation.addressDetails?.city || clickedLocation.addressDetails?.district || "Zone"} Boundary
                      {overpassBoundaryGeojson && " ✓"}
                    </span>
                  </Tooltip>
                </GeoJSON>
              ) : (
                zoneData?.polygonCoordinates && (
                  <Polygon
                    key={`zone-${clickedLocation.lat}-${clickedLocation.lng}-${zoneData.zoneType}`}
                    positions={zoneData.polygonCoordinates}
                    pathOptions={{
                      color: zoneData.color || "#10b981",
                      fillColor: zoneData.fillColor || "#10b981",
                      fillOpacity: 0.18,
                      weight: 2.5,
                      dashArray: "8, 5",
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


            {/* Marker for Clicked GIS Location */}
            <Marker position={[clickedLocation.lat, clickedLocation.lng]}>
              <Popup className="text-xs font-sans max-w-xs md:max-w-sm">
                <div className="p-1 space-y-2 min-w-[260px]">
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
                          <span className="font-semibold text-slate-900 block">{admin?.state || "Tamil Nadu"}</span>
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
                          <span className="text-[10px] text-slate-600">Patta: {survey.pattaNumber} | Area: {survey.areaAcres} Acres</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-mono italic animate-pulse">
                      Fetching land registry survey details...
                    </div>
                  )}

                  <div className="text-[10px] text-slate-600 border-t border-slate-200 pt-1.5">
                    <span className="font-mono text-slate-400 block text-[9px]">
                      {clickedLocation.lat.toFixed(6)}° N, {clickedLocation.lng.toFixed(6)}° E
                    </span>
                    <p className="text-slate-800 font-medium leading-tight mt-0.5">
                      {clickedLocation.displayName}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        );
      })()}

        {/* Feature Info Popup */}
        {featureInfoPopup && (
          <Marker position={[featureInfoPopup.lat, featureInfoPopup.lng]}>
            <Popup className="text-xs font-sans max-w-xs">
              <div className="p-1.5 space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-900 text-[11px] uppercase">
                    {featureInfoPopup.layer.replace(/_/g, " ")} Info
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(featureInfoPopup.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-slate-800 font-bold text-right ml-2">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hierarchy Boundary Highlight */}
        {hierarchyBoundary && (
          <GeoJSON
            key={`hierarchy-boundary-${JSON.stringify(hierarchyBoundary).length}`}
            data={hierarchyBoundary.type ? hierarchyBoundary : { type: "Feature", geometry: hierarchyBoundary, properties: {} }}
            style={{
              color: "#6366f1",
              fillColor: "#818cf8",
              fillOpacity: 0.08,
              weight: 3,
              dashArray: "10, 6",
            }}
          >
            <Tooltip permanent direction="center">
              <span className="text-[10px] font-bold text-indigo-700">📍 Selected Boundary</span>
            </Tooltip>
          </GeoJSON>
        )}
      </MapContainer>

      {/* Selected Zone Details Overlay */}
      {measureMode === "select_zone" && selectedZoneArea !== null && (
        <div className="absolute top-20 right-4 z-[2000] w-80 bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden max-h-[60vh]">
          <div className="bg-[#8B5CF6] text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm">Zone Analysis</h3>
            <button 
              onClick={() => {
                setSelectedZoneParcels([]);
                setSelectedZoneArea(null);
                handleClearMeasure();
              }}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Parcels Inside</p>
              <p className="text-xl font-bold text-slate-800">{selectedZoneParcels.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Zone Area</p>
              <p className="text-xl font-bold text-slate-800">
                {selectedZoneArea?.value.toFixed(2)} {selectedZoneArea?.unit === "hectares" ? "ha" : "sqm"}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {selectedZoneParcels.map((p, idx) => (
              <div 
                key={p.ulpin || idx} 
                className="bg-white border border-slate-200 p-2.5 rounded-md shadow-sm hover:border-[#8B5CF6] cursor-pointer transition-colors"
                onClick={() => onSelectParcel && onSelectParcel(p)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-xs font-bold text-slate-700">{p.ulpin}</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-600">S.No {p.surveyNumber}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{p.ownerName}</p>
                <p className="text-[10px] text-slate-500 mt-1">{p.areaAcres} Acres • {p.currentUse}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone Info Card — shown when a location is clicked (instantly with frontend zone, then upgraded by backend) */}
      {clickedLocation && !clickedLocation.loading && zoneData && (
        <ZoneInfoCard
          location={clickedLocation}
          zoneData={zoneData}
          analysisData={analysisData}
          loading={zoneLoading}
          onClose={() => setClickedLocation(null)}
        />
      )}

      {/* Attribute Filter & Data Table (Rendered outside MapContainer) */}
      <FeatureDataTable activeLayers={activeRegistryLayers} />
    </div>
  );
}
